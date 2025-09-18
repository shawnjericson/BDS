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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRanksController = exports.RanksController = void 0;
const common_1 = require("@nestjs/common");
const ranks_service_1 = require("./ranks.service");
const create_rank_dto_1 = require("./dto/create-rank.dto");
const update_rank_dto_1 = require("./dto/update-rank.dto");
const rank_share_dto_1 = require("./dto/rank-share.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let RanksController = class RanksController {
    ranksService;
    constructor(ranksService) {
        this.ranksService = ranksService;
    }
    create(createRankDto) {
        return this.ranksService.create(createRankDto);
    }
    findAll() {
        return this.ranksService.findAll();
    }
    findOne(id) {
        return this.ranksService.findOne(id);
    }
    update(id, updateRankDto) {
        return this.ranksService.update(id, updateRankDto);
    }
    remove(id) {
        return this.ranksService.remove(id);
    }
    getRankShares(id) {
        return this.ranksService.getRankShares(id);
    }
    updateRankShares(id, body) {
        console.log('updateRankShares received:', { id, body });
        return this.ranksService.updateRankShares(id, body.shares);
    }
};
exports.RanksController = RanksController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_rank_dto_1.CreateRankDto]),
    __metadata("design:returntype", void 0)
], RanksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RanksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RanksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_rank_dto_1.UpdateRankDto]),
    __metadata("design:returntype", void 0)
], RanksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RanksController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/shares'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RanksController.prototype, "getRankShares", null);
__decorate([
    (0, common_1.Patch)(':id/shares'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, rank_share_dto_1.UpdateRankSharesDto]),
    __metadata("design:returntype", void 0)
], RanksController.prototype, "updateRankShares", null);
exports.RanksController = RanksController = __decorate([
    (0, common_1.Controller)('admin/ranks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ranks_service_1.RanksService])
], RanksController);
let UserRanksController = class UserRanksController {
    ranksService;
    constructor(ranksService) {
        this.ranksService = ranksService;
    }
    getUserRanks(userId) {
        return this.ranksService.getUserRanks(userId);
    }
    assignUserRank(userId, body) {
        return this.ranksService.assignUserRank(userId, body.rankId);
    }
    removeUserRank(userId, rankId) {
        return this.ranksService.removeUserRank(userId, rankId);
    }
};
exports.UserRanksController = UserRanksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserRanksController.prototype, "getUserRanks", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, rank_share_dto_1.AssignUserRankDto]),
    __metadata("design:returntype", void 0)
], UserRanksController.prototype, "assignUserRank", null);
__decorate([
    (0, common_1.Delete)(':rankId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('rankId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], UserRanksController.prototype, "removeUserRank", null);
exports.UserRanksController = UserRanksController = __decorate([
    (0, common_1.Controller)('admin/users/:userId/ranks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ranks_service_1.RanksService])
], UserRanksController);
//# sourceMappingURL=ranks.controller.js.map