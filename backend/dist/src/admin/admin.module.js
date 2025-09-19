"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_controller_1 = require("./admin.controller");
const downline_controller_1 = require("./downline.controller");
const products_module_1 = require("../products/products.module");
const bookings_module_1 = require("../bookings/bookings.module");
const wallets_module_1 = require("../wallets/wallets.module");
const users_module_1 = require("../users/users.module");
const revenue_module_1 = require("../revenue/revenue.module");
const prisma_module_1 = require("../prisma/prisma.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [products_module_1.ProductsModule, bookings_module_1.BookingsModule, wallets_module_1.WalletsModule, users_module_1.UsersModule, revenue_module_1.RevenueModule, prisma_module_1.PrismaModule],
        controllers: [admin_controller_1.AdminController, downline_controller_1.DownlineController],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map