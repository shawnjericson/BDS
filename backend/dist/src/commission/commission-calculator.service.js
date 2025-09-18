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
exports.CommissionCalculatorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CommissionCalculatorService = class CommissionCalculatorService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateCommissionByBookingId(bookingId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                product: {
                    include: {
                        owner: true
                    }
                },
                seller: {
                    include: {
                        userRanks: {
                            where: { effectiveTo: null },
                            include: {
                                rank: {
                                    include: {
                                        rankShares: true
                                    }
                                }
                            }
                        }
                    }
                },
                referrer: true,
                manager: true
            }
        });
        if (!booking) {
            throw new Error('Booking not found');
        }
        const product = booking.product;
        const seller = booking.seller;
        if (!product || !seller) {
            throw new Error('Invalid booking data');
        }
        const price = Number(booking.price);
        const commissionPct = Number(product.commissionPct);
        const qty = 1;
        const C0 = price * commissionPct * qty;
        const providerPct = Number(product.providerDesiredPct) / commissionPct;
        const C_provider = this.roundVND(C0 * providerPct);
        const C_remain = C0 - C_provider;
        const sellerRank = seller.userRanks?.[0]?.rank;
        if (!sellerRank) {
            throw new Error(`Seller rank not found for user ${seller.id}`);
        }
        const hasReferrer = !!booking.referrerUserId;
        const hasManager = !!booking.managerUserId;
        const sellerShare = sellerRank.rankShares.find(rs => rs.role === 'SELLER');
        const referrerShare = sellerRank.rankShares.find(rs => rs.role === 'REFERRER');
        const managerShare = sellerRank.rankShares.find(rs => rs.role === 'MANAGER');
        let s = Number(sellerShare?.pct || 0);
        let r = hasReferrer ? Number(referrerShare?.pct || 0) : 0;
        let m = hasManager ? Number(managerShare?.pct || 0) : 0;
        const sum = s + r + m;
        if (sum > 1) {
            s /= sum;
            r /= sum;
            m /= sum;
        }
        const C_seller = this.roundVND(C_remain * s);
        const C_referrer = this.roundVND(C_remain * r);
        const C_manager = this.roundVND(C_remain * m);
        const allocated = C_seller + C_referrer + C_manager;
        const system_residual = this.roundVND(C_remain - allocated);
        return {
            booking_id: booking.id,
            base_commission: this.roundVND(C0),
            provider: { user_id: product.ownerUserId, amount: C_provider },
            seller: { user_id: seller.id, amount: C_seller },
            referrer: hasReferrer ? { user_id: booking.referrerUserId, amount: C_referrer } : null,
            manager: hasManager ? { user_id: booking.managerUserId, amount: C_manager } : null,
            system_residual,
        };
    }
    async onBookingStatusChanged(bookingId, newStatus) {
        await this.prisma.booking.update({
            where: { id: bookingId },
            data: { status: newStatus }
        });
        if (newStatus !== 'COMPLETED')
            return;
        const split = await this.calculateCommissionByBookingId(bookingId);
        await this.prisma.$transaction(async (prisma) => {
            const ledgerEntries = [];
            if (split.provider.amount > 0 && split.provider.user_id) {
                ledgerEntries.push({
                    bookingId: split.booking_id,
                    beneficiaryUserId: split.provider.user_id,
                    amount: split.provider.amount,
                    type: 'PROVIDER',
                    description: 'Provider share'
                });
                await this.credit(prisma, split.provider.user_id, split.provider.amount, bookingId, 'provider', 'Provider share');
            }
            if (split.seller.amount > 0) {
                ledgerEntries.push({
                    bookingId: split.booking_id,
                    beneficiaryUserId: split.seller.user_id,
                    amount: split.seller.amount,
                    type: 'SELLER',
                    description: 'Seller commission'
                });
                await this.credit(prisma, split.seller.user_id, split.seller.amount, bookingId, 'direct_seller', 'Seller commission');
            }
            if (split.referrer && split.referrer.amount > 0) {
                ledgerEntries.push({
                    bookingId: split.booking_id,
                    beneficiaryUserId: split.referrer.user_id,
                    amount: split.referrer.amount,
                    type: 'REFERRER',
                    description: 'Referral commission'
                });
                await this.credit(prisma, split.referrer.user_id, split.referrer.amount, bookingId, 'referral', 'Referral commission');
            }
            if (split.manager && split.manager.amount > 0) {
                ledgerEntries.push({
                    bookingId: split.booking_id,
                    beneficiaryUserId: split.manager.user_id,
                    amount: split.manager.amount,
                    type: 'MANAGER',
                    description: 'Manager commission'
                });
                await this.credit(prisma, split.manager.user_id, split.manager.amount, bookingId, 'manager', 'Manager commission');
            }
            if (split.system_residual > 0) {
                ledgerEntries.push({
                    bookingId: split.booking_id,
                    beneficiaryUserId: null,
                    amount: split.system_residual,
                    type: 'SYSTEM',
                    description: 'Residual'
                });
            }
            if (ledgerEntries.length > 0) {
                await prisma.revenueLedger.createMany({
                    data: ledgerEntries
                });
            }
        });
        return split;
    }
    async credit(prisma, userId, amount, bookingId, type, note) {
        if (amount <= 0)
            return;
        let wallet = await prisma.wallet.findUnique({
            where: { userId }
        });
        if (!wallet) {
            wallet = await prisma.wallet.create({
                data: {
                    userId,
                    balance: 0
                }
            });
        }
        const newBalance = Number(wallet.balance) + amount;
        await prisma.wallet.update({
            where: { userId },
            data: { balance: newBalance }
        });
        await prisma.walletTransaction.create({
            data: {
                walletId: wallet.id,
                amount,
                type: `COMMISSION_${type.toUpperCase()}`,
                refId: bookingId,
                description: note,
                balanceAfter: newBalance,
                createdBy: null
            }
        });
    }
    roundVND(amount) {
        return Math.round(amount);
    }
    async getCommissionPreview(productId, price, sellerUserId, referrerUserId, managerUserId) {
        const tempBooking = {
            id: 0,
            productId,
            sellerUserId,
            referrerUserId: referrerUserId || null,
            managerUserId: managerUserId || null,
            price,
            status: 'PENDING'
        };
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: { owner: true }
        });
        const seller = await this.prisma.appUser.findUnique({
            where: { id: sellerUserId },
            include: {
                userRanks: {
                    where: { effectiveTo: null },
                    include: {
                        rank: {
                            include: {
                                rankShares: true
                            }
                        }
                    }
                }
            }
        });
        if (!product || !seller) {
            throw new Error('Product or seller not found');
        }
        const commissionPct = Number(product.commissionPct);
        const C0 = price * commissionPct;
        const providerPct = Number(product.providerDesiredPct) / commissionPct;
        const C_provider = this.roundVND(C0 * providerPct);
        const C_remain = C0 - C_provider;
        const sellerRank = seller.userRanks?.[0]?.rank;
        if (!sellerRank) {
            throw new Error(`Seller rank not found for user ${seller.id}`);
        }
        const hasReferrer = !!referrerUserId;
        const hasManager = !!managerUserId;
        const sellerShare = sellerRank.rankShares.find(rs => rs.role === 'SELLER');
        const referrerShare = sellerRank.rankShares.find(rs => rs.role === 'REFERRER');
        const managerShare = sellerRank.rankShares.find(rs => rs.role === 'MANAGER');
        let s = Number(sellerShare?.pct || 0);
        let r = hasReferrer ? Number(referrerShare?.pct || 0) : 0;
        let m = hasManager ? Number(managerShare?.pct || 0) : 0;
        const sum = s + r + m;
        if (sum > 1) {
            s /= sum;
            r /= sum;
            m /= sum;
        }
        const C_seller = this.roundVND(C_remain * s);
        const C_referrer = this.roundVND(C_remain * r);
        const C_manager = this.roundVND(C_remain * m);
        const allocated = C_seller + C_referrer + C_manager;
        const system_residual = this.roundVND(C_remain - allocated);
        return {
            booking_id: 0,
            base_commission: this.roundVND(C0),
            provider: { user_id: product.ownerUserId, amount: C_provider },
            seller: { user_id: seller.id, amount: C_seller },
            referrer: hasReferrer ? { user_id: referrerUserId, amount: C_referrer } : null,
            manager: hasManager ? { user_id: managerUserId, amount: C_manager } : null,
            system_residual,
        };
    }
};
exports.CommissionCalculatorService = CommissionCalculatorService;
exports.CommissionCalculatorService = CommissionCalculatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommissionCalculatorService);
//# sourceMappingURL=commission-calculator.service.js.map