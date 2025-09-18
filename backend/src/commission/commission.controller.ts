import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  Query,
  UseGuards,
  ParseIntPipe 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommissionService } from './commission.service';
import { CommissionCalculatorService } from './commission-calculator.service';
import { CalculateCommissionDto, CommissionResult, CommissionPolicy } from './dto/calculate-commission.dto';

@Controller('commission')
@UseGuards(JwtAuthGuard)
export class CommissionController {
  constructor(
    private readonly commissionService: CommissionService,
    private readonly commissionCalculatorService: CommissionCalculatorService
  ) {}

  /**
   * API để tính commission (dry run - không thực hiện payout)
   * POST /commission/calculate
   */
  @Post('calculate')
  async calculateCommission(
    @Body() dto: CalculateCommissionDto
  ): Promise<CommissionResult> {
    return this.commissionService.calculateCommission(dto);
  }

  /**
   * API để thực hiện commission payout cho một giao dịch
   * POST /commission/execute
   */
  @Post('execute')
  async executeCommissionPayout(
    @Body() dto: CalculateCommissionDto & { 
      transaction_ref_id: number;
      transaction_type?: string;
    }
  ) {
    const { transaction_ref_id, transaction_type = 'BOOKING', ...calculateDto } = dto;
    
    // Tính commission
    const result = await this.commissionService.calculateCommission(calculateDto);
    
    // Thực hiện payout
    const payout = await this.commissionService.executeCommissionPayout(
      calculateDto,
      result,
      transaction_ref_id,
      transaction_type
    );

    return {
      message: 'Commission payout executed successfully',
      commission_result: result,
      payout_records: payout.payout_records,
    };
  }

  /**
   * API để xem commission payouts của một user
   * GET /commission/user/:userId/payouts
   * TODO: Uncomment after migration
   */
  @Get('user/:userId/payouts')
  async getUserCommissionPayouts(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    // TODO: Uncomment after migration
    return {
      message: 'Commission payout tracking not yet available - migration needed',
      user_id: userId,
      data: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        totalPages: 0,
      },
    };

    // const pageNum = parseInt(page);
    // const limitNum = parseInt(limit);
    // const skip = (pageNum - 1) * limitNum;

    // const [payouts, total] = await Promise.all([
    //   this.commissionService.prisma.commissionPayout.findMany({
    //     where: { userId },
    //     include: {
    //       user: {
    //         select: {
    //           id: true,
    //           fullName: true,
    //           email: true,
    //         },
    //       },
    //     },
    //     orderBy: { createdAt: 'desc' },
    //     skip,
    //     take: limitNum,
    //   }),
    //   this.commissionService.prisma.commissionPayout.count({
    //     where: { userId },
    //   }),
    // ]);

    // return {
    //   data: payouts,
    //   pagination: {
    //     page: pageNum,
    //     limit: limitNum,
    //     total,
    //     totalPages: Math.ceil(total / limitNum),
    //   },
    // };
  }

  /**
   * API để xem commission payouts của một transaction
   * GET /commission/transaction/:refId/payouts
   * TODO: Uncomment after migration
   */
  @Get('transaction/:refId/payouts')
  async getTransactionCommissionPayouts(
    @Param('refId', ParseIntPipe) refId: number,
    @Query('type') type: string = 'BOOKING'
  ) {
    // TODO: Uncomment after migration
    return {
      message: 'Commission payout tracking not yet available - migration needed',
      transaction_ref_id: refId,
      transaction_type: type,
      total_commission_paid: 0,
      payouts: [],
    };

    // const payouts = await this.commissionService.prisma.commissionPayout.findMany({
    //   where: {
    //     transactionRefId: refId,
    //     transactionType: type,
    //   },
    //   include: {
    //     user: {
    //       select: {
    //         id: true,
    //         fullName: true,
    //         email: true,
    //       },
    //     },
    //   },
    //   orderBy: { createdAt: 'desc' },
    // });

    // // Tính tổng commission đã chi
    // const totalPaid = payouts.reduce((sum: number, payout: any) => sum + Number(payout.amountFinal), 0);

    // return {
    //   transaction_ref_id: refId,
    //   transaction_type: type,
    //   total_commission_paid: totalPaid,
    //   payouts,
    // };
  }

  /**
   * API demo với dữ liệu mẫu theo file flow
   * POST /commission/demo
   */
  @Post('demo')
  async demoCommissionCalculation() {
    // Dữ liệu mẫu từ file flow
    const demoData: CalculateCommissionDto = {
      gross_value: 1000000000, // 1 tỷ VND
      commission_pool_rate: 0.05, // 5%
      rates: {
        rate_direct_sales: 0.015, // 1.5%
        rate_referrer: 0.01, // 1%
        rate_head_owner: 0.005, // 0.5%
        rate_mgr_sales: 0.005, // 0.5%
        rate_mgr_product: 0.005, // 0.5%
        rate_mgr_region: 0.005, // 0.5%
      },
      policy: CommissionPolicy.PRIORITY, // Option A
      rounding_unit: 1000,
      // Giả sử có đủ user cho tất cả vai trò
      direct_sales_user_id: 1,
      referrer_user_id: 2,
      head_owner_user_id: 3,
      mgr_sales_user_id: 4,
      mgr_product_user_id: 5,
      mgr_region_user_id: 6,
    };

    const result = await this.commissionService.calculateCommission(demoData);

    return {
      message: 'Demo commission calculation (from flow document)',
      input: demoData,
      result,
      explanation: {
        commission_pool: '1,000,000,000 × 5% = 50,000,000 VND',
        allocations_explanation: {
          direct_sales: '1,000,000,000 × 1.5% = 15,000,000 VND',
          referrer: '1,000,000,000 × 1% = 10,000,000 VND',
          head_owner: '1,000,000,000 × 0.5% = 5,000,000 VND',
          mgr_sales: '1,000,000,000 × 0.5% = 5,000,000 VND',
          mgr_product: '1,000,000,000 × 0.5% = 5,000,000 VND',
          mgr_region: '1,000,000,000 × 0.5% = 5,000,000 VND',
        },
        total_proposed: '45,000,000 VND (≤ 50,000,000 pool)',
        remaining: '5,000,000 VND',
        policy: 'Priority allocation (Option A) - no scaling needed',
      },
    };
  }

  // New endpoints based on commission_spec.md

  /**
   * Get commission preview for a potential booking
   * GET /commission/preview?productId=1&price=10000000&sellerUserId=2&referrerUserId=3&managerUserId=4
   */
  @Get('preview')
  async getCommissionPreview(
    @Query('productId', ParseIntPipe) productId: number,
    @Query('price', ParseIntPipe) price: number,
    @Query('sellerUserId', ParseIntPipe) sellerUserId: number,
    @Query('referrerUserId') referrerUserId?: string,
    @Query('managerUserId') managerUserId?: string,
  ) {
    const referrerUserIdNum = referrerUserId ? parseInt(referrerUserId) : undefined;
    const managerUserIdNum = managerUserId ? parseInt(managerUserId) : undefined;

    return this.commissionCalculatorService.getCommissionPreview(
      productId,
      price,
      sellerUserId,
      referrerUserIdNum,
      managerUserIdNum
    );
  }

  /**
   * Calculate commission for existing booking
   * GET /commission/calculate/:bookingId
   */
  @Get('calculate/:bookingId')
  async calculateCommissionByBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.commissionCalculatorService.calculateCommissionByBookingId(bookingId);
  }

  /**
   * Execute commission and update wallets when booking is completed
   * POST /commission/execute/:bookingId
   */
  @Post('execute/:bookingId')
  async executeCommissionByBooking(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Body() body: { status: 'PENDING' | 'COMPLETED' | 'CANCELED' }
  ) {
    return this.commissionCalculatorService.onBookingStatusChanged(bookingId, body.status);
  }
}
