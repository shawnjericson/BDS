import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto, UpdateProductStatusDto, ProductStatus } from './dto/update-product.dto';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProductDto: CreateProductDto, userId: number): Promise<{
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
    findAll(status?: ProductStatus, userId?: number): Promise<{
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
    findOne(id: number): Promise<{
        price: number | null;
        images: any;
        bookings: {
            id: number;
            status: string;
            price: import("@prisma/client/runtime/library").Decimal;
            closedAt: Date | null;
            seller: {
                id: number;
                fullName: string;
            } | null;
        }[];
        owner: {
            id: number;
            email: string | null;
            fullName: string;
        } | null;
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
    }>;
    update(id: number, updateProductDto: UpdateProductDto, userId: number, isAdmin?: boolean): Promise<{
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
    updateStatus(id: number, updateStatusDto: UpdateProductStatusDto): Promise<{
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
    remove(id: number, userId: number, isAdmin?: boolean): Promise<{
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
    getMyProducts(userId: number): Promise<{
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
    getApprovedProducts(): Promise<{
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
}
