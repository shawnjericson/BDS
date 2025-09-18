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
exports.AssignUserRankDto = exports.UpdateRankSharesDto = exports.RankShareDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class RankShareDto {
    role;
    pct;
}
exports.RankShareDto = RankShareDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RankShareDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.0001),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], RankShareDto.prototype, "pct", void 0);
class UpdateRankSharesDto {
    shares;
}
exports.UpdateRankSharesDto = UpdateRankSharesDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RankShareDto),
    __metadata("design:type", Array)
], UpdateRankSharesDto.prototype, "shares", void 0);
class AssignUserRankDto {
    rankId;
}
exports.AssignUserRankDto = AssignUserRankDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AssignUserRankDto.prototype, "rankId", void 0);
//# sourceMappingURL=rank-share.dto.js.map