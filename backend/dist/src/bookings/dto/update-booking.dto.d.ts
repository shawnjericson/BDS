import { CreateBookingDto } from './create-booking.dto';
export declare enum BookingStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
declare const UpdateBookingDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateBookingDto>>;
export declare class UpdateBookingDto extends UpdateBookingDto_base {
}
export declare class UpdateBookingStatusDto {
    status: BookingStatus;
    reason?: string;
}
export {};
