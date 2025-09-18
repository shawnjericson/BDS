import { WalletsService } from './wallets.service';
import { TransactionType } from './dto/create-wallet-transaction.dto';
interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        email: string;
    };
}
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    getMyWalletSummary(req: AuthenticatedRequest): Promise<{
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
    getMyTransactions(req: AuthenticatedRequest, page?: string, limit?: string): Promise<{
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
    getMyTransactionsByType(req: AuthenticatedRequest, type: TransactionType): Promise<({
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
    getWallet(id: number): Promise<{
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
}
export {};
