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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const update_product_dto_1 = require("./dto/update-product.dto");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProductDto, userId) {
        const { ownerUserId, ...productData } = createProductDto;
        if (productData.providerDesiredPct > productData.commissionPct) {
            throw new common_1.BadRequestException('Provider desired percentage cannot be greater than commission percentage');
        }
        const finalOwnerUserId = ownerUserId || userId;
        const product = await this.prisma.product.create({
            data: {
                ...productData,
                ownerUserId: finalOwnerUserId,
                status: 'SUBMITTED',
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
        return product;
    }
    async findAll(status, userId) {
        const where = {};
        if (status) {
            where.status = status;
        }
        if (userId) {
            where.ownerUserId = userId;
        }
        const products = await this.prisma.product.findMany({
            where,
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                bookings: {
                    select: {
                        price: true,
                        status: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
                _count: {
                    select: {
                        bookings: true,
                    },
                },
            },
            orderBy: {
                id: 'desc',
            },
        });
        return products.map(product => ({
            ...product,
            price: product.bookings.length > 0
                ? Number(product.bookings[0].price)
                : product.basePrice
                    ? Number(product.basePrice)
                    : null,
            images: product.images ? JSON.parse(product.images) : [],
            bookings: undefined,
        }));
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                bookings: {
                    select: {
                        id: true,
                        price: true,
                        status: true,
                        closedAt: true,
                        seller: {
                            select: {
                                id: true,
                                fullName: true,
                            },
                        },
                    },
                    orderBy: {
                        id: 'desc',
                    },
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return {
            ...product,
            price: product.bookings.length > 0
                ? Number(product.bookings[0].price)
                : product.basePrice
                    ? Number(product.basePrice)
                    : null,
            images: product.images ? JSON.parse(product.images) : [],
        };
    }
    async update(id, updateProductDto, userId, isAdmin = false) {
        const product = await this.findOne(id);
        if (!isAdmin && product.ownerUserId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own products');
        }
        const commissionPct = updateProductDto.commissionPct ?? Number(product.commissionPct);
        const providerDesiredPct = updateProductDto.providerDesiredPct ?? Number(product.providerDesiredPct);
        if (providerDesiredPct > commissionPct) {
            throw new common_1.BadRequestException('Provider desired percentage cannot be greater than commission percentage');
        }
        return this.prisma.product.update({
            where: { id },
            data: updateProductDto,
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
    }
    async updateStatus(id, updateStatusDto) {
        await this.findOne(id);
        return this.prisma.product.update({
            where: { id },
            data: {
                status: updateStatusDto.status,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
    }
    async remove(id, userId, isAdmin = false) {
        const product = await this.findOne(id);
        if (!isAdmin && product.ownerUserId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own products');
        }
        const bookingCount = await this.prisma.booking.count({
            where: { productId: id },
        });
        if (bookingCount > 0) {
            throw new common_1.BadRequestException('Cannot delete product with existing bookings');
        }
        return this.prisma.product.delete({
            where: { id },
        });
    }
    async getMyProducts(userId) {
        return this.findAll(undefined, userId);
    }
    async getApprovedProducts() {
        return this.findAll(update_product_dto_1.ProductStatus.APPROVED);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map