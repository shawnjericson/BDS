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
exports.CreateAdjustmentDto = exports.CreateWalletTransactionDto = exports.TransactionType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var TransactionType;
(function (TransactionType) {
    TransactionType["COMMISSION_DIRECT"] = "COMMISSION_DIRECT";
    TransactionType["COMMISSION_REFERRAL"] = "COMMISSION_REFERRAL";
    TransactionType["ADJUSTMENT_CREDIT"] = "ADJUSTMENT_CREDIT";
    TransactionType["ADJUSTMENT_DEBIT"] = "ADJUSTMENT_DEBIT";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
class CreateWalletTransactionDto {
    walletId;
    amount;
    type;
    refId;
    description;
}
exports.CreateWalletTransactionDto = CreateWalletTransactionDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], CreateWalletTransactionDto.prototype, "walletId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    __metadata("design:type", Number)
], CreateWalletTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TransactionType),
    __metadata("design:type", String)
], CreateWalletTransactionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], CreateWalletTransactionDto.prototype, "refId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWalletTransactionDto.prototype, "description", void 0);
class CreateAdjustmentDto {
    userId;
    amount;
    description;
}
exports.CreateAdjustmentDto = CreateAdjustmentDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], CreateAdjustmentDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    __metadata("design:type", Number)
], CreateAdjustmentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdjustmentDto.prototype, "description", void 0);
//# sourceMappingURL=create-wallet-transaction.dto.js.map