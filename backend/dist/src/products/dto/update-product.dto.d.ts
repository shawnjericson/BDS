import { CreateProductDto } from './create-product.dto';
export declare enum ProductStatus {
    SUBMITTED = "SUBMITTED",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
declare const UpdateProductDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateProductDto>>;
export declare class UpdateProductDto extends UpdateProductDto_base {
}
export declare class UpdateProductStatusDto {
    status: ProductStatus;
    reason?: string;
}
export {};
