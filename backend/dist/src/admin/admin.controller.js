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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("../products/products.service");
const create_product_dto_1 = require("../products/dto/create-product.dto");
const update_product_dto_1 = require("../products/dto/update-product.dto");
const bookings_service_1 = require("../bookings/bookings.service");
const create_booking_dto_1 = require("../bookings/dto/create-booking.dto");
const update_booking_dto_1 = require("../bookings/dto/update-booking.dto");
const wallets_service_1 = require("../wallets/wallets.service");
const create_wallet_transaction_dto_1 = require("../wallets/dto/create-wallet-transaction.dto");
const users_service_1 = require("../users/users.service");
const revenue_ledger_service_1 = require("../revenue/revenue-ledger.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let AdminController = class AdminController {
    productsService;
    bookingsService;
    walletsService;
    usersService;
    revenueLedgerService;
    constructor(productsService, bookingsService, walletsService, usersService, revenueLedgerService) {
        this.productsService = productsService;
        this.bookingsService = bookingsService;
        this.walletsService = walletsService;
        this.usersService = usersService;
        this.revenueLedgerService = revenueLedgerService;
    }
    getAllProducts(status) {
        return this.productsService.findAll(status);
    }
    createProduct(createProductDto, req) {
        return this.productsService.create(createProductDto, req.user.id);
    }
    updateProduct(id, updateProductDto, req) {
        return this.productsService.update(id, updateProductDto, req.user.id, true);
    }
    updateProductStatus(id, updateStatusDto) {
        return this.productsService.updateStatus(id, updateStatusDto);
    }
    deleteProduct(id, req) {
        return this.productsService.remove(id, req.user.id, true);
    }
    getAllBookings(status) {
        return this.bookingsService.findAll(status);
    }
    createBooking(createBookingDto, req) {
        return this.bookingsService.create(createBookingDto, req.user.id);
    }
    updateBooking(id, updateBookingDto, req) {
        return this.bookingsService.update(id, updateBookingDto, req.user.id, true);
    }
    updateBookingStatus(id, updateStatusDto) {
        console.log(`🔄 Admin updating booking ${id} to status: ${updateStatusDto.status}`);
        return this.bookingsService.updateStatus(id, updateStatusDto);
    }
    deleteBooking(id, req) {
        return this.bookingsService.remove(id, req.user.id, true);
    }
    getAllWallets(page, limit) {
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 20;
        return this.walletsService.getAllWallets(pageNum, limitNum);
    }
    getWalletStats() {
        return this.walletsService.getWalletStats();
    }
    getWallet(id) {
        return this.walletsService.getWalletById(id);
    }
    createWalletAdjustment(createAdjustmentDto, req) {
        return this.walletsService.createAdjustment(createAdjustmentDto, req.user.id);
    }
    getAllUsers(page, limit) {
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 20;
        return this.usersService.findAll(pageNum, limitNum);
    }
    createUser(createUserDto) {
        return this.usersService.createByAdmin(createUserDto);
    }
    getUser(id) {
        return this.usersService.findOne(id);
    }
    updateUserStatus(id, status) {
        return this.usersService.updateStatus(id, status);
    }
    updateUserRole(id, role) {
        return this.usersService.updateRole(id, role);
    }
    assignUserManager(id, managerId) {
        return this.usersService.assignManager(id, managerId);
    }
    async getRevenueStats() {
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
    async getAllRevenueEntries(page, limit) {
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 50;
        return this.revenueLedgerService.getAllRevenueEntries(pageNum, limitNum);
    }
    async recalculateAllRevenue() {
        await this.revenueLedgerService.recalculateAllRevenue();
        return { message: 'Revenue recalculation completed' };
    }
    async getBookingCommissionFromLedger(bookingId) {
        return await this.revenueLedgerService.getBookingCommissionFromLedger(bookingId);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllProducts", null);
__decorate([
    (0, common_1.Post)('products'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Patch)('products/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_dto_1.UpdateProductDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Patch)('products/:id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_dto_1.UpdateProductStatusDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateProductStatus", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Get)('bookings'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllBookings", null);
__decorate([
    (0, common_1.Post)('bookings'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_booking_dto_1.CreateBookingDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createBooking", null);
__decorate([
    (0, common_1.Patch)('bookings/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_booking_dto_1.UpdateBookingDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateBooking", null);
__decorate([
    (0, common_1.Patch)('bookings/:id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_booking_dto_1.UpdateBookingStatusDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateBookingStatus", null);
__decorate([
    (0, common_1.Delete)('bookings/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteBooking", null);
__decorate([
    (0, common_1.Get)('wallets'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllWallets", null);
__decorate([
    (0, common_1.Get)('wallets/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getWalletStats", null);
__decorate([
    (0, common_1.Get)('wallets/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Post)('wallet-adjustments'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_wallet_transaction_dto_1.CreateAdjustmentDto, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createWalletAdjustment", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Post)('users'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Patch)('users/:id/role'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Patch)('users/:id/manager'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('managerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "assignUserManager", null);
__decorate([
    (0, common_1.Get)('revenue/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRevenueStats", null);
__decorate([
    (0, common_1.Get)('revenue/entries'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllRevenueEntries", null);
__decorate([
    (0, common_1.Post)('revenue/recalculate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "recalculateAllRevenue", null);
__decorate([
    (0, common_1.Get)('bookings/:id/commission-ledger'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBookingCommissionFromLedger", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        bookings_service_1.BookingsService,
        wallets_service_1.WalletsService,
        users_service_1.UsersService,
        revenue_ledger_service_1.RevenueLedgerService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map