"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueModule = void 0;
const common_1 = require("@nestjs/common");
const revenue_ledger_service_1 = require("./revenue-ledger.service");
const revenue_controller_1 = require("./revenue.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const commission_module_1 = require("../commission/commission.module");
let RevenueModule = class RevenueModule {
};
exports.RevenueModule = RevenueModule;
exports.RevenueModule = RevenueModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, commission_module_1.CommissionModule],
        controllers: [revenue_controller_1.RevenueController],
        providers: [revenue_ledger_service_1.RevenueLedgerService],
        exports: [revenue_ledger_service_1.RevenueLedgerService],
    })
], RevenueModule);
//# sourceMappingURL=revenue.module.js.map