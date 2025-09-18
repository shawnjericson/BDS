const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBookingStatuses() {
  console.log('🔍 Testing Booking Statuses...');

  try {
    // Get all bookings for user ID 2 (seller)
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { sellerUserId: 2 },
          { referrerUserId: 2 },
          { managerUserId: 2 }
        ]
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        seller: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        referrer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        manager: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`✅ Found ${bookings.length} bookings for user 2`);

    console.log(`\n📋 Booking statuses:`);
    bookings.forEach((booking, index) => {
      console.log(`  ${index + 1}. Booking #${booking.id}: "${booking.status}" (type: ${typeof booking.status})`);
    });

    // Group by status
    const statusGroups = {};
    bookings.forEach(booking => {
      const status = booking.status;
      if (!statusGroups[status]) {
        statusGroups[status] = 0;
      }
      statusGroups[status]++;
    });

    console.log(`\n📊 Status distribution:`);
    Object.entries(statusGroups).forEach(([status, count]) => {
      console.log(`  - "${status}": ${count} bookings`);
    });

    // Test filter logic
    console.log(`\n🔍 Filter test:`);
    const filters = ['pending', 'confirmed', 'cancelled', 'completed', 'closed'];
    
    filters.forEach(filter => {
      // NEW: Both screens use lowercase logic
      const homeFiltered = bookings.filter(booking => {
        const backendStatus = booking.status.toLowerCase();
        return backendStatus === filter;
      });

      const bookingFiltered = bookings.filter(booking => {
        const backendStatus = booking.status.toLowerCase();
        return backendStatus === filter;
      });

      console.log(`  Filter "${filter}":`);
      console.log(`    - HomeScreen (lowercase): ${homeFiltered.length} results`);
      console.log(`    - BookingsScreen (lowercase): ${bookingFiltered.length} results`);
      console.log(`    - MATCH: ${homeFiltered.length === bookingFiltered.length ? '✅' : '❌'}`);

      if (homeFiltered.length > 0) {
        console.log(`      Results: ${homeFiltered.map(b => `#${b.id}(${b.status})`).join(', ')}`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBookingStatuses();
