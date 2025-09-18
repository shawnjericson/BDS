import { IsString, IsNumber, IsOptional, Min, Max, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  images?: string; // JSON string containing array of image URLs

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  basePrice?: number; // Base price for the product

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(1)
  @Transform(({ value }) => parseFloat(value))
  commissionPct: number;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(1)
  @Transform(({ value }) => parseFloat(value))
  providerDesiredPct: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  ownerUserId?: number; // For admin to create products for other users
}
