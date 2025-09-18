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
exports.RevenueController = void 0;
const common_1 = require("@nestjs/common");
const revenue_ledger_service_1 = require("./revenue-ledger.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let RevenueController = class RevenueController {
    revenueLedgerService;
    constructor(revenueLedgerService) {
        this.revenueLedgerService = revenueLedgerService;
    }
    async recalculateAllRevenue() {
        await this.revenueLedgerService.recalculateAllRevenue();
        return { message: 'Revenue recalculation completed' };
    }
    async getUserTotalRevenue(userId) {
        const total = await this.revenueLedgerService.getUserTotalRevenue(userId);
        return { userId, totalRevenue: total };
    }
    async getUserMonthlyRevenue(userId) {
        const monthly = await this.revenueLedgerService.getUserMonthlyRevenue(userId);
        return { userId, monthlyRevenue: monthly };
    }
    async getUserRevenueByRole(userId) {
        const breakdown = await this.revenueLedgerService.getUserRevenueByRole(userId);
        return { userId, revenueByRole: breakdown };
    }
    async getUserRevenueHistory(userId) {
        const history = await this.revenueLedgerService.getUserRevenueHistory(userId);
        return { userId, revenueHistory: history };
    }
};
exports.RevenueController = RevenueController;
__decorate([
    (0, common_1.Post)('recalculate-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "recalculateAllRevenue", null);
__decorate([
    (0, common_1.Get)('user/:userId/total'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "getUserTotalRevenue", null);
__decorate([
    (0, common_1.Get)('user/:userId/monthly'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "getUserMonthlyRevenue", null);
__decorate([
    (0, common_1.Get)('user/:userId/by-role'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "getUserRevenueByRole", null);
__decorate([
    (0, common_1.Get)('user/:userId/history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RevenueController.prototype, "getUserRevenueHistory", null);
exports.RevenueController = RevenueController = __decorate([
    (0, common_1.Controller)('revenue'),
    __metadata("design:paramtypes", [revenue_ledger_service_1.RevenueLedgerService])
], RevenueController);
//# sourceMappingURL=revenue.controller.js.map