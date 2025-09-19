const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDownlineService() {
  console.log('🧪 Testing Downline Service manually...');
  
  try {
    const adminUserId = 5; // Admin (App) ID from previous test
    
    // Manual implementation of getMyDownline
    const downlineUsers = await prisma.appUser.findMany({
      where: {
        referredBy: adminUserId,
      },
      include: {
        userRanks: {
          where: { effectiveTo: null },
          include: {
            rank: true,
          },
        },
        referrals: {
          select: {
            id: true,
            status: true,
          },
        },
        sellerBookings: {
          select: {
            id: true,
            price: true,
            createdAt: true,
          },
        },
        revenueLedger: {
          select: {
            amount: true,
            createdAt: true,
          },
        },
      },
    });

    console.log(`📊 Found ${downlineUsers.length} downline users`);

    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const results = downlineUsers.map(user => {
      const totalRevenue = user.revenueLedger.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
      const monthlyRevenue = user.revenueLedger
        .filter(entry => entry.createdAt && new Date(entry.createdAt) >= currentMonth)
        .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

      const totalBookings = user.sellerBookings.length;
      const monthlyBookings = user.sellerBookings
        .filter(booking => new Date(booking.createdAt) >= currentMonth)
        .length;

      const totalReferrals = user.referrals.length;
      const activeReferrals = user.referrals.filter(ref => ref.status === 'ACTIVE').length;

      return {
        id: user.id,
        fullName: user.fullName,
        nickname: user.fullName.split(' ')[0], // First name as nickname
        email: user.email || undefined,
        referralCode: user.referralCode || undefined,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        totalRevenue,
        totalBookings,
        monthlyRevenue,
        monthlyBookings,
        currentRank: user.userRanks[0]?.rank ? {
          id: user.userRanks[0].rank.id,
          name: user.userRanks[0].rank.name,
        } : undefined,
        totalReferrals,
        activeReferrals,
      };
    });

    console.log('\n📋 Downline Results:');
    results.forEach(user => {
      console.log(`\n👤 ${user.fullName} (@${user.nickname})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}, Status: ${user.status}`);
      console.log(`   Rank: ${user.currentRank?.name || 'No rank'}`);
      console.log(`   Total Revenue: ${user.totalRevenue.toLocaleString()} VND`);
      console.log(`   Monthly Revenue: ${user.monthlyRevenue.toLocaleString()} VND`);
      console.log(`   Total Bookings: ${user.totalBookings}`);
      console.log(`   Monthly Bookings: ${user.monthlyBookings}`);
      console.log(`   Referrals: ${user.totalReferrals} (${user.activeReferrals} active)`);
    });

    // Calculate stats
    const totalMembers = results.length;
    const activeMembers = results.filter(user => user.status === 'ACTIVE').length;
    const totalRevenue = results.reduce((sum, user) => sum + user.totalRevenue, 0);
    const monthlyRevenue = results.reduce((sum, user) => sum + user.monthlyRevenue, 0);
    const totalBookings = results.reduce((sum, user) => sum + user.totalBookings, 0);
    const monthlyBookings = results.reduce((sum, user) => sum + user.monthlyBookings, 0);
    
    const topPerformers = results
      .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
      .slice(0, 5);

    const stats = {
      totalMembers,
      activeMembers,
      totalRevenue,
      monthlyRevenue,
      totalBookings,
      monthlyBookings,
      topPerformers: topPerformers.map(p => p.fullName),
    };

    console.log('\n📊 Stats:');
    console.log(`   Total Members: ${stats.totalMembers}`);
    console.log(`   Active Members: ${stats.activeMembers}`);
    console.log(`   Total Revenue: ${stats.totalRevenue.toLocaleString()} VND`);
    console.log(`   Monthly Revenue: ${stats.monthlyRevenue.toLocaleString()} VND`);
    console.log(`   Total Bookings: ${stats.totalBookings}`);
    console.log(`   Monthly Bookings: ${stats.monthlyBookings}`);
    console.log(`   Top Performers: ${stats.topPerformers.join(', ')}`);

    console.log('\n✅ Service logic works! Data is available.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
  
  await prisma.$disconnect();
}

testDownlineService().catch(console.error);
