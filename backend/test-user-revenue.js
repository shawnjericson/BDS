const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUserRevenue() {
  console.log('💰 Testing User Revenue Calculation...');

  try {
    // Get a user who has bookings
    const users = await prisma.appUser.findMany({
      where: {
        OR: [
          { sellerBookings: { some: { status: 'COMPLETED' } } },
          { referrerBookings: { some: { status: 'COMPLETED' } } },
          { managerBookings: { some: { status: 'COMPLETED' } } },
          { ownedProducts: { some: { bookings: { some: { status: 'COMPLETED' } } } } },
        ],
      },
      take: 3,
    });

    console.log(`Found ${users.length} users with completed bookings\n`);

    for (const user of users) {
      console.log(`${'='.repeat(60)}`);
      console.log(`👤 USER: ${user.fullName} (ID: ${user.id})`);
      console.log(`${'='.repeat(60)}`);
      
      const revenue = await calculateUserRevenue(user.id);
      
      console.log(`💰 Revenue Summary:`);
      console.log(`  - Total Revenue: ${revenue.totalRevenue.toLocaleString()} VND`);
      console.log(`  - Total Withdrawn: ${revenue.totalWithdrawn.toLocaleString()} VND`);
      console.log(`  - Available Balance: ${revenue.availableBalance.toLocaleString()} VND`);
      console.log(`  - Total Bookings: ${revenue.totalBookings}`);
      
      console.log(`\n📊 Revenue by Role:`);
      revenue.revenueBreakdown.forEach(source => {
        console.log(`  ${getRoleIcon(source.role)} ${source.role.toUpperCase()}:`);
        console.log(`    - Total: ${source.totalAmount.toLocaleString()} VND`);
        console.log(`    - Bookings: ${source.bookingCount}`);
        console.log(`    - Average: ${source.averagePerBooking.toLocaleString()} VND/booking`);
      });
      
      console.log(`\n📋 Recent Bookings (Top 5):`);
      revenue.recentBookings.slice(0, 5).forEach(booking => {
        console.log(`  ${getRoleIcon(booking.role)} ${booking.productName}`);
        console.log(`    - Role: ${booking.role}, Amount: ${booking.amount.toLocaleString()} VND`);
        console.log(`    - Date: ${booking.bookingDate.toLocaleDateString()}, Status: ${booking.status}`);
      });
      
      console.log(`\n`);
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

async function calculateUserRevenue(userId) {
  // Get all bookings where user participated in any role
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { sellerUserId: userId },
        { referrerUserId: userId },
        { managerUserId: userId },
        { product: { ownerUserId: userId } }, // Provider role
      ],
      status: 'COMPLETED', // Only completed bookings count for revenue
    },
    include: {
      product: {
        include: { owner: true },
      },
      seller: true,
      referrer: true,
      manager: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate revenue for each booking
  let totalRevenue = 0;
  const revenueByRole = {
    seller: { amount: 0, count: 0 },
    referrer: { amount: 0, count: 0 },
    manager: { amount: 0, count: 0 },
    provider: { amount: 0, count: 0 },
  };

  const recentBookings = [];

  for (const booking of bookings) {
    // Calculate commission for this booking
    const commission = await calculateBookingCommission(booking);
    
    // Check each role and add to revenue
    commission.participants.forEach(participant => {
      if (participant.userId === userId) {
        totalRevenue += participant.calculatedAmount;
        revenueByRole[participant.role].amount += participant.calculatedAmount;
        revenueByRole[participant.role].count += 1;

        // Add to recent bookings (limit to 10)
        if (recentBookings.length < 10) {
          recentBookings.push({
            bookingId: booking.id,
            productName: booking.product?.name || 'Unknown Product',
            role: participant.role,
            amount: participant.calculatedAmount,
            bookingDate: booking.createdAt,
            status: booking.status,
          });
        }
      }
    });
  }

  // Get withdrawal amount (from wallet transactions)
  const withdrawals = await prisma.walletTransaction.findMany({
    where: {
      wallet: { userId: userId },
      type: 'WITHDRAWAL',
    },
    include: { wallet: true },
  });

  const totalWithdrawn = withdrawals.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const availableBalance = totalRevenue - totalWithdrawn;

  // Build revenue sources
  const revenueBreakdown = Object.entries(revenueByRole)
    .filter(([_, data]) => data.count > 0)
    .map(([role, data]) => ({
      role: role,
      totalAmount: data.amount,
      bookingCount: data.count,
      averagePerBooking: data.amount / data.count,
    }));

  // Build booking role stats
  const bookingsByRole = Object.entries(revenueByRole)
    .filter(([_, data]) => data.count > 0)
    .map(([role, data]) => ({
      role: role,
      count: data.count,
      totalRevenue: data.amount,
    }));

  return {
    userId: userId,
    totalRevenue,
    revenueBreakdown,
    totalWithdrawn,
    availableBalance,
    totalBookings: bookings.length,
    bookingsByRole,
    recentBookings,
  };
}

async function calculateBookingCommission(booking) {
  // Calculate commission similar to BookingsService.calculateCommission
  const totalCommission = Number(booking.price) * Number(booking.product?.commissionPct || 0);
  const providerAmount = Number(booking.price) * Number(booking.product?.providerDesiredPct || 0);
  const remainingCommission = totalCommission - providerAmount;

  const participants = [];

  // Add provider (fixed rate)
  if (booking.product?.owner) {
    participants.push({
      userId: booking.product.owner.id,
      fullName: booking.product.owner.fullName,
      role: 'provider',
      calculatedAmount: providerAmount,
    });
  }

  // Add seller (rank-based)
  if (booking.seller) {
    const sellerRank = await getUserCurrentRank(booking.seller.id);
    const sellerShare = await getRankShare(sellerRank?.rankId, 'SELLER');
    if (sellerShare) {
      const amount = remainingCommission * Number(sellerShare.pct);
      participants.push({
        userId: booking.seller.id,
        fullName: booking.seller.fullName,
        role: 'seller',
        calculatedAmount: amount,
      });
    }
  }

  // Add referrer (rank-based)
  if (booking.referrer) {
    const referrerRank = await getUserCurrentRank(booking.referrer.id);
    const referrerShare = await getRankShare(referrerRank?.rankId, 'REFERRER');
    if (referrerShare) {
      const amount = remainingCommission * Number(referrerShare.pct);
      participants.push({
        userId: booking.referrer.id,
        fullName: booking.referrer.fullName,
        role: 'referrer',
        calculatedAmount: amount,
      });
    }
  }

  // Add manager (rank-based)
  if (booking.manager) {
    const managerRank = await getUserCurrentRank(booking.manager.id);
    const managerShare = await getRankShare(managerRank?.rankId, 'MANAGER');
    if (managerShare) {
      const amount = remainingCommission * Number(managerShare.pct);
      participants.push({
        userId: booking.manager.id,
        fullName: booking.manager.fullName,
        role: 'manager',
        calculatedAmount: amount,
      });
    }
  }

  return { participants };
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
    include: { rank: true },
    orderBy: { effectiveFrom: 'desc' },
  });
}

async function getRankShare(rankId, role) {
  if (!rankId) return null;
  
  return await prisma.rankShare.findFirst({
    where: {
      rankId: rankId,
      role: role,
    },
  });
}

testUserRevenue();
