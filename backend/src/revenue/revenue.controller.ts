import { Controller, Post, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { RevenueLedgerService } from './revenue-ledger.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('revenue')
export class RevenueController {
  constructor(private revenueLedgerService: RevenueLedgerService) {}

  @Post('recalculate-all')
  async recalculateAllRevenue() {
    await this.revenueLedgerService.recalculateAllRevenue();
    return { message: 'Revenue recalculation completed' };
  }

  @Get('user/:userId/total')
  @UseGuards(JwtAuthGuard)
  async getUserTotalRevenue(@Param('userId', ParseIntPipe) userId: number) {
    const total = await this.revenueLedgerService.getUserTotalRevenue(userId);
    return { userId, totalRevenue: total };
  }

  @Get('user/:userId/monthly')
  @UseGuards(JwtAuthGuard)
  async getUserMonthlyRevenue(@Param('userId', ParseIntPipe) userId: number) {
    const monthly = await this.revenueLedgerService.getUserMonthlyRevenue(userId);
    return { userId, monthlyRevenue: monthly };
  }

  @Get('user/:userId/by-role')
  @UseGuards(JwtAuthGuard)
  async getUserRevenueByRole(@Param('userId', ParseIntPipe) userId: number) {
    const breakdown = await this.revenueLedgerService.getUserRevenueByRole(userId);
    return { userId, revenueByRole: breakdown };
  }

  @Get('user/:userId/history')
  @UseGuards(JwtAuthGuard)
  async getUserRevenueHistory(@Param('userId', ParseIntPipe) userId: number) {
    const history = await this.revenueLedgerService.getUserRevenueHistory(userId);
    return { userId, revenueHistory: history };
  }
}
