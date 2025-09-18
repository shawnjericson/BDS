import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto, BookingStatus } from './dto/update-booking.dto';
interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        email: string;
    };
}
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(createBookingDto: CreateBookingDto, req: AuthenticatedRequest): Promise<{
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
    findAll(status?: BookingStatus, userId?: string): Promise<({
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
    getMyBookings(req: AuthenticatedRequest): Promise<({
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
    findOne(id: number): Promise<{
        revenueLedger: ({
            beneficiaryUser: {
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
            role: string | null;
            pct: import("@prisma/client/runtime/library").Decimal | null;
            createdAt: Date | null;
            amount: import("@prisma/client/runtime/library").Decimal | null;
            bookingId: number | null;
            beneficiaryUserId: number | null;
        })[];
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
    update(id: number, updateBookingDto: UpdateBookingDto, req: AuthenticatedRequest): Promise<{
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
    remove(id: number, req: AuthenticatedRequest): Promise<{
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
    getCommissionInfo(id: number): Promise<import("./dto/commission-info.dto").CommissionInfoDto>;
    calculateCommission(id: number): Promise<import("./dto/commission-calculation.dto").CommissionCalculationDto>;
    getMyCommission(id: number, req: AuthenticatedRequest): Promise<{
        bookingId: number;
        bookingPrice: import("@prisma/client/runtime/library").Decimal;
        productName: string;
        userRoles: string[];
        userCommission: number;
        commissionDetails: any[];
        totalCommission: number;
        createdAt: Date;
        status: string;
    }>;
}
export {};
