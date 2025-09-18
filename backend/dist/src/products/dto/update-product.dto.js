"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductStatusDto = exports.UpdateProductDto = exports.ProductStatus = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_product_dto_1 = require("./create-product.dto");
const class_validator_1 = require("class-validator");
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["SUBMITTED"] = "SUBMITTED";
    ProductStatus["APPROVED"] = "APPROVED";
    ProductStatus["REJECTED"] = "REJECTED";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
class UpdateProductDto extends (0, mapped_types_1.PartialType)(create_product_dto_1.CreateProductDto) {
}
exports.UpdateProductDto = UpdateProductDto;
class UpdateProductStatusDto {
    status;
    reason;
}
exports.UpdateProductStatusDto = UpdateProductStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(ProductStatus),
    __metadata("design:type", String)
], UpdateProductStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProductStatusDto.prototype, "reason", void 0);
//# sourceMappingURL=update-product.dto.js.map