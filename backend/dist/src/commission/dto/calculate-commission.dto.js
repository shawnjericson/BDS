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
exports.CalculateCommissionDto = exports.CommissionRatesDto = exports.CommissionPolicy = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var CommissionPolicy;
(function (CommissionPolicy) {
    CommissionPolicy["PRIORITY"] = "priority";
    CommissionPolicy["PRORATE"] = "prorate";
})(CommissionPolicy || (exports.CommissionPolicy = CommissionPolicy = {}));
class CommissionRatesDto {
    rate_direct_sales;
    rate_referrer;
    rate_head_owner;
    rate_mgr_sales;
    rate_mgr_product;
    rate_mgr_region;
}
exports.CommissionRatesDto = CommissionRatesDto;
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CommissionRatesDto.prototype, "rate_direct_sales", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CommissionRatesDto.prototype, "rate_referrer", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CommissionRatesDto.prototype, "rate_head_owner", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CommissionRatesDto.prototype, "rate_mgr_sales", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CommissionRatesDto.prototype, "rate_mgr_product", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CommissionRatesDto.prototype, "rate_mgr_region", void 0);
class CalculateCommissionDto {
    gross_value;
    commission_pool_rate;
    rates;
    policy = CommissionPolicy.PRIORITY;
    rounding_unit = 1000;
    direct_sales_user_id;
    referrer_user_id;
    head_owner_user_id;
    mgr_sales_user_id;
    mgr_product_user_id;
    mgr_region_user_id;
}
exports.CalculateCommissionDto = CalculateCommissionDto;
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CalculateCommissionDto.prototype, "gross_value", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CalculateCommissionDto.prototype, "commission_pool_rate", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_transformer_1.Type)(() => CommissionRatesDto),
    __metadata("design:type", CommissionRatesDto)
], CalculateCommissionDto.prototype, "rates", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CommissionPolicy),
    __metadata("design:type", String)
], CalculateCommissionDto.prototype, "policy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CalculateCommissionDto.prototype, "rounding_unit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], CalculateCommissionDto.prototype, "direct_sales_user_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], CalculateCommissionDto.prototype, "referrer_user_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], CalculateCommissionDto.prototype, "head_owner_user_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], CalculateCommissionDto.prototype, "mgr_sales_user_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], CalculateCommissionDto.prototype, "mgr_product_user_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], CalculateCommissionDto.prototype, "mgr_region_user_id", void 0);
//# sourceMappingURL=calculate-commission.dto.js.map