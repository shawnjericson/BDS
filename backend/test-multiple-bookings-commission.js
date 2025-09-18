const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMultipleBookingsCommission() {
  console.log('🧮 Testing Commission Calculation for Multiple Bookings...');

  try {
    // Get a few different bookings to test
    const bookings = await prisma.booking.findMany({
      take: 3,
      include: {
        product: true,
        seller: true,
        referrer: true,
        manager: true,
      },
      orderBy: { id: 'desc' },
    });

    console.log(`Found ${bookings.length} bookings to test\n`);

    for (const booking of bookings) {
      console.log(`${'='.repeat(60)}`);
      console.log(`📋 BOOKING #${booking.id}: ${booking.product?.name}`);
      console.log(`${'='.repeat(60)}`);
      
      const result = await calculateCommission(booking.id);
      
      console.log(`💰 Basic Info:`);
      console.log(`  - Price: ${result.price.toLocaleString()} VND`);
      console.log(`  - Commission Rate: ${(result.commissionPct * 100).toFixed(2)}%`);
      console.log(`  - Provider Rate: ${(result.providerDesiredPct * 100).toFixed(2)}%`);
      
      console.log(`\n📊 Calculation Results:`);
      console.log(`  - Total Commission: ${result.totalCommission.toLocaleString()} VND`);
      console.log(`  - Provider Amount: ${result.providerAmount.toLocaleString()} VND`);
      
      console.log(`\n👥 Participants:`);
      result.participants.forEach(participant => {
        if (participant.role === 'provider') {
          console.log(`  🏢 ${participant.fullName}: ${participant.calculatedAmount.toLocaleString()} VND (${(participant.fixedRatePct * 100).toFixed(2)}% fixed)`);
        } else {
          console.log(`  ${getRoleIcon(participant.role)} ${participant.fullName}: ${participant.calculatedAmount.toLocaleString()} VND (${(participant.rankSharePct * 100).toFixed(2)}% from ${participant.userRank?.name})`);
        }
      });
      
      console.log(`  🏛️ System: ${result.systemResidual.toLocaleString()} VND (${(result.systemResidualPct * 100).toFixed(2)}%)`);
      
      console.log(`\n✅ Total Check: ${result.distributionComplete ? 'PASSED' : 'FAILED'}`);
      console.log(`   Commission Expected: ${result.totalCommission.toLocaleString()} VND`);
      console.log(`   Commission Actual: ${(result.totalDistributed + result.systemResidual).toLocaleString()} VND`);
      console.log(`   Provider (separate): ${result.providerAmount.toLocaleString()} VND\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getRoleIcon(role) {
  switch (role) {
    case 'seller': return '🏪';
    case 'referrer': return '🤝';
    case 'manager': return '👔';
    case 'provider': return '🏢';
    default: return '👤';
  }
}

async function calculateCommission(bookingId) {
  // Get commission info first
  const commissionInfo = await getCommissionInfo(bookingId);
  
  // Step 1: Calculate total commission
  const totalCommission = commissionInfo.price * commissionInfo.commissionPct;
  
  // Step 2: Provider gets fixed percentage of PRODUCT PRICE (not commission)
  const providerAmount = commissionInfo.price * commissionInfo.providerDesiredPct;

  // Step 3: Remaining commission for rank-based distribution (after provider takes their share)
  const remainingCommission = totalCommission - providerAmount;
  
  // Step 4: Calculate rank-based shares
  const participants = [];
  let totalRankBasedAmount = 0;
  
  // Add provider (fixed rate)
  if (commissionInfo.provider) {
    participants.push({
      userId: commissionInfo.provider.id,
      fullName: commissionInfo.provider.fullName,
      role: 'provider',
      calculatedAmount: providerAmount,
      isFixedRate: true,
      fixedRatePct: commissionInfo.providerDesiredPct,
    });
  }
  
  // Add seller (rank-based)
  if (commissionInfo.seller?.rankShares?.length > 0) {
    const sellerShare = commissionInfo.seller.rankShares.find(s => s.role === 'SELLER');
    if (sellerShare) {
      const amount = remainingCommission * sellerShare.pct;
      totalRankBasedAmount += amount;
      participants.push({
        userId: commissionInfo.seller.id,
        fullName: commissionInfo.seller.fullName,
        role: 'seller',
        userRank: commissionInfo.seller.currentRank,
        rankSharePct: sellerShare.pct,
        shareOfRemainingCommission: sellerShare.pct,
        calculatedAmount: amount,
      });
    }
  }
  
  // Add referrer (rank-based)
  if (commissionInfo.referrer?.rankShares?.length > 0) {
    const referrerShare = commissionInfo.referrer.rankShares.find(s => s.role === 'REFERRER');
    if (referrerShare) {
      const amount = remainingCommission * referrerShare.pct;
      totalRankBasedAmount += amount;
      participants.push({
        userId: commissionInfo.referrer.id,
        fullName: commissionInfo.referrer.fullName,
        role: 'referrer',
        userRank: commissionInfo.referrer.currentRank,
        rankSharePct: referrerShare.pct,
        shareOfRemainingCommission: referrerShare.pct,
        calculatedAmount: amount,
      });
    }
  }
  
  // Add manager (rank-based)
  if (commissionInfo.manager?.rankShares?.length > 0) {
    const managerShare = commissionInfo.manager.rankShares.find(s => s.role === 'MANAGER');
    if (managerShare) {
      const amount = remainingCommission * managerShare.pct;
      totalRankBasedAmount += amount;
      participants.push({
        userId: commissionInfo.manager.id,
        fullName: commissionInfo.manager.fullName,
        role: 'manager',
        userRank: commissionInfo.manager.currentRank,
        rankSharePct: managerShare.pct,
        shareOfRemainingCommission: managerShare.pct,
        calculatedAmount: amount,
      });
    }
  }
  
  // Step 5: System residual (what's left from commission after rank distribution)
  const systemResidual = remainingCommission - totalRankBasedAmount;
  const systemResidualPct = remainingCommission > 0 ? systemResidual / remainingCommission : 0;
  
  // Step 6: Calculate totals
  const totalDistributed = totalRankBasedAmount + providerAmount;
  
  return {
    bookingId: commissionInfo.bookingId,
    productId: commissionInfo.productId,
    productName: commissionInfo.productName || 'Unknown Product',
    price: commissionInfo.price,
    
    commissionPct: commissionInfo.commissionPct,
    providerDesiredPct: commissionInfo.providerDesiredPct,
    
    totalCommission,
    providerAmount,
    remainingCommission,
    
    participants,
    
    systemResidual,
    systemResidualPct,
    
    totalDistributed,
    distributionComplete: Math.abs(totalDistributed + systemResidual - totalCommission) < 0.01,
  };
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

testMultipleBookingsCommission();
