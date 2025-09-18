import { ProductsService } from '../products/products.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto, UpdateProductStatusDto, ProductStatus } from '../products/dto/update-product.dto';
import { BookingsService } from '../bookings/bookings.service';
import { CreateBookingDto } from '../bookings/dto/create-booking.dto';
import { UpdateBookingDto, UpdateBookingStatusDto, BookingStatus } from '../bookings/dto/update-booking.dto';
import { WalletsService } from '../wallets/wallets.service';
import { CreateAdjustmentDto } from '../wallets/dto/create-wallet-transaction.dto';
import { UsersService } from '../users/users.service';
import { RevenueLedgerService } from '../revenue/revenue-ledger.service';
interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        email: string;
    };
}
export declare class AdminController {
    private readonly productsService;
    private readonly bookingsService;
    private readonly walletsService;
    private readonly usersService;
    private readonly revenueLedgerService;
    constructor(productsService: ProductsService, bookingsService: BookingsService, walletsService: WalletsService, usersService: UsersService, revenueLedgerService: RevenueLedgerService);
    getAllProducts(status?: ProductStatus): Promise<{
        price: number | null;
        images: any;
        bookings: undefined;
        owner: {
            id: number;
            email: string | null;
            fullName: string;
        } | null;
        _count: {
            bookings: number;
        };
        id: number;
        name: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        ownerUserId: number | null;
        description: string | null;
        basePrice: import("@prisma/client/runtime/library").Decimal | null;
        commissionPct: import("@prisma/client/runtime/library").Decimal;
        providerDesiredPct: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    createProduct(createProductDto: CreateProductDto, req: AuthenticatedRequest): Promise<{
        owner: {
            id: number;
            email: string | null;
            fullName: string;
        } | null;
    } & {
        id: number;
        name: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        ownerUserId: number | null;
        description: string | null;
        images: string | null;
        basePrice: import("@prisma/client/runtime/library").Decimal | null;
        commissionPct: import("@prisma/client/runtime/library").Decimal;
        providerDesiredPct: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateProduct(id: number, updateProductDto: UpdateProductDto, req: AuthenticatedRequest): Promise<{
        owner: {
            id: number;
            email: string | null;
            fullName: string;
        } | null;
    } & {
        id: number;
        name: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        ownerUserId: number | null;
        description: string | null;
        images: string | null;
        basePrice: import("@prisma/client/runtime/library").Decimal | null;
        commissionPct: import("@prisma/client/runtime/library").Decimal;
        providerDesiredPct: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateProductStatus(id: number, updateStatusDto: UpdateProductStatusDto): Promise<{
        owner: {
            id: number;
            email: string | null;
            fullName: string;
        } | null;
    } & {
        id: number;
        name: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        ownerUserId: number | null;
        description: string | null;
        images: string | null;
        basePrice: import("@prisma/client/runtime/library").Decimal | null;
        commissionPct: import("@prisma/client/runtime/library").Decimal;
        providerDesiredPct: import("@prisma/client/runtime/library").Decimal;
    }>;
    deleteProduct(id: number, req: AuthenticatedRequest): Promise<{
        id: number;
        name: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        ownerUserId: number | null;
        description: string | null;
        images: string | null;
        basePrice: import("@prisma/client/runtime/library").Decimal | null;
        commissionPct: import("@prisma/client/runtime/library").Decimal;
        providerDesiredPct: import("@prisma/client/runtime/library").Decimal;
    }>;
    getAllBookings(status?: BookingStatus): Promise<({
        revenueLedger: {
            id: number;
            role: string | null;
            pct: import("@prisma/client/runtime/library").Decimal | null;
            createdAt: Date | null;
            amount: import("@prisma/client/runtime/library").Decimal | null;
            bookingId: number | null;
            beneficiaryUserId: number | null;
        }[];
        referrer: {
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
        } | null;
        manager: {
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
        } | null;
        product: ({
            owner: {
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
            } | null;
        } & {
            id: number;
            name: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            ownerUserId: number | null;
            description: string | null;
            images: string | null;
            basePrice: import("@prisma/client/runtime/library").Decimal | null;
            commissionPct: import("@prisma/client/runtime/library").Decimal;
            providerDesiredPct: import("@prisma/client/runtime/library").Decimal;
        }) | null;
        seller: {
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
        } | null;
    } & {
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        referrerUserId: number | null;
        managerUserId: number | null;
        productId: number | null;
        sellerUserId: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        closedAt: Date | null;
        customerName: string | null;
        customerPhone: string | null;
        customerEmail: string | null;
    })[]>;
    createBooking(createBookingDto: CreateBookingDto, req: AuthenticatedRequest): Promise<{
        referrer: {
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
        } | null;
        manager: {
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
        } | null;
        product: ({
            owner: {
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
            } | null;
        } & {
            id: number;
            name: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            ownerUserId: number | null;
            description: string | null;
            images: string | null;
            basePrice: import("@prisma/client/runtime/library").Decimal | null;
            commissionPct: import("@prisma/client/runtime/library").Decimal;
            providerDesiredPct: import("@prisma/client/runtime/library").Decimal;
        }) | null;
        seller: {
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
        } | null;
    } & {
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        referrerUserId: number | null;
        managerUserId: number | null;
        productId: number | null;
        sellerUserId: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        closedAt: Date | null;
        customerName: string | null;
        customerPhone: string | null;
        customerEmail: string | null;
    }>;
    updateBooking(id: number, updateBookingDto: UpdateBookingDto, req: AuthenticatedRequest): Promise<{
        referrer: {
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
        } | null;
        manager: {
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
        } | null;
        product: ({
            owner: {
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
            } | null;
        } & {
            id: number;
            name: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            ownerUserId: number | null;
            description: string | null;
            images: string | null;
            basePrice: import("@prisma/client/runtime/library").Decimal | null;
            commissionPct: import("@prisma/client/runtime/library").Decimal;
            providerDesiredPct: import("@prisma/client/runtime/library").Decimal;
        }) | null;
        seller: {
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
        } | null;
    } & {
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        referrerUserId: number | null;
        managerUserId: number | null;
        productId: number | null;
        sellerUserId: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        closedAt: Date | null;
        customerName: string | null;
        customerPhone: string | null;
        customerEmail: string | null;
    }>;
    updateBookingStatus(id: number, updateStatusDto: UpdateBookingStatusDto): Promise<({
        referrer: {
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
        } | null;
        manager: {
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
        } | null;
        product: ({
            owner: {
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
            } | null;
        } & {
            id: number;
            name: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            ownerUserId: number | null;
            description: string | null;
            images: string | null;
            basePrice: import("@prisma/client/runtime/library").Decimal | null;
            commissionPct: import("@prisma/client/runtime/library").Decimal;
            providerDesiredPct: import("@prisma/client/runtime/library").Decimal;
        }) | null;
        seller: {
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
        } | null;
    } & {
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        referrerUserId: number | null;
        managerUserId: number | null;
        productId: number | null;
        sellerUserId: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        closedAt: Date | null;
        customerName: string | null;
        customerPhone: string | null;
        customerEmail: string | null;
    }) | null>;
    deleteBooking(id: number, req: AuthenticatedRequest): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        referrerUserId: number | null;
        managerUserId: number | null;
        productId: number | null;
        sellerUserId: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        closedAt: Date | null;
        customerName: string | null;
        customerPhone: string | null;
        customerEmail: string | null;
    }>;
    getAllWallets(page?: string, limit?: string): Promise<{
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
    createWalletAdjustment(createAdjustmentDto: CreateAdjustmentDto, req: AuthenticatedRequest): Promise<{
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
    getAllUsers(page?: string, limit?: string): Promise<{
        users: {
            currentRank: {
                id: number;
                name: string;
            } | null;
            latestRevenue: {
                amount: number;
                date: string | undefined;
            } | null;
            manager: {
                currentRank: {
                    id: number;
                    name: string;
                } | null;
                id: number;
                email: string | null;
                referralCode: string | null;
                fullName: string;
            } | null;
            referrer: {
                currentRank: {
                    id: number;
                    name: string;
                } | null;
                id: number;
                email: string | null;
                referralCode: string | null;
                fullName: string;
            } | null;
            id: number;
            role: string;
            email: string | null;
            referralCode: string | null;
            fullName: string;
            status: string;
            createdAt: Date;
            wallet: {
                balance: import("@prisma/client/runtime/library").Decimal;
            } | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    createUser(createUserDto: any): Promise<{
        id: number;
        role: string;
        email: string | null;
        referralCode: string | null;
        fullName: string;
        status: string;
        createdAt: Date;
    }>;
    getUser(id: number): Promise<{
        id: number;
        email: string | null;
        referralCode: string | null;
        fullName: string;
        referredBy: number | null;
        managerId: number | null;
        status: string;
        createdAt: Date;
        wallet: {
            id: number;
            balance: import("@prisma/client/runtime/library").Decimal;
        } | null;
        referrer: {
            id: number;
            referralCode: string | null;
            fullName: string;
        } | null;
        referrals: {
            id: number;
            email: string | null;
            fullName: string;
            createdAt: Date;
        }[];
        manager: {
            id: number;
            email: string | null;
            referralCode: string | null;
            fullName: string;
        } | null;
        managedUsers: {
            id: number;
            email: string | null;
            referralCode: string | null;
            fullName: string;
        }[];
        _count: {
            managerBookings: number;
            referrerBookings: number;
            sellerBookings: number;
            referrals: number;
        };
    }>;
    updateUserStatus(id: number, status: string): Promise<{
        id: number;
        email: string | null;
        referralCode: string | null;
        fullName: string;
        status: string;
        createdAt: Date;
    }>;
    updateUserRole(id: number, role: string): Promise<{
        id: number;
        role: string;
        email: string | null;
        referralCode: string | null;
        fullName: string;
        status: string;
        createdAt: Date;
    }>;
    assignUserManager(id: number, managerId: number | null): Promise<{
        id: number;
        role: string;
        email: string | null;
        referralCode: string | null;
        fullName: string;
        status: string;
        createdAt: Date;
        manager: {
            id: number;
            email: string | null;
            referralCode: string | null;
            fullName: string;
        } | null;
    }>;
    getRevenueStats(): Promise<{
        totalRevenue: number;
        revenueByStatus: {
            status: string;
            amount: number;
        }[];
        revenueByRole: {
            role: string;
            amount: number;
        }[];
        totalUsers: number;
        totalBookings: number;
    }>;
    getAllRevenueEntries(page?: string, limit?: string): Promise<any>;
    recalculateAllRevenue(): Promise<{
        message: string;
    }>;
    getBookingCommissionFromLedger(bookingId: number): Promise<any>;
}
export {};
