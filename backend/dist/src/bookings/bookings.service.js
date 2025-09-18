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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const update_booking_dto_1 = require("./dto/update-booking.dto");
const create_wallet_transaction_dto_1 = require("../wallets/dto/create-wallet-transaction.dto");
const commission_calculator_service_1 = require("../commission/commission-calculator.service");
const revenue_ledger_service_1 = require("../revenue/revenue-ledger.service");
let BookingsService = class BookingsService {
    prisma;
    commissionCalculatorService;
    revenueLedgerService;
    constructor(prisma, commissionCalculatorService, revenueLedgerService) {
        this.prisma = prisma;
        this.commissionCalculatorService = commissionCalculatorService;
        this.revenueLedgerService = revenueLedgerService;
    }
    async create(createBookingDto, userId) {
        const { productId, price, sellerUserId, referrerUserId, managerUserId, customerName, customerPhone, customerEmail } = createBookingDto;
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true,
                name: true,
                commissionPct: true,
                providerDesiredPct: true,
                status: true,
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        status: true,
                    }
                }
            }
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.status !== 'APPROVED') {
            throw new common_1.BadRequestException('Product must be approved to create bookings');
        }
        const currentUser = await this.prisma.appUser.findUnique({
            where: { id: userId },
            select: {
                id: true,
                referredBy: true,
                managerId: true,
                referrer: {
                    select: { id: true, managerId: true }
                }
            }
        });
        if (!currentUser) {
            throw new common_1.NotFoundException('Current user not found');
        }
        const finalSellerUserId = sellerUserId || userId;
        const finalReferrerUserId = referrerUserId || currentUser.referredBy;
        const finalManagerUserId = managerUserId || currentUser.managerId || currentUser.referrer?.managerId;
        const booking = await this.prisma.booking.create({
            data: {
                productId,
                price,
                sellerUserId: finalSellerUserId,
                referrerUserId: finalReferrerUserId,
                managerUserId: finalManagerUserId,
                customerName,
                customerPhone,
                customerEmail,
                status: 'PENDING',
            },
            include: {
                product: {
                    include: { owner: true },
                },
                seller: true,
                referrer: true,
                manager: true,
            },
        });
        try {
            await this.revenueLedgerService.processBookingRevenue(booking.id);
            console.log(`✅ Revenue processed for new booking ${booking.id}`);
        }
        catch (error) {
            console.error(`❌ Error processing revenue for new booking ${booking.id}:`, error);
        }
        return booking;
    }
    async findAll(status, userId) {
        const where = {};
        if (status) {
            where.status = status;
        }
        if (userId) {
            where.OR = [
                { sellerUserId: userId },
                { referrerUserId: userId },
                { managerUserId: userId },
                { product: { ownerUserId: userId } },
            ];
        }
        return this.prisma.booking.findMany({
            where,
            include: {
                product: {
                    include: { owner: true },
                },
                seller: true,
                referrer: true,
                manager: true,
                revenueLedger: true,
            },
            orderBy: {
                id: 'desc',
            },
        });
    }
    async findOne(id) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: {
                product: {
                    include: { owner: true },
                },
                seller: true,
                referrer: true,
                manager: true,
                revenueLedger: {
                    include: {
                        beneficiaryUser: true,
                    },
                },
            },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        return booking;
    }
    async update(id, updateBookingDto, userId, isAdmin = false) {
        const booking = await this.findOne(id);
        if (!isAdmin && !this.canUserAccessBooking(booking, userId)) {
            throw new common_1.ForbiddenException('You do not have permission to update this booking');
        }
        if (booking.status !== 'PENDING') {
            throw new common_1.BadRequestException('Can only update pending bookings');
        }
        return this.prisma.booking.update({
            where: { id },
            data: updateBookingDto,
            include: {
                product: {
                    include: { owner: true },
                },
                seller: true,
                referrer: true,
                manager: true,
            },
        });
    }
    async updateStatus(id, updateStatusDto) {
        const booking = await this.findOne(id);
        if (booking.status === updateStatusDto.status) {
            throw new common_1.BadRequestException(`Booking is already ${updateStatusDto.status}`);
        }
        if (updateStatusDto.status === update_booking_dto_1.BookingStatus.COMPLETED) {
            return this.completeBooking(id);
        }
        else if (updateStatusDto.status === update_booking_dto_1.BookingStatus.CANCELLED) {
            return this.cancelBooking(id);
        }
        const updatedBooking = await this.prisma.booking.update({
            where: { id },
            data: {
                status: updateStatusDto.status,
                closedAt: updateStatusDto.status !== update_booking_dto_1.BookingStatus.PENDING ? new Date() : null,
            },
            include: {
                product: {
                    include: { owner: true },
                },
                seller: true,
                referrer: true,
                manager: true,
                revenueLedger: {
                    include: {
                        beneficiaryUser: true,
                    },
                },
            },
        });
        try {
            await this.revenueLedgerService.processBookingRevenue(id);
            console.log(`✅ Revenue processed for booking ${id} status change to ${updateStatusDto.status}`);
        }
        catch (error) {
            console.error(`❌ Error processing revenue for booking ${id}:`, error);
        }
        return updatedBooking;
    }
    async completeBooking(id) {
        const booking = await this.findOne(id);
        if (booking.status === update_booking_dto_1.BookingStatus.COMPLETED) {
            throw new common_1.BadRequestException('Booking is already completed');
        }
        return this.prisma.$transaction(async (prisma) => {
            const updatedBooking = await prisma.booking.update({
                where: { id },
                data: {
                    status: update_booking_dto_1.BookingStatus.COMPLETED,
                    closedAt: new Date(),
                },
                include: {
                    product: {
                        include: { owner: true },
                    },
                    seller: true,
                    referrer: true,
                    manager: true,
                },
            });
            try {
                await this.revenueLedgerService.processBookingRevenue(updatedBooking.id);
                console.log(`✅ Revenue processed for completed booking ${updatedBooking.id}`);
            }
            catch (error) {
                console.error(`❌ Error processing revenue for booking ${updatedBooking.id}:`, error);
                throw error;
            }
            return prisma.booking.findUnique({
                where: { id },
                include: {
                    product: {
                        include: { owner: true },
                    },
                    seller: true,
                    referrer: true,
                    manager: true,
                    revenueLedger: {
                        include: {
                            beneficiaryUser: true,
                        },
                    },
                },
            });
        });
    }
    async cancelBooking(id) {
        const booking = await this.findOne(id);
        if (booking.status === update_booking_dto_1.BookingStatus.CANCELLED) {
            throw new common_1.BadRequestException('Booking is already cancelled');
        }
        if (booking.status === update_booking_dto_1.BookingStatus.COMPLETED) {
            return this.prisma.$transaction(async (prisma) => {
                const updatedBooking = await prisma.booking.update({
                    where: { id },
                    data: {
                        status: update_booking_dto_1.BookingStatus.CANCELLED,
                        closedAt: new Date(),
                    },
                    include: {
                        product: {
                            include: { owner: true },
                        },
                        seller: true,
                        referrer: true,
                        manager: true,
                        revenueLedger: {
                            include: {
                                beneficiaryUser: true,
                            },
                        },
                    },
                });
                try {
                    await this.revenueLedgerService.processBookingRevenue(id);
                    console.log(`✅ Revenue processed for canceled booking ${id}`);
                }
                catch (error) {
                    console.error(`❌ Error processing revenue for canceled booking ${id}:`, error);
                    throw error;
                }
                return updatedBooking;
            });
        }
        return this.prisma.booking.update({
            where: { id },
            data: {
                status: update_booking_dto_1.BookingStatus.CANCELLED,
                closedAt: new Date(),
            },
            include: {
                product: {
                    include: { owner: true },
                },
                seller: true,
                referrer: true,
                manager: true,
            },
        });
    }
    async distributeRevenue(prisma, booking) {
        const { price, product, sellerUserId, referrerUserId, managerUserId } = booking;
        const commissionPool = Number(price) * Number(product.commissionPct);
        const providerShare = commissionPool * (Number(product.providerDesiredPct) / Number(product.commissionPct));
        const remainingPool = commissionPool - providerShare;
        const [sellerRank, referrerRank, managerRank] = await Promise.all([
            sellerUserId ? this.getCurrentUserRank(prisma, sellerUserId) : null,
            referrerUserId ? this.getCurrentUserRank(prisma, referrerUserId) : null,
            managerUserId ? this.getCurrentUserRank(prisma, managerUserId) : null,
        ]);
        const [sellerPct, referrerPct, managerPct] = await Promise.all([
            sellerRank ? this.getRankShare(prisma, sellerRank.rankId, 'SELLER') : 0,
            referrerRank ? this.getRankShare(prisma, referrerRank.rankId, 'REFERRER') : 0,
            managerRank ? this.getRankShare(prisma, managerRank.rankId, 'MANAGER') : 0,
        ]);
        const sellerAmount = remainingPool * sellerPct;
        const referrerAmount = remainingPool * referrerPct;
        const managerAmount = remainingPool * managerPct;
        const appAmount = remainingPool - (sellerAmount + referrerAmount + managerAmount);
        const ledgerEntries = [];
        ledgerEntries.push({
            bookingId: booking.id,
            role: 'PROVIDER',
            beneficiaryUserId: product.ownerUserId,
            pct: Number(product.providerDesiredPct) / Number(product.commissionPct),
            amount: providerShare,
        });
        if (sellerUserId && sellerAmount > 0) {
            ledgerEntries.push({
                bookingId: booking.id,
                role: 'SELLER',
                beneficiaryUserId: sellerUserId,
                pct: sellerPct,
                amount: sellerAmount,
            });
        }
        if (referrerUserId && referrerAmount > 0) {
            ledgerEntries.push({
                bookingId: booking.id,
                role: 'REFERRER',
                beneficiaryUserId: referrerUserId,
                pct: referrerPct,
                amount: referrerAmount,
            });
        }
        if (managerUserId && managerAmount > 0) {
            ledgerEntries.push({
                bookingId: booking.id,
                role: 'MANAGER',
                beneficiaryUserId: managerUserId,
                pct: managerPct,
                amount: managerAmount,
            });
        }
        ledgerEntries.push({
            bookingId: booking.id,
            role: 'APP',
            beneficiaryUserId: null,
            pct: appAmount / commissionPool,
            amount: appAmount,
        });
        await prisma.revenueLedger.createMany({
            data: ledgerEntries,
        });
        await this.createWalletTransactions(prisma, ledgerEntries, booking.id);
    }
    async createWalletTransactions(prisma, ledgerEntries, bookingId) {
        for (const entry of ledgerEntries) {
            if (entry.beneficiaryUserId && entry.amount > 0) {
                const wallet = await prisma.wallet.findUnique({
                    where: { userId: entry.beneficiaryUserId },
                });
                if (wallet) {
                    const newBalance = Number(wallet.balance) + Number(entry.amount);
                    await prisma.walletTransaction.create({
                        data: {
                            walletId: wallet.id,
                            amount: Number(entry.amount),
                            type: this.getTransactionType(entry.role),
                            refId: bookingId,
                            description: `Commission from booking #${bookingId} (${entry.role})`,
                            balanceAfter: newBalance,
                        },
                    });
                    await prisma.wallet.update({
                        where: { id: wallet.id },
                        data: { balance: newBalance },
                    });
                }
            }
        }
    }
    getTransactionType(role) {
        switch (role) {
            case 'PROVIDER':
            case 'SELLER':
                return create_wallet_transaction_dto_1.TransactionType.COMMISSION_DIRECT;
            case 'REFERRER':
            case 'MANAGER':
                return create_wallet_transaction_dto_1.TransactionType.COMMISSION_REFERRAL;
            default:
                return create_wallet_transaction_dto_1.TransactionType.COMMISSION_DIRECT;
        }
    }
    async revertRevenue(prisma, bookingId) {
        const existingEntries = await prisma.revenueLedger.findMany({
            where: {
                bookingId,
                amount: { gt: 0 },
            },
        });
        const revertEntries = existingEntries.map((entry) => ({
            bookingId: entry.bookingId,
            role: entry.role,
            beneficiaryUserId: entry.beneficiaryUserId,
            pct: entry.pct,
            amount: -Number(entry.amount),
        }));
        if (revertEntries.length > 0) {
            await prisma.revenueLedger.createMany({
                data: revertEntries,
            });
            await this.revertWalletTransactions(prisma, revertEntries, bookingId);
        }
    }
    async revertWalletTransactions(prisma, revertEntries, bookingId) {
        for (const entry of revertEntries) {
            if (entry.beneficiaryUserId && entry.amount < 0) {
                const wallet = await prisma.wallet.findUnique({
                    where: { userId: entry.beneficiaryUserId },
                });
                if (wallet) {
                    const newBalance = Number(wallet.balance) + Number(entry.amount);
                    await prisma.walletTransaction.create({
                        data: {
                            walletId: wallet.id,
                            amount: Number(entry.amount),
                            type: this.getTransactionType(entry.role),
                            refId: bookingId,
                            description: `Reversal for booking #${bookingId} cancellation (${entry.role})`,
                            balanceAfter: newBalance,
                        },
                    });
                    await prisma.wallet.update({
                        where: { id: wallet.id },
                        data: { balance: newBalance },
                    });
                }
            }
        }
    }
    async getCurrentUserRank(prisma, userId) {
        return prisma.userRank.findFirst({
            where: {
                userId,
                effectiveTo: null,
            },
            orderBy: {
                effectiveFrom: 'desc',
            },
        });
    }
    async getRankShare(prisma, rankId, role) {
        const rankShare = await prisma.rankShare.findFirst({
            where: {
                rankId,
                role,
            },
        });
        return rankShare ? Number(rankShare.pct) : 0;
    }
    canUserAccessBooking(booking, userId) {
        return (booking.sellerUserId === userId ||
            booking.referrerUserId === userId ||
            booking.managerUserId === userId ||
            booking.product?.ownerUserId === userId);
    }
    async getMyBookings(userId) {
        return this.findAll(undefined, userId);
    }
    async remove(id, userId, isAdmin = false) {
        const booking = await this.findOne(id);
        if (!isAdmin && !this.canUserAccessBooking(booking, userId)) {
            throw new common_1.ForbiddenException('You do not have permission to delete this booking');
        }
        if (booking.status !== update_booking_dto_1.BookingStatus.PENDING) {
            throw new common_1.BadRequestException('Can only delete pending bookings');
        }
        return this.prisma.booking.delete({
            where: { id },
        });
    }
    async distributeRevenueWithCommissionCalculator(bookingId) {
        try {
            const commissionResult = await this.commissionCalculatorService.onBookingStatusChanged(bookingId, 'COMPLETED');
            console.log('Commission distributed successfully:', {
                bookingId,
                baseCommission: commissionResult?.base_commission,
                provider: commissionResult?.provider,
                seller: commissionResult?.seller,
                referrer: commissionResult?.referrer,
                manager: commissionResult?.manager,
                systemResidual: commissionResult?.system_residual
            });
            return commissionResult;
        }
        catch (error) {
            console.error('Error distributing commission:', error);
            throw new common_1.BadRequestException(`Failed to distribute commission: ${error.message}`);
        }
    }
    async getCommissionInfo(bookingId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                product: {
                    include: {
                        owner: true,
                    },
                },
                seller: true,
                referrer: true,
                manager: true,
            },
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID ${bookingId} not found`);
        }
        const seller = booking.seller ? await this.getUserWithRank(booking.seller.id, 'SELLER') : undefined;
        const referrer = booking.referrer ? await this.getUserWithRank(booking.referrer.id, 'REFERRER') : undefined;
        const manager = booking.manager ? await this.getUserWithRank(booking.manager.id, 'MANAGER') : undefined;
        const provider = booking.product?.owner ? await this.getUserBasicInfo(booking.product.owner.id) : undefined;
        return {
            bookingId: booking.id,
            productId: booking.productId,
            productName: booking.product?.name,
            price: Number(booking.price),
            commissionPct: Number(booking.product.commissionPct),
            providerDesiredPct: Number(booking.product.providerDesiredPct),
            sellerUserId: booking.sellerUserId || undefined,
            referrerUserId: booking.referrerUserId || undefined,
            managerUserId: booking.managerUserId || undefined,
            providerUserId: booking.product?.ownerUserId || undefined,
            seller,
            referrer,
            manager,
            provider,
        };
    }
    async getUserWithRank(userId, roleType) {
        const user = await this.prisma.appUser.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        const currentUserRank = await this.prisma.userRank.findFirst({
            where: {
                userId: userId,
                effectiveFrom: { lte: new Date() },
                OR: [
                    { effectiveTo: null },
                    { effectiveTo: { gte: new Date() } },
                ],
            },
            include: {
                rank: true,
            },
            orderBy: { effectiveFrom: 'desc' },
        });
        let rankShares = [];
        if (currentUserRank) {
            rankShares = await this.prisma.rankShare.findMany({
                where: {
                    rankId: currentUserRank.rankId,
                    role: roleType,
                },
            });
        }
        return {
            id: user.id,
            fullName: user.fullName || '',
            email: user.email,
            role: user.role,
            currentRank: currentUserRank ? {
                id: currentUserRank.rank.id,
                name: currentUserRank.rank.name,
                effectiveFrom: currentUserRank.effectiveFrom,
                effectiveTo: currentUserRank.effectiveTo || undefined,
            } : undefined,
            rankShares: rankShares.map(share => ({
                id: share.id,
                role: share.role,
                pct: Number(share.pct),
            })),
        };
    }
    async getUserBasicInfo(userId) {
        const user = await this.prisma.appUser.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        return {
            id: user.id,
            fullName: user.fullName || '',
            email: user.email,
            role: user.role,
            currentRank: undefined,
            rankShares: [],
        };
    }
    async calculateCommission(bookingId) {
        const commissionInfo = await this.getCommissionInfo(bookingId);
        const totalCommission = commissionInfo.price * commissionInfo.commissionPct;
        const providerAmount = commissionInfo.price * commissionInfo.providerDesiredPct;
        const remainingCommission = totalCommission - providerAmount;
        const participants = [];
        let totalRankBasedAmount = 0;
        if (commissionInfo.provider) {
            participants.push({
                userId: commissionInfo.provider.id,
                fullName: commissionInfo.provider.fullName,
                role: 'provider',
                calculatedAmount: providerAmount,
                isFixedRate: true,
                fixedRatePct: commissionInfo.providerDesiredPct,
            });
        }
        if (commissionInfo.seller?.rankShares && commissionInfo.seller.rankShares.length > 0) {
            const sellerShare = commissionInfo.seller.rankShares.find(s => s.role === 'SELLER');
            if (sellerShare && commissionInfo.seller) {
                const amount = remainingCommission * sellerShare.pct;
                totalRankBasedAmount += amount;
                participants.push({
                    userId: commissionInfo.seller.id,
                    fullName: commissionInfo.seller.fullName,
                    role: 'seller',
                    userRank: commissionInfo.seller.currentRank,
                    rankSharePct: sellerShare.pct,
                    shareOfRemainingCommission: sellerShare.pct,
                    calculatedAmount: amount,
                });
            }
        }
        if (commissionInfo.referrer?.rankShares && commissionInfo.referrer.rankShares.length > 0) {
            const referrerShare = commissionInfo.referrer.rankShares.find(s => s.role === 'REFERRER');
            if (referrerShare && commissionInfo.referrer) {
                const amount = remainingCommission * referrerShare.pct;
                totalRankBasedAmount += amount;
                participants.push({
                    userId: commissionInfo.referrer.id,
                    fullName: commissionInfo.referrer.fullName,
                    role: 'referrer',
                    userRank: commissionInfo.referrer.currentRank,
                    rankSharePct: referrerShare.pct,
                    shareOfRemainingCommission: referrerShare.pct,
                    calculatedAmount: amount,
                });
            }
        }
        if (commissionInfo.manager?.rankShares && commissionInfo.manager.rankShares.length > 0) {
            const managerShare = commissionInfo.manager.rankShares.find(s => s.role === 'MANAGER');
            if (managerShare && commissionInfo.manager) {
                const amount = remainingCommission * managerShare.pct;
                totalRankBasedAmount += amount;
                participants.push({
                    userId: commissionInfo.manager.id,
                    fullName: commissionInfo.manager.fullName,
                    role: 'manager',
                    userRank: commissionInfo.manager.currentRank,
                    rankSharePct: managerShare.pct,
                    shareOfRemainingCommission: managerShare.pct,
                    calculatedAmount: amount,
                });
            }
        }
        const systemResidual = remainingCommission - totalRankBasedAmount;
        const systemResidualPct = remainingCommission > 0 ? systemResidual / remainingCommission : 0;
        const totalDistributed = totalRankBasedAmount + providerAmount;
        return {
            bookingId: commissionInfo.bookingId,
            productId: commissionInfo.productId,
            productName: commissionInfo.productName || 'Unknown Product',
            price: commissionInfo.price,
            commissionPct: commissionInfo.commissionPct,
            providerDesiredPct: commissionInfo.providerDesiredPct,
            totalCommission,
            providerAmount,
            remainingCommission,
            participants,
            systemResidual,
            systemResidualPct,
            totalDistributed,
            distributionComplete: Math.abs(totalDistributed + systemResidual - totalCommission) < 0.01,
        };
    }
    async getMyCommissionForBooking(bookingId, userId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                product: {
                    include: { owner: true }
                },
                seller: true,
                referrer: true,
                manager: true
            }
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        const commissionData = await this.commissionCalculatorService.calculateCommissionByBookingId(bookingId);
        const userRoles = [];
        let userCommission = 0;
        const commissionDetails = [];
        if (booking.sellerUserId === userId) {
            userRoles.push('seller');
            userCommission += commissionData.seller.amount;
            commissionDetails.push({
                role: 'seller',
                amount: commissionData.seller.amount,
                userId: commissionData.seller.user_id
            });
        }
        if (booking.referrerUserId === userId && commissionData.referrer) {
            userRoles.push('referrer');
            userCommission += commissionData.referrer.amount;
            commissionDetails.push({
                role: 'referrer',
                amount: commissionData.referrer.amount,
                userId: commissionData.referrer.user_id
            });
        }
        if (booking.managerUserId === userId && commissionData.manager) {
            userRoles.push('manager');
            userCommission += commissionData.manager.amount;
            commissionDetails.push({
                role: 'manager',
                amount: commissionData.manager.amount,
                userId: commissionData.manager.user_id
            });
        }
        if (booking.product?.ownerUserId === userId && commissionData.provider.user_id) {
            userRoles.push('provider');
            userCommission += commissionData.provider.amount;
            commissionDetails.push({
                role: 'provider',
                amount: commissionData.provider.amount,
                userId: commissionData.provider.user_id
            });
        }
        if (userRoles.length === 0) {
            throw new common_1.ForbiddenException('You are not involved in this booking');
        }
        return {
            bookingId,
            bookingPrice: booking.price,
            productName: booking.product?.name || 'Unknown Product',
            userRoles,
            userCommission,
            commissionDetails,
            totalCommission: commissionData.base_commission,
            createdAt: booking.createdAt,
            status: booking.status
        };
    }
    async getTotalBookingsCount() {
        return await this.prisma.booking.count();
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        commission_calculator_service_1.CommissionCalculatorService,
        revenue_ledger_service_1.RevenueLedgerService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map