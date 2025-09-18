import { Module } from '@nestjs/common';
import { RanksService } from './ranks.service';
import { RanksController, UserRanksController } from './ranks.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RanksController, UserRanksController],
  providers: [RanksService],
  exports: [RanksService],
})
export class RanksModule {}
