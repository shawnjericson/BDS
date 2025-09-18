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
exports.RevenueLedgerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const commission_calculator_service_1 = require("../commission/commission-calculator.service");
let RevenueLedgerService = class RevenueLedgerService {
    prisma;
    commissionCalculatorService;
    constructor(prisma, commissionCalculatorService) {
        this.prisma = prisma;
        this.commissionCalculatorService = commissionCalculatorService;
    }
    async processBookingRevenue(bookingId) {
        console.log('💰 Processing revenue for booking:', bookingId);
        const existingEntries = await this.prisma.revenueLedger.findMany({
            where: { bookingId }
        });
        if (existingEntries.length > 0) {
            console.log(`🔄 Updating existing ${existingEntries.length} entries for booking ${bookingId}`);
            await this.prisma.revenueLedger.deleteMany({
                where: { bookingId }
            });
        }
        else {
            console.log(`➕ Creating new entries for booking ${bookingId}`);
        }
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                product: true
            }
        });
        if (!booking) {
            console.error('❌ Booking not found:', bookingId);
            return;
        }
        console.log(`📊 Processing booking ${bookingId} with status: ${booking.status}`);
        try {
            const commissionData = await this.commissionCalculatorService.calculateCommissionByBookingId(bookingId);
            console.log('📊 Commission data:', commissionData);
            const ledgerEntries = [];
            if (commissionData.provider.user_id) {
                ledgerEntries.push({
                    bookingId,
                    role: 'provider',
                    beneficiaryUserId: commissionData.provider.user_id,
                    amount: commissionData.provider.amount || 0,
                });
                console.log(`  📝 Provider: User ${commissionData.provider.user_id} = ${commissionData.provider.amount}`);
            }
            if (commissionData.seller.user_id) {
                ledgerEntries.push({
                    bookingId,
                    role: 'seller',
                    beneficiaryUserId: commissionData.seller.user_id,
                    amount: commissionData.seller.amount || 0,
                });
                console.log(`  📝 Seller: User ${commissionData.seller.user_id} = ${commissionData.seller.amount}`);
            }
            if (commissionData.referrer?.user_id) {
                ledgerEntries.push({
                    bookingId,
                    role: 'referrer',
                    beneficiaryUserId: commissionData.referrer.user_id,
                    amount: commissionData.referrer.amount || 0,
                });
                console.log(`  📝 Referrer: User ${commissionData.referrer.user_id} = ${commissionData.referrer.amount}`);
            }
            else {
                console.log(`  📝 Referrer: None`);
            }
            if (commissionData.manager?.user_id) {
                ledgerEntries.push({
                    bookingId,
                    role: 'manager',
                    beneficiaryUserId: commissionData.manager.user_id,
                    amount: commissionData.manager.amount || 0,
                });
                console.log(`  📝 Manager: User ${commissionData.manager.user_id} = ${commissionData.manager.amount}`);
            }
            else {
                console.log(`  📝 Manager: None`);
            }
            if (ledgerEntries.length > 0) {
                await this.prisma.revenueLedger.createMany({
                    data: ledgerEntries
                });
                console.log(`✅ Revenue ledger entries created: ${ledgerEntries.length} for booking ${bookingId} (${booking.status})`);
            }
            else {
                console.log('⚠️ No ledger entries to create');
            }
        }
        catch (error) {
            console.error('❌ Error processing booking revenue:', error);
            throw error;
        }
    }
    async getUserTotalRevenue(userId) {
        const result = await this.prisma.revenueLedger.aggregate({
            where: {
                beneficiaryUserId: userId
            },
            _sum: {
                amount: true
            }
        });
        return Number(result._sum.amount || 0);
    }
    async getUserMonthlyRevenue(userId, year, month) {
        const now = new Date();
        const targetYear = year || now.getFullYear();
        const targetMonth = month || now.getMonth() + 1;
        const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
        const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
        const result = await this.prisma.revenueLedger.aggregate({
            where: {
                beneficiaryUserId: userId,
                createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            },
            _sum: {
                amount: true
            }
        });
        return Number(result._sum.amount || 0);
    }
    async getUserRevenueByRole(userId) {
        const result = await this.prisma.revenueLedger.groupBy({
            by: ['role'],
            where: {
                beneficiaryUserId: userId
            },
            _sum: {
                amount: true
            }
        });
        return result.map(item => ({
            role: item.role || 'unknown',
            amount: Number(item._sum.amount || 0)
        }));
    }
    async getUserRevenueHistory(userId, limit = 50) {
        const entries = await this.prisma.revenueLedger.findMany({
            where: {
                beneficiaryUserId: userId
            },
            include: {
                booking: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        });
        return entries.map(entry => ({
            id: entry.id,
            bookingId: entry.bookingId,
            role: entry.role,
            amount: Number(entry.amount || 0),
            createdAt: entry.createdAt,
            productName: entry.booking?.product?.name || 'Unknown Product',
            bookingPrice: Number(entry.booking?.price || 0)
        }));
    }
    async recalculateAllRevenue() {
        console.log('🔄 Recalculating all revenue...');
        await this.prisma.revenueLedger.deleteMany({});
        const allBookings = await this.prisma.booking.findMany({
            orderBy: {
                id: 'asc'
            }
        });
        console.log(`📊 Found ${allBookings.length} total bookings`);
        for (const booking of allBookings) {
            try {
                await this.processBookingRevenue(booking.id);
            }
            catch (error) {
                console.error(`❌ Error processing booking ${booking.id}:`, error);
            }
        }
        console.log('✅ Revenue recalculation completed for all bookings');
    }
    async getTotalRevenue() {
        const result = await this.prisma.revenueLedger.aggregate({
            _sum: {
                amount: true
            }
        });
        return Number(result._sum.amount || 0);
    }
    async getRevenueByStatus() {
        const result = await this.prisma.revenueLedger.groupBy({
            by: ['bookingId'],
            _sum: {
                amount: true
            }
        });
        const statusMap = new Map();
        for (const entry of result) {
            if (!entry.bookingId)
                continue;
            const booking = await this.prisma.booking.findUnique({
                where: { id: entry.bookingId },
                select: { status: true }
            });
            if (booking && entry._sum) {
                const currentAmount = statusMap.get(booking.status) || 0;
                statusMap.set(booking.status, currentAmount + Number(entry._sum.amount || 0));
            }
        }
        return Array.from(statusMap.entries()).map(([status, amount]) => ({
            status,
            amount
        }));
    }
    async getRevenueByRole() {
        const result = await this.prisma.revenueLedger.groupBy({
            by: ['role'],
            _sum: {
                amount: true
            },
            orderBy: {
                role: 'asc'
            }
        });
        return result.map(entry => ({
            role: entry.role || 'unknown',
            amount: Number(entry._sum?.amount || 0)
        }));
    }
    async getAllRevenueEntries(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [entries, total] = await Promise.all([
            this.prisma.revenueLedger.findMany({
                include: {
                    beneficiaryUser: {
                        select: { id: true, fullName: true, email: true }
                    },
                    booking: {
                        include: {
                            product: {
                                select: { name: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.revenueLedger.count()
        ]);
        return {
            entries: entries.map(entry => ({
                id: entry.id,
                userId: entry.beneficiaryUserId,
                bookingId: entry.bookingId,
                role: entry.role,
                amount: Number(entry.amount || 0),
                createdAt: entry.createdAt,
                user: entry.beneficiaryUser,
                booking: entry.booking ? {
                    id: entry.booking.id,
                    price: Number(entry.booking.price || 0),
                    status: entry.booking.status,
                    product: entry.booking.product
                } : null
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getBookingCommissionFromLedger(bookingId) {
        const entries = await this.prisma.revenueLedger.findMany({
            where: { bookingId },
            include: {
                beneficiaryUser: {
                    select: { id: true, fullName: true, email: true }
                }
            }
        });
        if (entries.length === 0) {
            return {
                bookingId,
                provider: { user: null, amount: 0, percentage: 0 },
                seller: { user: null, amount: 0, percentage: 0 },
                referrer: { user: null, amount: 0, percentage: 0 },
                manager: { user: null, amount: 0, percentage: 0 }
            };
        }
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            select: { price: true }
        });
        const bookingPrice = Number(booking?.price || 0);
        const result = {
            bookingId,
            provider: { user: null, amount: 0, percentage: 0 },
            seller: { user: null, amount: 0, percentage: 0 },
            referrer: { user: null, amount: 0, percentage: 0 },
            manager: { user: null, amount: 0, percentage: 0 }
        };
        entries.forEach(entry => {
            const amount = Number(entry.amount || 0);
            const percentage = bookingPrice > 0 ? (amount / bookingPrice) * 100 : 0;
            if (entry.role === 'provider') {
                result.provider = {
                    user: entry.beneficiaryUser,
                    amount,
                    percentage
                };
            }
            else if (entry.role === 'seller') {
                result.seller = {
                    user: entry.beneficiaryUser,
                    amount,
                    percentage
                };
            }
            else if (entry.role === 'referrer') {
                result.referrer = {
                    user: entry.beneficiaryUser,
                    amount,
                    percentage
                };
            }
            else if (entry.role === 'manager') {
                result.manager = {
                    user: entry.beneficiaryUser,
                    amount,
                    percentage
                };
            }
        });
        return result;
    }
};
exports.RevenueLedgerService = RevenueLedgerService;
exports.RevenueLedgerService = RevenueLedgerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        commission_calculator_service_1.CommissionCalculatorService])
], RevenueLedgerService);
//# sourceMappingURL=revenue-ledger.service.js.map