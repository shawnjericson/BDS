import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RevenueModule } from '../revenue/revenue.module';
import { CommissionModule } from '../commission/commission.module';
import { RanksModule } from '../ranks/ranks.module';

@Module({
  imports: [PrismaModule, CommissionModule, RevenueModule, RanksModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
