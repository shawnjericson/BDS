const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCommissionService() {
  console.log('🔍 Testing Commission Service Logic...');

  try {
    const bookingId = 16;
    
    // Simulate the getCommissionInfo service method
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        product: {
          include: {
            owner: true, // This is the provider
          },
        },
        seller: true,
        referrer: true,
        manager: true,
      },
    });

    if (!booking) {
      throw new Error(`Booking with ID ${bookingId} not found`);
    }

    console.log(`✅ Found Booking #${bookingId}`);
    console.log(`📋 Basic Info:`);
    console.log(`  - Product: ${booking.product?.name}`);
    console.log(`  - Price: ${Number(booking.price).toLocaleString()} VND`);
    console.log(`  - Commission %: ${Number(booking.product?.commissionPct || 0) * 100}%`);
    console.log(`  - Provider Desired %: ${Number(booking.product?.providerDesiredPct || 0) * 100}%`);

    // Get user rank information for each participant
    console.log(`\n👥 Participants with Ranks:`);
    
    if (booking.seller) {
      const sellerWithRank = await getUserWithRank(booking.seller.id, 'SELLER');
      console.log(`  🏪 Seller: ${sellerWithRank.fullName} (ID: ${sellerWithRank.id})`);
      console.log(`    - Role: ${sellerWithRank.role}`);
      if (sellerWithRank.currentRank) {
        console.log(`    - Rank: ${sellerWithRank.currentRank.name}`);
        console.log(`    - Rank Shares:`);
        sellerWithRank.rankShares?.forEach(share => {
          console.log(`      * ${share.role}: ${(share.pct * 100).toFixed(2)}%`);
        });
      }
    }
    
    if (booking.referrer) {
      const referrerWithRank = await getUserWithRank(booking.referrer.id, 'REFERRER');
      console.log(`  🤝 Referrer: ${referrerWithRank.fullName} (ID: ${referrerWithRank.id})`);
      console.log(`    - Role: ${referrerWithRank.role}`);
      if (referrerWithRank.currentRank) {
        console.log(`    - Rank: ${referrerWithRank.currentRank.name}`);
        console.log(`    - Rank Shares:`);
        referrerWithRank.rankShares?.forEach(share => {
          console.log(`      * ${share.role}: ${(share.pct * 100).toFixed(2)}%`);
        });
      }
    }
    
    if (booking.manager) {
      const managerWithRank = await getUserWithRank(booking.manager.id, 'MANAGER');
      console.log(`  👔 Manager: ${managerWithRank.fullName} (ID: ${managerWithRank.id})`);
      console.log(`    - Role: ${managerWithRank.role}`);
      if (managerWithRank.currentRank) {
        console.log(`    - Rank: ${managerWithRank.currentRank.name}`);
        console.log(`    - Rank Shares:`);
        managerWithRank.rankShares?.forEach(share => {
          console.log(`      * ${share.role}: ${(share.pct * 100).toFixed(2)}%`);
        });
      }
    }
    
    if (booking.product?.owner) {
      const providerWithRank = await getUserWithRank(booking.product.owner.id, 'PROVIDER');
      console.log(`  🏢 Provider: ${providerWithRank.fullName} (ID: ${providerWithRank.id})`);
      console.log(`    - Role: ${providerWithRank.role}`);
      if (providerWithRank.currentRank) {
        console.log(`    - Rank: ${providerWithRank.currentRank.name}`);
        console.log(`    - Rank Shares:`);
        providerWithRank.rankShares?.forEach(share => {
          console.log(`      * ${share.role}: ${(share.pct * 100).toFixed(2)}%`);
        });
      }
    }

    console.log(`\n🧮 Commission Calculation:`);
    const totalCommission = Number(booking.price) * Number(booking.product?.commissionPct || 0);
    console.log(`  - Total Commission: ${totalCommission.toLocaleString()} VND`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function getUserWithRank(userId, roleType) {
  // Get user basic info
  const user = await prisma.appUser.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Get current rank for this user
  const currentUserRank = await prisma.userRank.findFirst({
    where: {
      userId: userId,
      effectiveFrom: { lte: new Date() },
      OR: [
        { effectiveTo: null },
        { effectiveTo: { gte: new Date() } },
      ],
    },
    include: {
      rank: true,
    },
    orderBy: { effectiveFrom: 'desc' },
  });

  // Get rank shares for this rank and role
  let rankShares = [];
  if (currentUserRank) {
    rankShares = await prisma.rankShare.findMany({
      where: {
        rankId: currentUserRank.rankId,
        role: roleType, // e.g., 'SELLER', 'REFERRER', 'MANAGER'
      },
    });
  }

  return {
    id: user.id,
    fullName: user.fullName || '',
    email: user.email,
    role: user.role,
    
    currentRank: currentUserRank ? {
      id: currentUserRank.rank.id,
      name: currentUserRank.rank.name,
      effectiveFrom: currentUserRank.effectiveFrom,
      effectiveTo: currentUserRank.effectiveTo || undefined,
    } : undefined,
    
    rankShares: rankShares.map(share => ({
      id: share.id,
      role: share.role,
      pct: Number(share.pct),
    })),
  };
}

testCommissionService();
