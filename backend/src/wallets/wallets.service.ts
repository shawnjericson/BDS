import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWalletTransactionDto, CreateAdjustmentDto, TransactionType } from './dto/create-wallet-transaction.dto';

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService) {}

  async getWalletSummary(userId: number) {
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
      throw new NotFoundException('Wallet not found');
    }

    // Get recent transactions
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

    // Get total earnings by type
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

  async getWalletTransactions(userId: number, page = 1, limit = 20) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
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

  async createTransaction(createTransactionDto: CreateWalletTransactionDto, createdBy?: number) {
    const { walletId, amount, type, refId, description } = createTransactionDto;

    // Get current wallet
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      include: { user: true },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Calculate new balance
    const newBalance = Number(wallet.balance) + amount;

    if (newBalance < 0) {
      throw new BadRequestException('Insufficient balance');
    }

    // Create transaction in a database transaction
    return this.prisma.$transaction(async (prisma) => {
      // Create wallet transaction
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

      // Update wallet balance
      await prisma.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance },
      });

      return transaction;
    });
  }

  async createAdjustment(createAdjustmentDto: CreateAdjustmentDto, createdBy: number) {
    const { userId, amount, description } = createAdjustmentDto;

    // Get user's wallet
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('User wallet not found');
    }

    // Determine transaction type based on amount
    const type = amount > 0 ? TransactionType.ADJUSTMENT_CREDIT : TransactionType.ADJUSTMENT_DEBIT;

    return this.createTransaction(
      {
        walletId: wallet.id,
        amount,
        type,
        description,
      },
      createdBy,
    );
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

  async getWalletById(walletId: number) {
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
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async getTransactionsByType(userId: number, type?: TransactionType) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const where: any = { walletId: wallet.id };
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
}
