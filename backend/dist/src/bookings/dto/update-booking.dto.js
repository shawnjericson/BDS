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
exports.UpdateBookingStatusDto = exports.UpdateBookingDto = exports.BookingStatus = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_booking_dto_1 = require("./create-booking.dto");
const class_validator_1 = require("class-validator");
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "PENDING";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["COMPLETED"] = "COMPLETED";
    BookingStatus["CANCELLED"] = "CANCELLED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
class UpdateBookingDto extends (0, mapped_types_1.PartialType)(create_booking_dto_1.CreateBookingDto) {
}
exports.UpdateBookingDto = UpdateBookingDto;
class UpdateBookingStatusDto {
    status;
    reason;
}
exports.UpdateBookingStatusDto = UpdateBookingStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(BookingStatus),
    __metadata("design:type", String)
], UpdateBookingStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateBookingStatusDto.prototype, "reason", void 0);
//# sourceMappingURL=update-booking.dto.js.map