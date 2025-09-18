import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { BookingsModule } from './bookings/bookings.module';
import { WalletsModule } from './wallets/wallets.module';
import { AdminModule } from './admin/admin.module';
import { CommissionModule } from './commission/commission.module';
import { RanksModule } from './ranks/ranks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    BookingsModule,
    WalletsModule,
    AdminModule,
    CommissionModule,
    RanksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
