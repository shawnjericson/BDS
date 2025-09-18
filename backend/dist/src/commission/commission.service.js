"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const calculate_commission_dto_1 = require("./dto/calculate-commission.dto");
let CommissionService = class CommissionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateCommission(dto) {
        const { gross_value, commission_pool_rate, rates, policy = calculate_commission_dto_1.CommissionPolicy.PRIORITY, rounding_unit = 1000, } = dto;
        const commission_pool = gross_value * commission_pool_rate;
        const proposed = {
            direct_sales: gross_value * rates.rate_direct_sales,
            referrer: gross_value * rates.rate_referrer,
            head_owner: gross_value * rates.rate_head_owner,
            mgr_sales: gross_value * rates.rate_mgr_sales,
            mgr_product: gross_value * rates.rate_mgr_product,
            mgr_region: gross_value * rates.rate_mgr_region,
        };
        if (!dto.direct_sales_user_id)
            proposed.direct_sales = 0;
        if (!dto.referrer_user_id)
            proposed.referrer = 0;
        if (!dto.head_owner_user_id)
            proposed.head_owner = 0;
        if (!dto.mgr_sales_user_id)
            proposed.mgr_sales = 0;
        if (!dto.mgr_product_user_id)
            proposed.mgr_product = 0;
        if (!dto.mgr_region_user_id)
            proposed.mgr_region = 0;
        const commission_proposed_total = Object.values(proposed).reduce((sum, val) => sum + val, 0);
        let allocations = { ...proposed };
        let k_factor;
        if (commission_proposed_total > commission_pool) {
            if (policy === calculate_commission_dto_1.CommissionPolicy.PRIORITY) {
                allocations = this.allocateByPriority(proposed, commission_pool);
            }
            else {
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
        allocations = this.applyRounding(allocations, rounding_unit);
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
    allocateByPriority(proposed, available_pool) {
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
            if (remaining_pool <= 0)
                break;
            const proposed_amount = proposed[role] || 0;
            const allocated_amount = Math.min(proposed_amount, remaining_pool);
            allocations[role] = allocated_amount;
            remaining_pool -= allocated_amount;
        }
        return allocations;
    }
    applyRounding(allocations, rounding_unit) {
        return {
            direct_sales: Math.round(allocations.direct_sales / rounding_unit) * rounding_unit,
            referrer: Math.round(allocations.referrer / rounding_unit) * rounding_unit,
            head_owner: Math.round(allocations.head_owner / rounding_unit) * rounding_unit,
            mgr_sales: Math.round(allocations.mgr_sales / rounding_unit) * rounding_unit,
            mgr_product: Math.round(allocations.mgr_product / rounding_unit) * rounding_unit,
            mgr_region: Math.round(allocations.mgr_region / rounding_unit) * rounding_unit,
        };
    }
    async executeCommissionPayout(dto, result, transaction_ref_id, transaction_type = 'BOOKING') {
        const user_mappings = {
            direct_sales: dto.direct_sales_user_id,
            referrer: dto.referrer_user_id,
            head_owner: dto.head_owner_user_id,
            mgr_sales: dto.mgr_sales_user_id,
            mgr_product: dto.mgr_product_user_id,
            mgr_region: dto.mgr_region_user_id,
        };
        return this.prisma.$transaction(async (prisma) => {
            const payout_records = [];
            for (const [role, amount] of Object.entries(result.allocations)) {
                if (amount > 0) {
                    const user_id = user_mappings[role];
                    if (user_id) {
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
    async updateUserWallet(prisma, user_id, amount, ref_id, role) {
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
        await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: new_balance },
        });
    }
    getTransactionType(role) {
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
};
exports.CommissionService = CommissionService;
exports.CommissionService = CommissionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommissionService);
//# sourceMappingURL=commission.service.js.map