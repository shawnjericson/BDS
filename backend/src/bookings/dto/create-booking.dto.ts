import { IsNumber, IsOptional, Min, IsString, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBookingDto {
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  productId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  sellerUserId?: number; // For admin to create bookings for other users

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  referrerUserId?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  managerUserId?: number;

  // Customer information
  @IsString()
  customerName: string;

  @IsString()
  customerPhone: string;

  @IsEmail()
  customerEmail: string;
}
