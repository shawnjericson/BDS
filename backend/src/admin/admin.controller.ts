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
import { ProductsService } from '../products/products.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto, UpdateProductStatusDto, ProductStatus } from '../products/dto/update-product.dto';
import { BookingsService } from '../bookings/bookings.service';
import { CreateBookingDto } from '../bookings/dto/create-booking.dto';
import { UpdateBookingDto, UpdateBookingStatusDto, BookingStatus } from '../bookings/dto/update-booking.dto';
import { WalletsService } from '../wallets/wallets.service';
import { CreateAdjustmentDto } from '../wallets/dto/create-wallet-transaction.dto';
import { UsersService } from '../users/users.service';
import { RevenueLedgerService } from '../revenue/revenue-ledger.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
  };
}

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly bookingsService: BookingsService,
    private readonly walletsService: WalletsService,
    private readonly usersService: UsersService,
    private readonly revenueLedgerService: RevenueLedgerService,
  ) {}

  // Product Management
  @Get('products')
  getAllProducts(@Query('status') status?: ProductStatus) {
    return this.productsService.findAll(status);
  }

  @Post('products')
  createProduct(@Body() createProductDto: CreateProductDto, @Request() req: AuthenticatedRequest) {
    return this.productsService.create(createProductDto, req.user.id);
  }

  @Patch('products/:id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.productsService.update(id, updateProductDto, req.user.id, true); // isAdmin = true
  }

  @Patch('products/:id/status')
  updateProductStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateProductStatusDto,
  ) {
    return this.productsService.updateStatus(id, updateStatusDto);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id', ParseIntPipe) id: number, @Request() req: AuthenticatedRequest) {
    return this.productsService.remove(id, req.user.id, true); // isAdmin = true
  }

  // Booking Management
  @Get('bookings')
  getAllBookings(@Query('status') status?: BookingStatus) {
    return this.bookingsService.findAll(status);
  }

  @Post('bookings')
  createBooking(@Body() createBookingDto: CreateBookingDto, @Request() req: AuthenticatedRequest) {
    return this.bookingsService.create(createBookingDto, req.user.id);
  }

  @Patch('bookings/:id')
  updateBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingDto: UpdateBookingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.bookingsService.update(id, updateBookingDto, req.user.id, true); // isAdmin = true
  }

  @Patch('bookings/:id/status')
  updateBookingStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateBookingStatusDto,
  ) {
    console.log(`🔄 Admin updating booking ${id} to status: ${updateStatusDto.status}`);
    return this.bookingsService.updateStatus(id, updateStatusDto);
  }

  @Delete('bookings/:id')
  deleteBooking(@Param('id', ParseIntPipe) id: number, @Request() req: AuthenticatedRequest) {
    return this.bookingsService.remove(id, req.user.id, true); // isAdmin = true
  }

  // Wallet Management
  @Get('wallets')
  getAllWallets(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.walletsService.getAllWallets(pageNum, limitNum);
  }

  @Get('wallets/stats')
  getWalletStats() {
    return this.walletsService.getWalletStats();
  }

  @Get('wallets/:id')
  getWallet(@Param('id', ParseIntPipe) id: number) {
    return this.walletsService.getWalletById(id);
  }

  @Post('wallet-adjustments')
  createWalletAdjustment(@Body() createAdjustmentDto: CreateAdjustmentDto, @Request() req: AuthenticatedRequest) {
    return this.walletsService.createAdjustment(createAdjustmentDto, req.user.id);
  }

  // User Management
  @Get('users')
  getAllUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.usersService.findAll(pageNum, limitNum);
  }

  @Post('users')
  createUser(@Body() createUserDto: any) {
    return this.usersService.createByAdmin(createUserDto);
  }

  @Get('users/:id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.usersService.updateStatus(id, status);
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string,
  ) {
    return this.usersService.updateRole(id, role);
  }

  @Patch('users/:id/manager')
  assignUserManager(
    @Param('id', ParseIntPipe) id: number,
    @Body('managerId') managerId: number | null,
  ) {
    return this.usersService.assignManager(id, managerId);
  }

  // Revenue Management
  @Get('revenue/stats')
  async getRevenueStats() {
    // Get overall revenue statistics
    const totalRevenue = await this.revenueLedgerService.getTotalRevenue();
    const revenueByStatus = await this.revenueLedgerService.getRevenueByStatus();
    const revenueByRole = await this.revenueLedgerService.getRevenueByRole();
    const totalUsers = await this.usersService.getTotalUsersCount();
    const totalBookings = await this.bookingsService.getTotalBookingsCount();

    return {
      totalRevenue,
      revenueByStatus,
      revenueByRole,
      totalUsers,
      totalBookings
    };
  }

  @Get('revenue/entries')
  async getAllRevenueEntries(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 50;
    return this.revenueLedgerService.getAllRevenueEntries(pageNum, limitNum);
  }

  @Post('revenue/recalculate')
  async recalculateAllRevenue() {
    await this.revenueLedgerService.recalculateAllRevenue();
    return { message: 'Revenue recalculation completed' };
  }

  @Get('bookings/:id/commission-ledger')
  async getBookingCommissionFromLedger(@Param('id', ParseIntPipe) bookingId: number) {
    return await this.revenueLedgerService.getBookingCommissionFromLedger(bookingId);
  }
}
