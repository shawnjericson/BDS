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
exports.RanksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RanksService = class RanksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createRankDto) {
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
                                effectiveTo: null,
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Rank not found');
        }
        return rank;
    }
    async update(id, updateRankDto) {
        const rank = await this.findOne(id);
        return this.prisma.rank.update({
            where: { id },
            data: updateRankDto,
            include: {
                rankShares: true,
            },
        });
    }
    async remove(id) {
        const rank = await this.findOne(id);
        const activeUsers = await this.prisma.userRank.count({
            where: {
                rankId: id,
                effectiveTo: null,
            },
        });
        if (activeUsers > 0) {
            throw new common_1.BadRequestException('Cannot delete rank with active users');
        }
        return this.prisma.$transaction(async (prisma) => {
            await prisma.rankShare.deleteMany({
                where: { rankId: id },
            });
            await prisma.userRank.deleteMany({
                where: { rankId: id },
            });
            return prisma.rank.delete({
                where: { id },
            });
        });
    }
    async updateRankShares(rankId, shares) {
        const rank = await this.findOne(rankId);
        return this.prisma.$transaction(async (prisma) => {
            await prisma.rankShare.deleteMany({
                where: { rankId },
            });
            if (shares.length > 0) {
                await prisma.rankShare.createMany({
                    data: shares.map(share => ({
                        rankId,
                        role: share.role,
                        pct: share.pct,
                    })),
                });
            }
            return prisma.rank.findUnique({
                where: { id: rankId },
                include: {
                    rankShares: true,
                },
            });
        });
    }
    async getRankShares(rankId) {
        const rank = await this.findOne(rankId);
        return rank.rankShares;
    }
    async assignUserRank(userId, rankId) {
        await this.findOne(rankId);
        const user = await this.prisma.appUser.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.prisma.$transaction(async (prisma) => {
            await prisma.userRank.updateMany({
                where: {
                    userId,
                    effectiveTo: null,
                },
                data: {
                    effectiveTo: new Date(),
                },
            });
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
    async removeUserRank(userId, rankId) {
        const userRank = await this.prisma.userRank.findFirst({
            where: {
                userId,
                rankId,
                effectiveTo: null,
            },
        });
        if (!userRank) {
            throw new common_1.NotFoundException('User rank assignment not found');
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
    async getUserRanks(userId) {
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
    async getCurrentUserRank(userId) {
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
};
exports.RanksService = RanksService;
exports.RanksService = RanksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RanksService);
//# sourceMappingURL=ranks.service.js.map