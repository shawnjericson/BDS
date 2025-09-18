const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRevenueSimple() {
  console.log('💰 Testing Revenue Calculation (Simple)...');

  try {
    // Get user with ID 2 (Seller B) who has completed bookings
    const userId = 2;
    
    console.log(`👤 Testing revenue for User ID: ${userId}`);
    
    // Get user info
    const user = await prisma.appUser.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`👤 User: ${user.fullName}`);
    
    // Get all completed bookings where user participated
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { sellerUserId: userId },
          { referrerUserId: userId },
          { managerUserId: userId },
          { product: { ownerUserId: userId } },
        ],
        status: 'COMPLETED',
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
    
    console.log(`📋 Found ${bookings.length} completed bookings`);
    
    let totalRevenue = 0;
    const revenueByRole = {
      seller: { amount: 0, count: 0 },
      referrer: { amount: 0, count: 0 },
      manager: { amount: 0, count: 0 },
      provider: { amount: 0, count: 0 },
    };
    
    console.log('\n📊 Processing each booking:');
    
    for (const booking of bookings) {
      console.log(`\n📋 Booking #${booking.id}: ${booking.product?.name}`);
      console.log(`  - Price: ${Number(booking.price).toLocaleString()} VND`);
      console.log(`  - Commission %: ${Number(booking.product?.commissionPct || 0) * 100}%`);
      console.log(`  - Provider %: ${Number(booking.product?.providerDesiredPct || 0) * 100}%`);
      
      // Calculate commission
      const totalCommission = Number(booking.price) * Number(booking.product?.commissionPct || 0);
      const providerAmount = Number(booking.price) * Number(booking.product?.providerDesiredPct || 0);
      const remainingCommission = totalCommission - providerAmount;
      
      console.log(`  - Total Commission: ${totalCommission.toLocaleString()} VND`);
      console.log(`  - Provider Amount: ${providerAmount.toLocaleString()} VND`);
      console.log(`  - Remaining Commission: ${remainingCommission.toLocaleString()} VND`);
      
      // Check if user is provider
      if (booking.product?.ownerUserId === userId) {
        console.log(`  - User is PROVIDER: +${providerAmount.toLocaleString()} VND`);
        totalRevenue += providerAmount;
        revenueByRole.provider.amount += providerAmount;
        revenueByRole.provider.count += 1;
      }
      
      // Check if user is seller
      if (booking.sellerUserId === userId) {
        const sellerRank = await getUserCurrentRank(userId);
        const sellerShare = await getRankShare(sellerRank?.rankId, 'SELLER');
        if (sellerShare) {
          const amount = remainingCommission * Number(sellerShare.pct);
          console.log(`  - User is SELLER (${sellerRank?.rank?.name}, ${Number(sellerShare.pct) * 100}%): +${amount.toLocaleString()} VND`);
          totalRevenue += amount;
          revenueByRole.seller.amount += amount;
          revenueByRole.seller.count += 1;
        }
      }
      
      // Check if user is referrer
      if (booking.referrerUserId === userId) {
        const referrerRank = await getUserCurrentRank(userId);
        const referrerShare = await getRankShare(referrerRank?.rankId, 'REFERRER');
        if (referrerShare) {
          const amount = remainingCommission * Number(referrerShare.pct);
          console.log(`  - User is REFERRER (${referrerRank?.rank?.name}, ${Number(referrerShare.pct) * 100}%): +${amount.toLocaleString()} VND`);
          totalRevenue += amount;
          revenueByRole.referrer.amount += amount;
          revenueByRole.referrer.count += 1;
        }
      }
      
      // Check if user is manager
      if (booking.managerUserId === userId) {
        const managerRank = await getUserCurrentRank(userId);
        const managerShare = await getRankShare(managerRank?.rankId, 'MANAGER');
        if (managerShare) {
          const amount = remainingCommission * Number(managerShare.pct);
          console.log(`  - User is MANAGER (${managerRank?.rank?.name}, ${Number(managerShare.pct) * 100}%): +${amount.toLocaleString()} VND`);
          totalRevenue += amount;
          revenueByRole.manager.amount += amount;
          revenueByRole.manager.count += 1;
        }
      }
    }
    
    // Get withdrawals
    const withdrawals = await prisma.walletTransaction.findMany({
      where: {
        wallet: { userId: userId },
        type: 'WITHDRAWAL',
      },
      include: { wallet: true },
    });
    
    const totalWithdrawn = withdrawals.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const availableBalance = totalRevenue - totalWithdrawn;
    
    console.log('\n💰 FINAL REVENUE SUMMARY:');
    console.log(`  - Total Revenue: ${totalRevenue.toLocaleString()} VND`);
    console.log(`  - Total Withdrawn: ${totalWithdrawn.toLocaleString()} VND`);
    console.log(`  - Available Balance: ${availableBalance.toLocaleString()} VND`);
    console.log(`  - Total Bookings: ${bookings.length}`);
    
    console.log('\n📊 Revenue by Role:');
    Object.entries(revenueByRole).forEach(([role, data]) => {
      if (data.count > 0) {
        console.log(`  ${getRoleIcon(role)} ${role.toUpperCase()}:`);
        console.log(`    - Total: ${data.amount.toLocaleString()} VND`);
        console.log(`    - Bookings: ${data.count}`);
        console.log(`    - Average: ${(data.amount / data.count).toLocaleString()} VND/booking`);
      }
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

function getRoleIcon(role) {
  switch (role) {
    case 'seller': return '🏪';
    case 'referrer': return '🤝';
    case 'manager': return '👔';
    case 'provider': return '🏢';
    default: return '👤';
  }
}

testRevenueSimple();
