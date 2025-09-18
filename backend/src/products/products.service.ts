import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto, UpdateProductStatusDto, ProductStatus } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, userId: number) {
    const { ownerUserId, ...productData } = createProductDto;
    
    // Validate commission percentages
    if (productData.providerDesiredPct > productData.commissionPct) {
      throw new BadRequestException('Provider desired percentage cannot be greater than commission percentage');
    }

    // Use provided ownerUserId (for admin) or current user
    const finalOwnerUserId = ownerUserId || userId;

    const product = await this.prisma.product.create({
      data: {
        ...productData,
        ownerUserId: finalOwnerUserId,
        status: 'SUBMITTED', // Default status
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

  async findAll(status?: ProductStatus, userId?: number) {
    const where: any = {};

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
          take: 1, // Get latest booking for price reference
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

    // Transform products to include price from latest booking or base price
    return products.map(product => ({
      ...product,
      price: product.bookings.length > 0
        ? Number(product.bookings[0].price)
        : product.basePrice
          ? Number(product.basePrice)
          : null,
      images: product.images ? JSON.parse(product.images) : [],
      bookings: undefined, // Remove bookings from response to keep it clean
    }));
  }

  async findOne(id: number) {
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
      throw new NotFoundException('Product not found');
    }

    // Transform product to include parsed images and price from latest booking or base price
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

  async update(id: number, updateProductDto: UpdateProductDto, userId: number, isAdmin = false) {
    const product = await this.findOne(id);

    // Check ownership unless admin
    if (!isAdmin && product.ownerUserId !== userId) {
      throw new ForbiddenException('You can only update your own products');
    }

    // Validate commission percentages if provided
    const commissionPct = updateProductDto.commissionPct ?? Number(product.commissionPct);
    const providerDesiredPct = updateProductDto.providerDesiredPct ?? Number(product.providerDesiredPct);
    
    if (providerDesiredPct > commissionPct) {
      throw new BadRequestException('Provider desired percentage cannot be greater than commission percentage');
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

  async updateStatus(id: number, updateStatusDto: UpdateProductStatusDto) {
    await this.findOne(id); // Verify product exists

    return this.prisma.product.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
        // You might want to add a statusReason field to track rejection reasons
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

  async remove(id: number, userId: number, isAdmin = false) {
    const product = await this.findOne(id);

    // Check ownership unless admin
    if (!isAdmin && product.ownerUserId !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    // Check if product has bookings
    const bookingCount = await this.prisma.booking.count({
      where: { productId: id },
    });

    if (bookingCount > 0) {
      throw new BadRequestException('Cannot delete product with existing bookings');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async getMyProducts(userId: number) {
    return this.findAll(undefined, userId);
  }

  async getApprovedProducts() {
    return this.findAll(ProductStatus.APPROVED);
  }
}
