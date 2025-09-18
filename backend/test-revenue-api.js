const API_BASE_URL = 'http://192.168.1.59:3000';

async function testRevenueAPI() {
  console.log('💰 Testing Revenue API Endpoints...');

  try {
    // First get a user with bookings
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const user = await prisma.appUser.findFirst({
      where: {
        OR: [
          { sellerBookings: { some: { status: 'COMPLETED' } } },
          { referrerBookings: { some: { status: 'COMPLETED' } } },
          { managerBookings: { some: { status: 'COMPLETED' } } },
          { ownedProducts: { some: { bookings: { some: { status: 'COMPLETED' } } } } },
        ],
      },
    });

    if (!user) {
      console.log('❌ No user found with completed bookings');
      return;
    }

    console.log(`👤 Testing with user: ${user.fullName} (ID: ${user.id})`);

    // Test revenue summary endpoint (this would be called by mobile)
    console.log('\n🔍 Testing /users/revenue-summary endpoint...');
    
    // Since we don't have auth token, let's simulate the API call by testing the service directly
    const { UsersService } = require('./dist/users/users.service');
    const { PrismaService } = require('./dist/prisma/prisma.service');
    
    // Create service instances
    const prismaService = new PrismaService();
    const usersService = new UsersService(prismaService);
    
    // Test getUserRevenueSummary
    const revenueSummary = await usersService.getUserRevenueSummary(user.id);
    
    console.log('✅ Revenue Summary Response:');
    console.log(`  - User ID: ${revenueSummary.userId}`);
    console.log(`  - Full Name: ${revenueSummary.fullName}`);
    console.log(`  - Total Revenue: ${revenueSummary.totalRevenue.toLocaleString()} VND`);
    console.log(`  - Available Balance: ${revenueSummary.availableBalance.toLocaleString()} VND`);
    console.log(`  - Total Bookings: ${revenueSummary.totalBookings}`);
    console.log(`  - Last Booking Date: ${revenueSummary.lastBookingDate || 'N/A'}`);
    
    // Test getUserRevenue (full details)
    console.log('\n🔍 Testing getUserRevenue (full details)...');
    const fullRevenue = await usersService.getUserRevenue(user.id);
    
    console.log('✅ Full Revenue Response:');
    console.log(`  - Total Revenue: ${fullRevenue.totalRevenue.toLocaleString()} VND`);
    console.log(`  - Total Withdrawn: ${fullRevenue.totalWithdrawn.toLocaleString()} VND`);
    console.log(`  - Available Balance: ${fullRevenue.availableBalance.toLocaleString()} VND`);
    console.log(`  - Total Bookings: ${fullRevenue.totalBookings}`);
    
    console.log('\n📊 Revenue Breakdown by Role:');
    fullRevenue.revenueBreakdown.forEach(source => {
      console.log(`  ${getRoleIcon(source.role)} ${source.role.toUpperCase()}:`);
      console.log(`    - Total: ${source.totalAmount.toLocaleString()} VND`);
      console.log(`    - Bookings: ${source.bookingCount}`);
      console.log(`    - Average: ${source.averagePerBooking.toLocaleString()} VND/booking`);
    });
    
    console.log('\n📋 Recent Bookings (Top 3):');
    fullRevenue.recentBookings.slice(0, 3).forEach(booking => {
      console.log(`  ${getRoleIcon(booking.role)} ${booking.productName}`);
      console.log(`    - Role: ${booking.role}, Amount: ${booking.amount.toLocaleString()} VND`);
      console.log(`    - Date: ${new Date(booking.bookingDate).toLocaleDateString()}`);
    });
    
    // Verify math
    const calculatedBalance = fullRevenue.totalRevenue - fullRevenue.totalWithdrawn;
    console.log('\n🔍 Math Verification:');
    console.log(`  - Calculated Balance: ${calculatedBalance.toLocaleString()} VND`);
    console.log(`  - Reported Balance: ${fullRevenue.availableBalance.toLocaleString()} VND`);
    console.log(`  - Match: ${calculatedBalance === fullRevenue.availableBalance ? '✅' : '❌'}`);
    
    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
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

testRevenueAPI();
