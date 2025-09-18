import { Module } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { CommissionCalculatorService } from './commission-calculator.service';
import { CommissionController } from './commission.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CommissionController],
  providers: [CommissionService, CommissionCalculatorService],
  exports: [CommissionService, CommissionCalculatorService],
})
export class CommissionModule {}
