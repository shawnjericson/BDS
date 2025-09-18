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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const commission_service_1 = require("./commission.service");
const commission_calculator_service_1 = require("./commission-calculator.service");
const calculate_commission_dto_1 = require("./dto/calculate-commission.dto");
let CommissionController = class CommissionController {
    commissionService;
    commissionCalculatorService;
    constructor(commissionService, commissionCalculatorService) {
        this.commissionService = commissionService;
        this.commissionCalculatorService = commissionCalculatorService;
    }
    async calculateCommission(dto) {
        return this.commissionService.calculateCommission(dto);
    }
    async executeCommissionPayout(dto) {
        const { transaction_ref_id, transaction_type = 'BOOKING', ...calculateDto } = dto;
        const result = await this.commissionService.calculateCommission(calculateDto);
        const payout = await this.commissionService.executeCommissionPayout(calculateDto, result, transaction_ref_id, transaction_type);
        return {
            message: 'Commission payout executed successfully',
            commission_result: result,
            payout_records: payout.payout_records,
        };
    }
    async getUserCommissionPayouts(userId, page = '1', limit = '20') {
        return {
            message: 'Commission payout tracking not yet available - migration needed',
            user_id: userId,
            data: [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: 0,
                totalPages: 0,
            },
        };
    }
    async getTransactionCommissionPayouts(refId, type = 'BOOKING') {
        return {
            message: 'Commission payout tracking not yet available - migration needed',
            transaction_ref_id: refId,
            transaction_type: type,
            total_commission_paid: 0,
            payouts: [],
        };
    }
    async demoCommissionCalculation() {
        const demoData = {
            gross_value: 1000000000,
            commission_pool_rate: 0.05,
            rates: {
                rate_direct_sales: 0.015,
                rate_referrer: 0.01,
                rate_head_owner: 0.005,
                rate_mgr_sales: 0.005,
                rate_mgr_product: 0.005,
                rate_mgr_region: 0.005,
            },
            policy: calculate_commission_dto_1.CommissionPolicy.PRIORITY,
            rounding_unit: 1000,
            direct_sales_user_id: 1,
            referrer_user_id: 2,
            head_owner_user_id: 3,
            mgr_sales_user_id: 4,
            mgr_product_user_id: 5,
            mgr_region_user_id: 6,
        };
        const result = await this.commissionService.calculateCommission(demoData);
        return {
            message: 'Demo commission calculation (from flow document)',
            input: demoData,
            result,
            explanation: {
                commission_pool: '1,000,000,000 × 5% = 50,000,000 VND',
                allocations_explanation: {
                    direct_sales: '1,000,000,000 × 1.5% = 15,000,000 VND',
                    referrer: '1,000,000,000 × 1% = 10,000,000 VND',
                    head_owner: '1,000,000,000 × 0.5% = 5,000,000 VND',
                    mgr_sales: '1,000,000,000 × 0.5% = 5,000,000 VND',
                    mgr_product: '1,000,000,000 × 0.5% = 5,000,000 VND',
                    mgr_region: '1,000,000,000 × 0.5% = 5,000,000 VND',
                },
                total_proposed: '45,000,000 VND (≤ 50,000,000 pool)',
                remaining: '5,000,000 VND',
                policy: 'Priority allocation (Option A) - no scaling needed',
            },
        };
    }
    async getCommissionPreview(productId, price, sellerUserId, referrerUserId, managerUserId) {
        const referrerUserIdNum = referrerUserId ? parseInt(referrerUserId) : undefined;
        const managerUserIdNum = managerUserId ? parseInt(managerUserId) : undefined;
        return this.commissionCalculatorService.getCommissionPreview(productId, price, sellerUserId, referrerUserIdNum, managerUserIdNum);
    }
    async calculateCommissionByBooking(bookingId) {
        return this.commissionCalculatorService.calculateCommissionByBookingId(bookingId);
    }
    async executeCommissionByBooking(bookingId, body) {
        return this.commissionCalculatorService.onBookingStatusChanged(bookingId, body.status);
    }
};
exports.CommissionController = CommissionController;
__decorate([
    (0, common_1.Post)('calculate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calculate_commission_dto_1.CalculateCommissionDto]),
    __metadata("design:returntype", Promise)
], CommissionController.prototype, "calculateCommission", null);
__decorate([
    (0, common_1.Post)('execute'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommissionController.prototype, "executeCommissionPayout", null);
__decorate([
    (0, common_1.Get)('user/:userId/payouts'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], CommissionController.prototype, "getUserCommissionPayouts", null);
__decorate([
    (0, common_1.Get)('transaction/:refId/payouts'),
    __param(0, (0, common_1.Param)('refId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], CommissionController.prototype, "getTransactionCommissionPayouts", null);
__decorate([
    (0, common_1.Post)('demo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommissionController.prototype, "demoCommissionCalculation", null);
__decorate([
    (0, common_1.Get)('preview'),
    __param(0, (0, common_1.Query)('productId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('price', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('sellerUserId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('referrerUserId')),
    __param(4, (0, common_1.Query)('managerUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], CommissionController.prototype, "getCommissionPreview", null);
__decorate([
    (0, common_1.Get)('calculate/:bookingId'),
    __param(0, (0, common_1.Param)('bookingId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CommissionController.prototype, "calculateCommissionByBooking", null);
__decorate([
    (0, common_1.Post)('execute/:bookingId'),
    __param(0, (0, common_1.Param)('bookingId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CommissionController.prototype, "executeCommissionByBooking", null);
exports.CommissionController = CommissionController = __decorate([
    (0, common_1.Controller)('commission'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [commission_service_1.CommissionService,
        commission_calculator_service_1.CommissionCalculatorService])
], CommissionController);
//# sourceMappingURL=commission.controller.js.map