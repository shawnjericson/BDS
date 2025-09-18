import { IsNumber, IsOptional, IsEnum, Min, IsObject } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum CommissionPolicy {
  PRIORITY = 'priority',
  PRORATE = 'prorate',
}

export class CommissionRatesDto {
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  rate_direct_sales: number; // Bán trực tiếp

  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  rate_referrer: number; // Người giới thiệu

  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  rate_head_owner: number; // Đầu chủ

  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  rate_mgr_sales: number; // QLKD

  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  rate_mgr_product: number; // QLSP/DA

  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  rate_mgr_region: number; // QLKV
}

export class CalculateCommissionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  gross_value: number; // Tổng giá trị giao dịch

  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  commission_pool_rate: number; // % quỹ hoa hồng (VD: 0.05 = 5%)

  @IsObject()
  @Type(() => CommissionRatesDto)
  rates: CommissionRatesDto;

  @IsOptional()
  @IsEnum(CommissionPolicy)
  policy?: CommissionPolicy = CommissionPolicy.PRIORITY; // Default Option A

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  rounding_unit?: number = 1000; // Làm tròn 1,000đ

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  direct_sales_user_id?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  referrer_user_id?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  head_owner_user_id?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  mgr_sales_user_id?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  mgr_product_user_id?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  mgr_region_user_id?: number;
}

export interface CommissionResult {
  commission_pool: number;
  commission_paid_total: number;
  commission_remaining: number;
  allocations: {
    direct_sales: number;
    referrer: number;
    head_owner: number;
    mgr_sales: number;
    mgr_product: number;
    mgr_region: number;
  };
  k_factor?: number; // Hệ số co giãn (nếu có)
  policy_used: CommissionPolicy;
}
