import { PrismaService } from '../prisma/prisma.service';
import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';
import { RankShareDto } from './dto/rank-share.dto';
export declare class RanksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createRankDto: CreateRankDto): Promise<{
        rankShares: {
            id: number;
            role: string | null;
            rankId: number | null;
            pct: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: number;
        name: string;
    }>;
    findAll(): Promise<({
        rankShares: {
            id: number;
            role: string | null;
            rankId: number | null;
            pct: import("@prisma/client/runtime/library").Decimal;
        }[];
        _count: {
            userRanks: number;
        };
    } & {
        id: number;
        name: string;
    })[]>;
    findOne(id: number): Promise<{
        rankShares: {
            id: number;
            role: string | null;
            rankId: number | null;
            pct: import("@prisma/client/runtime/library").Decimal;
        }[];
        userRanks: ({
            user: {
                id: number;
                email: string | null;
                fullName: string;
            };
        } & {
            rankId: number;
            userId: number;
            effectiveFrom: Date;
            effectiveTo: Date | null;
        })[];
    } & {
        id: number;
        name: string;
    }>;
    update(id: number, updateRankDto: UpdateRankDto): Promise<{
        rankShares: {
            id: number;
            role: string | null;
            rankId: number | null;
            pct: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: number;
        name: string;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
    }>;
    updateRankShares(rankId: number, shares: RankShareDto[]): Promise<({
        rankShares: {
            id: number;
            role: string | null;
            rankId: number | null;
            pct: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: number;
        name: string;
    }) | null>;
    getRankShares(rankId: number): Promise<{
        id: number;
        role: string | null;
        rankId: number | null;
        pct: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    assignUserRank(userId: number, rankId: number): Promise<{
        rank: {
            id: number;
            name: string;
        };
        user: {
            id: number;
            email: string | null;
            fullName: string;
        };
    } & {
        rankId: number;
        userId: number;
        effectiveFrom: Date;
        effectiveTo: Date | null;
    }>;
    removeUserRank(userId: number, rankId: number): Promise<{
        rankId: number;
        userId: number;
        effectiveFrom: Date;
        effectiveTo: Date | null;
    }>;
    getUserRanks(userId: number): Promise<({
        rank: {
            id: number;
            name: string;
        };
    } & {
        rankId: number;
        userId: number;
        effectiveFrom: Date;
        effectiveTo: Date | null;
    })[]>;
    getCurrentUserRank(userId: number): Promise<({
        rank: {
            id: number;
            name: string;
        };
    } & {
        rankId: number;
        userId: number;
        effectiveFrom: Date;
        effectiveTo: Date | null;
    }) | null>;
}
