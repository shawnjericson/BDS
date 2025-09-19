import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { DownlineController } from './downline.controller';
import { ProductsModule } from '../products/products.module';
import { BookingsModule } from '../bookings/bookings.module';
import { WalletsModule } from '../wallets/wallets.module';
import { UsersModule } from '../users/users.module';
import { RevenueModule } from '../revenue/revenue.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ProductsModule, BookingsModule, WalletsModule, UsersModule, RevenueModule, PrismaModule],
  controllers: [AdminController, DownlineController],
})
export class AdminModule {}
