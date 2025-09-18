import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';
import { RankShareDto } from './dto/rank-share.dto';

@Injectable()
export class RanksService {
  constructor(private prisma: PrismaService) {}

  async create(createRankDto: CreateRankDto) {
    return this.prisma.rank.create({
      data: createRankDto,
      include: {
        rankShares: true,
      },
    });
  }

  async findAll() {
    return this.prisma.rank.findMany({
      include: {
        rankShares: true,
        _count: {
          select: {
            userRanks: {
              where: {
                effectiveTo: null, // Only count current assignments
              },
            },
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const rank = await this.prisma.rank.findUnique({
      where: { id },
      include: {
        rankShares: true,
        userRanks: {
          where: {
            effectiveTo: null,
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!rank) {
      throw new NotFoundException('Rank not found');
    }

    return rank;
  }

  async update(id: number, updateRankDto: UpdateRankDto) {
    const rank = await this.findOne(id);

    return this.prisma.rank.update({
      where: { id },
      data: updateRankDto,
      include: {
        rankShares: true,
      },
    });
  }

  async remove(id: number) {
    const rank = await this.findOne(id);

    // Check if rank has active users
    const activeUsers = await this.prisma.userRank.count({
      where: {
        rankId: id,
        effectiveTo: null,
      },
    });

    if (activeUsers > 0) {
      throw new BadRequestException('Cannot delete rank with active users');
    }

    // Use transaction to delete shares first, then rank
    return this.prisma.$transaction(async (prisma) => {
      // Delete all rank shares first
      await prisma.rankShare.deleteMany({
        where: { rankId: id },
      });

      // Delete all user ranks
      await prisma.userRank.deleteMany({
        where: { rankId: id },
      });

      // Finally delete the rank
      return prisma.rank.delete({
        where: { id },
      });
    });
  }

  async updateRankShares(rankId: number, shares: RankShareDto[]) {
    const rank = await this.findOne(rankId);

    return this.prisma.$transaction(async (prisma) => {
      // Delete existing shares
      await prisma.rankShare.deleteMany({
        where: { rankId },
      });

      // Create new shares
      if (shares.length > 0) {
        await prisma.rankShare.createMany({
          data: shares.map(share => ({
            rankId,
            role: share.role,
            pct: share.pct,
          })),
        });
      }

      // Return updated rank with shares
      return prisma.rank.findUnique({
        where: { id: rankId },
        include: {
          rankShares: true,
        },
      });
    });
  }

  async getRankShares(rankId: number) {
    const rank = await this.findOne(rankId);
    return rank.rankShares;
  }

  async assignUserRank(userId: number, rankId: number) {
    // Verify rank exists
    await this.findOne(rankId);

    // Verify user exists
    const user = await this.prisma.appUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.$transaction(async (prisma) => {
      // End current rank assignment if exists
      await prisma.userRank.updateMany({
        where: {
          userId,
          effectiveTo: null,
        },
        data: {
          effectiveTo: new Date(),
        },
      });

      // Create new rank assignment
      return prisma.userRank.create({
        data: {
          userId,
          rankId,
          effectiveFrom: new Date(),
        },
        include: {
          rank: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });
    });
  }

  async removeUserRank(userId: number, rankId: number) {
    const userRank = await this.prisma.userRank.findFirst({
      where: {
        userId,
        rankId,
        effectiveTo: null,
      },
    });

    if (!userRank) {
      throw new NotFoundException('User rank assignment not found');
    }

    return this.prisma.userRank.update({
      where: {
        userId_rankId_effectiveFrom: {
          userId: userRank.userId,
          rankId: userRank.rankId,
          effectiveFrom: userRank.effectiveFrom,
        },
      },
      data: {
        effectiveTo: new Date(),
      },
    });
  }

  async getUserRanks(userId: number) {
    return this.prisma.userRank.findMany({
      where: { userId },
      include: {
        rank: true,
      },
      orderBy: {
        effectiveFrom: 'desc',
      },
    });
  }

  async getCurrentUserRank(userId: number) {
    return this.prisma.userRank.findFirst({
      where: {
        userId,
        effectiveTo: null,
      },
      include: {
        rank: true,
      },
      orderBy: {
        effectiveFrom: 'desc',
      },
    });
  }
}
