"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRankDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_rank_dto_1 = require("./create-rank.dto");
class UpdateRankDto extends (0, mapped_types_1.PartialType)(create_rank_dto_1.CreateRankDto) {
}
exports.UpdateRankDto = UpdateRankDto;
//# sourceMappingURL=update-rank.dto.js.map