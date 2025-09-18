import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum TransactionType {
  COMMISSION_DIRECT = 'COMMISSION_DIRECT',
  COMMISSION_REFERRAL = 'COMMISSION_REFERRAL',
  ADJUSTMENT_CREDIT = 'ADJUSTMENT_CREDIT',
  ADJUSTMENT_DEBIT = 'ADJUSTMENT_DEBIT',
}

export class CreateWalletTransactionDto {
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  walletId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  refId?: number; // Reference to booking, adjustment, etc.

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateAdjustmentDto {
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  userId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  amount: number; // Can be positive or negative

  @IsString()
  description: string;
}
