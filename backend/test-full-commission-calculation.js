const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFullCommissionCalculation() {
  console.log('🧮 Testing Full Commission Calculation...');

  try {
    const bookingId = 16;
    
    // Get commission info (simulate API response)
    const commissionInfo = await getCommissionInfo(bookingId);
    
    console.log(`📋 Booking #${bookingId} Commission Breakdown:`);
    console.log(`  - Product: ${commissionInfo.productName}`);
    console.log(`  - Price: ${commissionInfo.price.toLocaleString()} VND`);
    console.log(`  - Commission Rate: ${(commissionInfo.commissionPct * 100).toFixed(2)}%`);
    console.log(`  - Provider Desired Rate: ${(commissionInfo.providerDesiredPct * 100).toFixed(2)}%`);
    
    // Calculate total commission
    const totalCommission = commissionInfo.price * commissionInfo.commissionPct;
    console.log(`\n💰 Total Commission: ${totalCommission.toLocaleString()} VND`);
    
    // Calculate each participant's share
    console.log(`\n👥 Commission Distribution:`);
    
    let distributedAmount = 0;
    
    // 1. Seller
    if (commissionInfo.seller?.rankShares?.length > 0) {
      const sellerShare = commissionInfo.seller.rankShares.find(s => s.role === 'SELLER');
      if (sellerShare) {
        const sellerAmount = totalCommission * sellerShare.pct;
        distributedAmount += sellerAmount;
        console.log(`  🏪 Seller (${commissionInfo.seller.fullName}):`);
        console.log(`    - Rank: ${commissionInfo.seller.currentRank?.name}`);
        console.log(`    - Share: ${(sellerShare.pct * 100).toFixed(2)}%`);
        console.log(`    - Amount: ${sellerAmount.toLocaleString()} VND`);
      }
    }
    
    // 2. Referrer
    if (commissionInfo.referrer?.rankShares?.length > 0) {
      const referrerShare = commissionInfo.referrer.rankShares.find(s => s.role === 'REFERRER');
      if (referrerShare) {
        const referrerAmount = totalCommission * referrerShare.pct;
        distributedAmount += referrerAmount;
        console.log(`  🤝 Referrer (${commissionInfo.referrer.fullName}):`);
        console.log(`    - Rank: ${commissionInfo.referrer.currentRank?.name}`);
        console.log(`    - Share: ${(referrerShare.pct * 100).toFixed(2)}%`);
        console.log(`    - Amount: ${referrerAmount.toLocaleString()} VND`);
      }
    }
    
    // 3. Manager
    if (commissionInfo.manager?.rankShares?.length > 0) {
      const managerShare = commissionInfo.manager.rankShares.find(s => s.role === 'MANAGER');
      if (managerShare) {
        const managerAmount = totalCommission * managerShare.pct;
        distributedAmount += managerAmount;
        console.log(`  👔 Manager (${commissionInfo.manager.fullName}):`);
        console.log(`    - Rank: ${commissionInfo.manager.currentRank?.name}`);
        console.log(`    - Share: ${(managerShare.pct * 100).toFixed(2)}%`);
        console.log(`    - Amount: ${managerAmount.toLocaleString()} VND`);
      }
    }
    
    // 4. Provider (fixed percentage)
    if (commissionInfo.provider) {
      const providerAmount = commissionInfo.price * commissionInfo.providerDesiredPct;
      console.log(`  🏢 Provider (${commissionInfo.provider.fullName}):`);
      console.log(`    - Fixed Rate: ${(commissionInfo.providerDesiredPct * 100).toFixed(2)}%`);
      console.log(`    - Amount: ${providerAmount.toLocaleString()} VND`);
    }
    
    // 5. System residual
    const systemResidual = totalCommission - distributedAmount;
    console.log(`  🏛️ System Residual:`);
    console.log(`    - Amount: ${systemResidual.toLocaleString()} VND`);
    console.log(`    - Percentage: ${((systemResidual / totalCommission) * 100).toFixed(2)}%`);
    
    console.log(`\n📊 Summary:`);
    console.log(`  - Total Commission: ${totalCommission.toLocaleString()} VND`);
    console.log(`  - Distributed to Users: ${distributedAmount.toLocaleString()} VND`);
    console.log(`  - Provider Amount: ${(commissionInfo.price * commissionInfo.providerDesiredPct).toLocaleString()} VND`);
    console.log(`  - System Keeps: ${systemResidual.toLocaleString()} VND`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function getCommissionInfo(bookingId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      product: {
        include: { owner: true },
      },
      seller: true,
      referrer: true,
      manager: true,
    },
  });

  if (!booking) {
    throw new Error(`Booking with ID ${bookingId} not found`);
  }

  // Get user rank information
  const seller = booking.seller ? await getUserWithRank(booking.seller.id, 'SELLER') : undefined;
  const referrer = booking.referrer ? await getUserWithRank(booking.referrer.id, 'REFERRER') : undefined;
  const manager = booking.manager ? await getUserWithRank(booking.manager.id, 'MANAGER') : undefined;
  const provider = booking.product?.owner ? {
    id: booking.product.owner.id,
    fullName: booking.product.owner.fullName || '',
    email: booking.product.owner.email,
    role: booking.product.owner.role,
  } : undefined;

  return {
    bookingId: booking.id,
    productId: booking.productId,
    productName: booking.product?.name,
    price: Number(booking.price),
    commissionPct: Number(booking.product?.commissionPct || 0),
    providerDesiredPct: Number(booking.product?.providerDesiredPct || 0),
    seller,
    referrer,
    manager,
    provider,
  };
}

async function getUserWithRank(userId, roleType) {
  const user = await prisma.appUser.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  const currentUserRank = await prisma.userRank.findFirst({
    where: {
      userId: userId,
      effectiveFrom: { lte: new Date() },
      OR: [
        { effectiveTo: null },
        { effectiveTo: { gte: new Date() } },
      ],
    },
    include: { rank: true },
    orderBy: { effectiveFrom: 'desc' },
  });

  let rankShares = [];
  if (currentUserRank) {
    rankShares = await prisma.rankShare.findMany({
      where: {
        rankId: currentUserRank.rankId,
        role: roleType,
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

testFullCommissionCalculation();
