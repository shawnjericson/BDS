import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CalculateCommissionDto, 
  CommissionResult, 
  CommissionPolicy 
} from './dto/calculate-commission.dto';

@Injectable()
export class CommissionService {
  constructor(public prisma: PrismaService) {}

  /**
   * Tính commission theo flow Option A (Priority)
   * Theo thứ tự ưu tiên: Bán trực tiếp → Người giới thiệu → Đầu chủ → QLKD → QLSP/DA → QLKV
   */
  async calculateCommission(dto: CalculateCommissionDto): Promise<CommissionResult> {
    const {
      gross_value,
      commission_pool_rate,
      rates,
      policy = CommissionPolicy.PRIORITY,
      rounding_unit = 1000,
    } = dto;

    // 1. Tính commission pool
    const commission_pool = gross_value * commission_pool_rate;

    // 2. Tính hoa hồng đề xuất cho từng vai trò
    const proposed = {
      direct_sales: gross_value * rates.rate_direct_sales,
      referrer: gross_value * rates.rate_referrer,
      head_owner: gross_value * rates.rate_head_owner,
      mgr_sales: gross_value * rates.rate_mgr_sales,
      mgr_product: gross_value * rates.rate_mgr_product,
      mgr_region: gross_value * rates.rate_mgr_region,
    };

    // 3. Loại bỏ vai trò không có user_id (set = 0)
    if (!dto.direct_sales_user_id) proposed.direct_sales = 0;
    if (!dto.referrer_user_id) proposed.referrer = 0;
    if (!dto.head_owner_user_id) proposed.head_owner = 0;
    if (!dto.mgr_sales_user_id) proposed.mgr_sales = 0;
    if (!dto.mgr_product_user_id) proposed.mgr_product = 0;
    if (!dto.mgr_region_user_id) proposed.mgr_region = 0;

    const commission_proposed_total = Object.values(proposed).reduce((sum, val) => sum + val, 0);

    let allocations = { ...proposed };
    let k_factor: number | undefined;

    // 4. Kiểm tra vượt quỹ và áp dụng policy
    if (commission_proposed_total > commission_pool) {
      if (policy === CommissionPolicy.PRIORITY) {
        // Option A: Theo thứ tự ưu tiên
        allocations = this.allocateByPriority(proposed, commission_pool);
      } else {
        // Option B: Co giãn tỉ lệ (prorate)
        k_factor = commission_pool / commission_proposed_total;
        allocations = {
          direct_sales: proposed.direct_sales * k_factor,
          referrer: proposed.referrer * k_factor,
          head_owner: proposed.head_owner * k_factor,
          mgr_sales: proposed.mgr_sales * k_factor,
          mgr_product: proposed.mgr_product * k_factor,
          mgr_region: proposed.mgr_region * k_factor,
        };
      }
    }

    // 5. Áp dụng làm tròn
    allocations = this.applyRounding(allocations, rounding_unit);

    // 6. Tính tổng đã chi và còn lại
    const commission_paid_total = Object.values(allocations).reduce((sum, val) => sum + val, 0);
    const commission_remaining = commission_pool - commission_paid_total;

    return {
      commission_pool,
      commission_paid_total,
      commission_remaining,
      allocations,
      k_factor,
      policy_used: policy,
    };
  }

  /**
   * Option A: Phân bổ theo thứ tự ưu tiên
   * Thứ tự: direct_sales → referrer → head_owner → mgr_sales → mgr_product → mgr_region
   */
  private allocateByPriority(
    proposed: Record<string, number>,
    available_pool: number
  ): { direct_sales: number; referrer: number; head_owner: number; mgr_sales: number; mgr_product: number; mgr_region: number; } {
    const priority_order = [
      'direct_sales',
      'referrer', 
      'head_owner',
      'mgr_sales',
      'mgr_product',
      'mgr_region'
    ];

    const allocations = {
      direct_sales: 0,
      referrer: 0,
      head_owner: 0,
      mgr_sales: 0,
      mgr_product: 0,
      mgr_region: 0,
    };

    let remaining_pool = available_pool;

    for (const role of priority_order) {
      if (remaining_pool <= 0) break;
      
      const proposed_amount = proposed[role] || 0;
      const allocated_amount = Math.min(proposed_amount, remaining_pool);
      
      allocations[role] = allocated_amount;
      remaining_pool -= allocated_amount;
    }

    return allocations;
  }

  /**
   * Áp dụng làm tròn theo rounding_unit
   */
  private applyRounding(
    allocations: { direct_sales: number; referrer: number; head_owner: number; mgr_sales: number; mgr_product: number; mgr_region: number; },
    rounding_unit: number
  ): { direct_sales: number; referrer: number; head_owner: number; mgr_sales: number; mgr_product: number; mgr_region: number; } {
    return {
      direct_sales: Math.round(allocations.direct_sales / rounding_unit) * rounding_unit,
      referrer: Math.round(allocations.referrer / rounding_unit) * rounding_unit,
      head_owner: Math.round(allocations.head_owner / rounding_unit) * rounding_unit,
      mgr_sales: Math.round(allocations.mgr_sales / rounding_unit) * rounding_unit,
      mgr_product: Math.round(allocations.mgr_product / rounding_unit) * rounding_unit,
      mgr_region: Math.round(allocations.mgr_region / rounding_unit) * rounding_unit,
    };
  }

  /**
   * Tạo commission payout records và cập nhật wallet
   * TODO: Uncomment after running migration for CommissionPayout model
   */
  async executeCommissionPayout(
    dto: CalculateCommissionDto,
    result: CommissionResult,
    transaction_ref_id: number,
    transaction_type: string = 'BOOKING'
  ) {
    const user_mappings = {
      direct_sales: dto.direct_sales_user_id,
      referrer: dto.referrer_user_id,
      head_owner: dto.head_owner_user_id,
      mgr_sales: dto.mgr_sales_user_id,
      mgr_product: dto.mgr_product_user_id,
      mgr_region: dto.mgr_region_user_id,
    };

    return this.prisma.$transaction(async (prisma) => {
      const payout_records: any[] = [];

      // Tạo commission payout records
      for (const [role, amount] of Object.entries(result.allocations)) {
        if (amount > 0) {
          const user_id = user_mappings[role];
          if (user_id) {
            // TODO: Uncomment after migration
            // const payout = await prisma.commissionPayout.create({
            //   data: {
            //     transactionRefId: transaction_ref_id,
            //     transactionType: transaction_type,
            //     role: role.toUpperCase(),
            //     userId: user_id,
            //     amountFinal: amount,
            //     amountOriginal: dto.gross_value * dto.rates[`rate_${role}`],
            //     kFactor: result.k_factor || 1,
            //     policyUsed: result.policy_used,
            //     commissionPool: result.commission_pool,
            //     note: `Commission ${role} for ${transaction_type} #${transaction_ref_id}`,
            //   },
            // });

            // payout_records.push(payout);

            // Cập nhật wallet
            await this.updateUserWallet(prisma, user_id, amount, transaction_ref_id, role);
          }
        }
      }

      return {
        payout_records,
        commission_result: result,
      };
    });
  }

  /**
   * Cập nhật wallet của user
   */
  private async updateUserWallet(
    prisma: any,
    user_id: number,
    amount: number,
    ref_id: number,
    role: string
  ) {
    // Tìm hoặc tạo wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: user_id },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user_id,
          balance: 0,
        },
      });
    }

    const new_balance = Number(wallet.balance) + amount;

    // Tạo wallet transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount: amount,
        type: this.getTransactionType(role),
        refId: ref_id,
        description: `Commission ${role} from transaction #${ref_id}`,
        balanceAfter: new_balance,
      },
    });

    // Cập nhật wallet balance
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: new_balance },
    });
  }

  /**
   * Map role to transaction type
   */
  private getTransactionType(role: string): string {
    const type_mapping = {
      direct_sales: 'COMMISSION_DIRECT',
      referrer: 'COMMISSION_REFERRAL',
      head_owner: 'COMMISSION_OWNER',
      mgr_sales: 'COMMISSION_MANAGER_SALES',
      mgr_product: 'COMMISSION_MANAGER_PRODUCT',
      mgr_region: 'COMMISSION_MANAGER_REGION',
    };

    return type_mapping[role] || 'COMMISSION_OTHER';
  }
}
