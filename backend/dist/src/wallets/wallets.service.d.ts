import { PrismaService } from '../prisma/prisma.service';
import { CreateWalletTransactionDto, CreateAdjustmentDto, TransactionType } from './dto/create-wallet-transaction.dto';
export declare class WalletsService {
    private prisma;
    constructor(prisma: PrismaService);
    getWalletSummary(userId: number): Promise<{
        wallet: {
            user: {
                id: number;
                email: string | null;
                fullName: string;
            };
            _count: {
                transactions: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            balance: import("@prisma/client/runtime/library").Decimal;
        };
        recentTransactions: ({
            creator: {
                id: number;
                fullName: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            walletId: number;
            type: string;
            refId: number | null;
            balanceAfter: import("@prisma/client/runtime/library").Decimal;
            createdBy: number | null;
        })[];
        earningsByType: {
            type: string;
            total: number;
        }[];
    }>;
    getWalletTransactions(userId: number, page?: number, limit?: number): Promise<{
        transactions: ({
            creator: {
                id: number;
                fullName: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            walletId: number;
            type: string;
            refId: number | null;
            balanceAfter: import("@prisma/client/runtime/library").Decimal;
            createdBy: number | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    createTransaction(createTransactionDto: CreateWalletTransactionDto, createdBy?: number): Promise<{
        wallet: {
            user: {
                id: number;
                role: string;
                email: string | null;
                referralCode: string | null;
                fullName: string;
                password: string | null;
                referredBy: number | null;
                managerId: number | null;
                status: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            balance: import("@prisma/client/runtime/library").Decimal;
        };
        creator: {
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        description: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        walletId: number;
        type: string;
        refId: number | null;
        balanceAfter: import("@prisma/client/runtime/library").Decimal;
        createdBy: number | null;
    }>;
    createAdjustment(createAdjustmentDto: CreateAdjustmentDto, createdBy: number): Promise<{
        wallet: {
            user: {
                id: number;
                role: string;
                email: string | null;
                referralCode: string | null;
                fullName: string;
                password: string | null;
                referredBy: number | null;
                managerId: number | null;
                status: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            balance: import("@prisma/client/runtime/library").Decimal;
        };
        creator: {
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        description: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        walletId: number;
        type: string;
        refId: number | null;
        balanceAfter: import("@prisma/client/runtime/library").Decimal;
        createdBy: number | null;
    }>;
    getAllWallets(page?: number, limit?: number): Promise<{
        wallets: ({
            user: {
                id: number;
                email: string | null;
                fullName: string;
                status: string;
            };
            _count: {
                transactions: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            balance: import("@prisma/client/runtime/library").Decimal;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getWalletById(walletId: number): Promise<{
        user: {
            id: number;
            email: string | null;
            fullName: string;
            status: string;
        };
        transactions: ({
            creator: {
                id: number;
                fullName: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            walletId: number;
            type: string;
            refId: number | null;
            balanceAfter: import("@prisma/client/runtime/library").Decimal;
            createdBy: number | null;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    getTransactionsByType(userId: number, type?: TransactionType): Promise<({
        creator: {
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        description: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        walletId: number;
        type: string;
        refId: number | null;
        balanceAfter: import("@prisma/client/runtime/library").Decimal;
        createdBy: number | null;
    })[]>;
    getWalletStats(): Promise<{
        totalWallets: number;
        totalBalance: number;
        totalTransactions: number;
        recentTransactions: ({
            wallet: {
                user: {
                    id: number;
                    fullName: string;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                userId: number;
                balance: import("@prisma/client/runtime/library").Decimal;
            };
            creator: {
                id: number;
                fullName: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            walletId: number;
            type: string;
            refId: number | null;
            balanceAfter: import("@prisma/client/runtime/library").Decimal;
            createdBy: number | null;
        })[];
    }>;
}
