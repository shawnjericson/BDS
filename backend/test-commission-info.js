const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCommissionInfo() {
  console.log('🔍 Testing Commission Info API...');

  try {
    // First, let's see what bookings we have
    const bookings = await prisma.booking.findMany({
      take: 5,
      include: {
        product: {
          include: { owner: true },
        },
        seller: true,
        referrer: true,
        manager: true,
      },
      orderBy: { id: 'desc' },
    });

    console.log(`📦 Found ${bookings.length} bookings to test`);

    for (const booking of bookings) {
      console.log(`\n📋 Booking #${booking.id}:`);
      console.log(`  - Product: ${booking.product?.name || 'N/A'}`);
      console.log(`  - Price: ${Number(booking.price).toLocaleString()} VND`);
      console.log(`  - Commission %: ${Number(booking.product?.commissionPct || 0) * 100}%`);
      console.log(`  - Provider Desired %: ${Number(booking.product?.providerDesiredPct || 0) * 100}%`);
      
      console.log(`  - Seller: ${booking.seller?.fullName || 'N/A'} (ID: ${booking.sellerUserId || 'N/A'})`);
      console.log(`  - Referrer: ${booking.referrer?.fullName || 'N/A'} (ID: ${booking.referrerUserId || 'N/A'})`);
      console.log(`  - Manager: ${booking.manager?.fullName || 'N/A'} (ID: ${booking.managerUserId || 'N/A'})`);
      console.log(`  - Provider: ${booking.product?.owner?.fullName || 'N/A'} (ID: ${booking.product?.ownerUserId || 'N/A'})`);

      // Test getting ranks for each user
      if (booking.sellerUserId) {
        const sellerRank = await getUserCurrentRank(booking.sellerUserId);
        console.log(`  - Seller Rank: ${sellerRank?.rank?.name || 'No rank'}`);
      }

      if (booking.referrerUserId) {
        const referrerRank = await getUserCurrentRank(booking.referrerUserId);
        console.log(`  - Referrer Rank: ${referrerRank?.rank?.name || 'No rank'}`);
      }

      if (booking.managerUserId) {
        const managerRank = await getUserCurrentRank(booking.managerUserId);
        console.log(`  - Manager Rank: ${managerRank?.rank?.name || 'No rank'}`);
      }

      if (booking.product?.ownerUserId) {
        const providerRank = await getUserCurrentRank(booking.product.ownerUserId);
        console.log(`  - Provider Rank: ${providerRank?.rank?.name || 'No rank'}`);
      }
    }

    // Test rank shares
    console.log(`\n📊 Testing Rank Shares:`);
    const rankShares = await prisma.rankShare.findMany({
      include: {
        rank: true,
      },
      orderBy: [{ rankId: 'asc' }, { role: 'asc' }],
    });

    console.log(`Found ${rankShares.length} rank shares:`);
    rankShares.forEach(share => {
      console.log(`  - Rank: ${share.rank?.name || 'N/A'}, Role: ${share.role}, Pct: ${Number(share.pct) * 100}%`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function getUserCurrentRank(userId) {
  return await prisma.userRank.findFirst({
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
}

testCommissionInfo();
