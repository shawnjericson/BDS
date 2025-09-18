"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    const ranks = await Promise.all([
        prisma.rank.upsert({
            where: { id: 1 },
            update: {},
            create: { id: 1, name: 'Hạng 1' },
        }),
        prisma.rank.upsert({
            where: { id: 2 },
            update: {},
            create: { id: 2, name: 'Hạng 2' },
        }),
        prisma.rank.upsert({
            where: { id: 3 },
            update: {},
            create: { id: 3, name: 'Hạng 3' },
        }),
        prisma.rank.upsert({
            where: { id: 4 },
            update: {},
            create: { id: 4, name: 'Hạng 4' },
        }),
        prisma.rank.upsert({
            where: { id: 5 },
            update: {},
            create: { id: 5, name: 'Hạng 5' },
        }),
    ]);
    console.log('✅ Created ranks:', ranks.length);
    const rankShares = [
        { id: 16, role: 'SELLER', rankId: 1, pct: 0.8500 },
        { id: 17, role: 'SELLER', rankId: 2, pct: 0.8000 },
        { id: 18, role: 'SELLER', rankId: 3, pct: 0.7500 },
        { id: 19, role: 'SELLER', rankId: 4, pct: 0.7000 },
        { id: 20, role: 'SELLER', rankId: 5, pct: 0.6500 },
        { id: 21, role: 'REFERRER', rankId: 1, pct: 0.1000 },
        { id: 22, role: 'REFERRER', rankId: 2, pct: 0.0900 },
        { id: 23, role: 'REFERRER', rankId: 3, pct: 0.0800 },
        { id: 24, role: 'REFERRER', rankId: 4, pct: 0.0700 },
        { id: 25, role: 'REFERRER', rankId: 5, pct: 0.0600 },
        { id: 11, role: 'MANAGER', rankId: 1, pct: 0.0500 },
        { id: 12, role: 'MANAGER', rankId: 2, pct: 0.0400 },
        { id: 13, role: 'MANAGER', rankId: 3, pct: 0.0030 },
        { id: 14, role: 'MANAGER', rankId: 4, pct: 0.0200 },
        { id: 15, role: 'MANAGER', rankId: 5, pct: 0.0100 },
    ];
    for (const share of rankShares) {
        await prisma.rankShare.upsert({
            where: { id: share.id },
            update: {},
            create: share,
        });
    }
    console.log('✅ Created rank shares:', rankShares.length);
    const users = [
        { id: 1, fullName: 'Provider A', email: 'provider@example.com', referralCode: 'PROV001', managerId: 4 },
        { id: 2, fullName: 'Seller B', email: 'seller@example.com', referralCode: 'SELL001', managerId: 4 },
        { id: 3, fullName: 'Referrer C', email: 'referrer@example.com', referralCode: 'REF001', managerId: 4 },
        { id: 4, fullName: 'Manager D', email: 'manager@example.com', referralCode: 'MGR001', managerId: 5 },
        { id: 5, fullName: 'Admin (App)', email: 'admin@example.com', referralCode: 'ADMIN01', managerId: null },
    ];
    for (const user of users) {
        await prisma.appUser.upsert({
            where: { id: user.id },
            update: {},
            create: {
                fullName: user.fullName,
                email: user.email,
                referralCode: user.referralCode,
                managerId: user.managerId,
                password: hashedPassword,
                status: 'ACTIVE',
            },
        });
        await prisma.wallet.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                balance: 0,
            },
        });
    }
    console.log('✅ Created users and wallets:', users.length);
    const userRanks = [
        { userId: 1, rankId: 3, effectiveFrom: new Date('2025-09-05 05:36:28.007397') },
        { userId: 2, rankId: 2, effectiveFrom: new Date('2025-09-05 05:36:28.014442') },
        { userId: 3, rankId: 3, effectiveFrom: new Date('2025-09-05 05:36:28.019348') },
        { userId: 4, rankId: 1, effectiveFrom: new Date('2025-09-05 05:36:28.025358') },
    ];
    for (const userRank of userRanks) {
        await prisma.userRank.upsert({
            where: {
                userId_rankId_effectiveFrom: {
                    userId: userRank.userId,
                    rankId: userRank.rankId,
                    effectiveFrom: userRank.effectiveFrom,
                },
            },
            update: {},
            create: userRank,
        });
    }
    console.log('✅ Created user ranks:', userRanks.length);
    const products = [
        {
            id: 1,
            ownerUserId: 1,
            name: 'Căn hộ cao cấp Vinhomes Central Park',
            description: 'Căn hộ 2 phòng ngủ, view sông Sài Gòn, nội thất đầy đủ, tiện ích 5 sao',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop'
            ]),
            commissionPct: 0.0500,
            providerDesiredPct: 0.0100,
            status: 'APPROVED'
        },
        {
            id: 2,
            ownerUserId: 1,
            name: 'Nhà phố thương mại Shophouse',
            description: 'Nhà phố 4 tầng, mặt tiền 5m, vị trí đắc địa, phù hợp kinh doanh',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop'
            ]),
            commissionPct: 0.0300,
            providerDesiredPct: 0.0080,
            status: 'APPROVED'
        },
        {
            id: 3,
            ownerUserId: 2,
            name: 'Biệt thự đơn lập Ecopark',
            description: 'Biệt thự 3 tầng, sân vườn rộng, khu compound an ninh 24/7',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'
            ]),
            commissionPct: 0.0400,
            providerDesiredPct: 0.0120,
            status: 'APPROVED'
        },
        {
            id: 4,
            ownerUserId: 2,
            name: 'Chung cư mini Hà Đông',
            description: 'Căn hộ studio, full nội thất, gần trường học và bệnh viện',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'
            ]),
            commissionPct: 0.0250,
            providerDesiredPct: 0.0060,
            status: 'APPROVED'
        },
    ];
    for (const product of products) {
        await prisma.product.upsert({
            where: { id: product.id },
            update: {},
            create: product,
        });
    }
    console.log('✅ Created products:', products.length);
    const bookings = [
        {
            id: 1,
            productId: 1,
            sellerUserId: 2,
            referrerUserId: 3,
            managerUserId: 4,
            price: 5500000000,
            status: 'COMPLETED'
        },
        {
            id: 2,
            productId: 2,
            sellerUserId: 2,
            referrerUserId: 3,
            managerUserId: 4,
            price: 8200000000,
            status: 'COMPLETED'
        },
        {
            id: 3,
            productId: 3,
            sellerUserId: 3,
            referrerUserId: 2,
            managerUserId: 4,
            price: 12500000000,
            status: 'PENDING'
        },
        {
            id: 4,
            productId: 4,
            sellerUserId: 3,
            price: 1800000000,
            status: 'PENDING'
        },
        {
            id: 5,
            productId: 1,
            sellerUserId: 4,
            referrerUserId: 2,
            price: 5800000000,
            status: 'COMPLETED'
        },
    ];
    for (const booking of bookings) {
        await prisma.booking.upsert({
            where: { id: booking.id },
            update: {},
            create: booking,
        });
    }
    console.log('✅ Created bookings:', bookings.length);
    console.log('🎉 Database seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map