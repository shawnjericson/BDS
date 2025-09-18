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
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const create_wallet_transaction_dto_1 = require("./dto/create-wallet-transaction.dto");
let WalletsService = class WalletsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWalletSummary(userId) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        transactions: true,
                    },
                },
            },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        const recentTransactions = await this.prisma.walletTransaction.findMany({
            where: { walletId: wallet.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });
        const earningsByType = await this.prisma.walletTransaction.groupBy({
            by: ['type'],
            where: {
                walletId: wallet.id,
                amount: { gt: 0 },
            },
            _sum: {
                amount: true,
            },
        });
        return {
            wallet,
            recentTransactions,
            earningsByType: earningsByType.map(item => ({
                type: item.type,
                total: Number(item._sum.amount || 0),
            })),
        };
    }
    async getWalletTransactions(userId, page = 1, limit = 20) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        const skip = (page - 1) * limit;
        const [transactions, total] = await Promise.all([
            this.prisma.walletTransaction.findMany({
                where: { walletId: wallet.id },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    creator: {
                        select: {
                            id: true,
                            fullName: true,
                        },
                    },
                },
            }),
            this.prisma.walletTransaction.count({
                where: { walletId: wallet.id },
            }),
        ]);
        return {
            transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async createTransaction(createTransactionDto, createdBy) {
        const { walletId, amount, type, refId, description } = createTransactionDto;
        const wallet = await this.prisma.wallet.findUnique({
            where: { id: walletId },
            include: { user: true },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        const newBalance = Number(wallet.balance) + amount;
        if (newBalance < 0) {
            throw new common_1.BadRequestException('Insufficient balance');
        }
        return this.prisma.$transaction(async (prisma) => {
            const transaction = await prisma.walletTransaction.create({
                data: {
                    walletId,
                    amount,
                    type,
                    refId,
                    description,
                    balanceAfter: newBalance,
                    createdBy,
                },
                include: {
                    wallet: {
                        include: { user: true },
                    },
                    creator: {
                        select: {
                            id: true,
                            fullName: true,
                        },
                    },
                },
            });
            await prisma.wallet.update({
                where: { id: walletId },
                data: { balance: newBalance },
            });
            return transaction;
        });
    }
    async createAdjustment(createAdjustmentDto, createdBy) {
        const { userId, amount, description } = createAdjustmentDto;
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('User wallet not found');
        }
        const type = amount > 0 ? create_wallet_transaction_dto_1.TransactionType.ADJUSTMENT_CREDIT : create_wallet_transaction_dto_1.TransactionType.ADJUSTMENT_DEBIT;
        return this.createTransaction({
            walletId: wallet.id,
            amount,
            type,
            description,
        }, createdBy);
    }
    async getAllWallets(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [wallets, total] = await Promise.all([
            this.prisma.wallet.findMany({
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            status: true,
                        },
                    },
                    _count: {
                        select: {
                            transactions: true,
                        },
                    },
                },
                orderBy: {
                    balance: 'desc',
                },
            }),
            this.prisma.wallet.count(),
        ]);
        return {
            wallets,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getWalletById(walletId) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { id: walletId },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        status: true,
                    },
                },
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullName: true,
                            },
                        },
                    },
                },
            },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        return wallet;
    }
    async getTransactionsByType(userId, type) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        const where = { walletId: wallet.id };
        if (type) {
            where.type = type;
        }
        return this.prisma.walletTransaction.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });
    }
    async getWalletStats() {
        const [totalWallets, totalBalance, totalTransactions, recentTransactions] = await Promise.all([
            this.prisma.wallet.count(),
            this.prisma.wallet.aggregate({
                _sum: { balance: true },
            }),
            this.prisma.walletTransaction.count(),
            this.prisma.walletTransaction.findMany({
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                    wallet: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                },
                            },
                        },
                    },
                    creator: {
                        select: {
                            id: true,
                            fullName: true,
                        },
                    },
                },
            }),
        ]);
        return {
            totalWallets,
            totalBalance: Number(totalBalance._sum.balance || 0),
            totalTransactions,
            recentTransactions,
        };
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map