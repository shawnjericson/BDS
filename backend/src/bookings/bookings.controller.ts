import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto, UpdateBookingStatusDto, BookingStatus } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
  };
}

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createBookingDto: CreateBookingDto, @Request() req: AuthenticatedRequest) {
    try {
      console.log('📝 Creating booking with data:', createBookingDto);
      console.log('👤 User ID:', req.user.id);

      const result = await this.bookingsService.create(createBookingDto, req.user.id);
      console.log('✅ Booking created successfully:', result.id);

      return result;
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('status') status?: BookingStatus, @Query('userId') userId?: string) {
    const userIdNum = userId ? parseInt(userId) : undefined;
    return this.bookingsService.findAll(status, userIdNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-bookings')
  getMyBookings(@Request() req: AuthenticatedRequest) {
    return this.bookingsService.getMyBookings(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingDto: UpdateBookingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.bookingsService.update(id, updateBookingDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: AuthenticatedRequest) {
    return this.bookingsService.remove(id, req.user.id);
  }

  @Get(':id/commission-info')
  getCommissionInfo(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.getCommissionInfo(id);
  }

  @Get(':id/calculate-commission')
  calculateCommission(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.calculateCommission(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/my-commission')
  getMyCommission(@Param('id', ParseIntPipe) id: number, @Request() req: AuthenticatedRequest) {
    return this.bookingsService.getMyCommissionForBooking(id, req.user.id);
  }
}
