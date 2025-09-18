import { RanksService } from './ranks.service';
import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';
import { UpdateRankSharesDto, AssignUserRankDto } from './dto/rank-share.dto';
export declare class RanksController {
    private readonly ranksService;
    constructor(ranksService: RanksService);
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
    getRankShares(id: number): Promise<{
        id: number;
        role: string | null;
        rankId: number | null;
        pct: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    updateRankShares(id: number, body: UpdateRankSharesDto): Promise<({
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
}
export declare class UserRanksController {
    private readonly ranksService;
    constructor(ranksService: RanksService);
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
    assignUserRank(userId: number, body: AssignUserRankDto): Promise<{
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
}
