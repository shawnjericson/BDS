import { Module } from '@nestjs/common';
import { RevenueLedgerService } from './revenue-ledger.service';
import { RevenueController } from './revenue.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommissionModule } from '../commission/commission.module';

@Module({
  imports: [PrismaModule, CommissionModule],
  controllers: [RevenueController],
  providers: [RevenueLedgerService],
  exports: [RevenueLedgerService],
})
export class RevenueModule {}
