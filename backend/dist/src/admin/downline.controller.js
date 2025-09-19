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
exports.DownlineController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let DownlineController = class DownlineController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyDownline(req) {
        const userId = req.user.id;
        const downlineUsers = await this.prisma.appUser.findMany({
            where: {
                referredBy: userId,
            },
            include: {
                userRanks: {
                    where: { effectiveTo: null },
                    include: {
                        rank: true,
                    },
                },
                referrals: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
                sellerBookings: {
                    select: {
                        id: true,
                        price: true,
                        createdAt: true,
                    },
                },
                revenueLedger: {
                    select: {
                        amount: true,
                        createdAt: true,
                    },
                },
            },
        });
        const currentDate = new Date();
        const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        return downlineUsers.map(user => {
            const totalRevenue = user.revenueLedger.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
            const monthlyRevenue = user.revenueLedger
                .filter(entry => entry.createdAt && new Date(entry.createdAt) >= currentMonth)
                .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
            const totalBookings = user.sellerBookings.length;
            const monthlyBookings = user.sellerBookings
                .filter(booking => new Date(booking.createdAt) >= currentMonth)
                .length;
            const totalReferrals = user.referrals.length;
            const activeReferrals = user.referrals.filter(ref => ref.status === 'ACTIVE').length;
            return {
                id: user.id,
                fullName: user.fullName,
                nickname: user.fullName.split(' ')[0],
                email: user.email || undefined,
                referralCode: user.referralCode || undefined,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt.toISOString(),
                totalRevenue,
                totalBookings,
                monthlyRevenue,
                monthlyBookings,
                currentRank: user.userRanks[0]?.rank ? {
                    id: user.userRanks[0].rank.id,
                    name: user.userRanks[0].rank.name,
                } : undefined,
                totalReferrals,
                activeReferrals,
            };
        });
    }
    async getDownlineStats(req) {
        const downline = await this.getMyDownline(req);
        const totalMembers = downline.length;
        const activeMembers = downline.filter(user => user.status === 'ACTIVE').length;
        const totalRevenue = downline.reduce((sum, user) => sum + user.totalRevenue, 0);
        const monthlyRevenue = downline.reduce((sum, user) => sum + user.monthlyRevenue, 0);
        const totalBookings = downline.reduce((sum, user) => sum + user.totalBookings, 0);
        const monthlyBookings = downline.reduce((sum, user) => sum + user.monthlyBookings, 0);
        const topPerformers = downline
            .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
            .slice(0, 5);
        return {
            totalMembers,
            activeMembers,
            totalRevenue,
            monthlyRevenue,
            totalBookings,
            monthlyBookings,
            topPerformers,
        };
    }
};
exports.DownlineController = DownlineController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DownlineController.prototype, "getMyDownline", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DownlineController.prototype, "getDownlineStats", null);
exports.DownlineController = DownlineController = __decorate([
    (0, common_1.Controller)('admin/downline'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DownlineController);
//# sourceMappingURL=downline.controller.js.map