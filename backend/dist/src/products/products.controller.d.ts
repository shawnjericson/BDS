import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto, ProductStatus } from './dto/update-product.dto';
interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        email: string;
    };
}
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto, req: AuthenticatedRequest): Promise<{
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
    findAll(status?: ProductStatus, userId?: string): Promise<{
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
    getMyProducts(req: AuthenticatedRequest): Promise<{
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
    update(id: number, updateProductDto: UpdateProductDto, req: AuthenticatedRequest): Promise<{
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
    remove(id: number, req: AuthenticatedRequest): Promise<{
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
}
export {};
