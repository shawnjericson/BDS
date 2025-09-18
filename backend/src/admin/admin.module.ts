import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { ProductsModule } from '../products/products.module';
import { BookingsModule } from '../bookings/bookings.module';
import { WalletsModule } from '../wallets/wallets.module';
import { UsersModule } from '../users/users.module';
import { RevenueModule } from '../revenue/revenue.module';

@Module({
  imports: [ProductsModule, BookingsModule, WalletsModule, UsersModule, RevenueModule],
  controllers: [AdminController],
})
export class AdminModule {}
