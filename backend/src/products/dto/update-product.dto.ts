import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsEnum, IsOptional } from 'class-validator';

export enum ProductStatus {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class UpdateProductStatusDto {
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @IsOptional()
  reason?: string; // For rejection reason
}
