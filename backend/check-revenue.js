const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRevenue() {
  console.log('📊 Checking revenue ledger...');

  try {
    // Count total entries
    const totalEntries = await prisma.revenueLedger.count();
    console.log(`📊 Total revenue ledger entries: ${totalEntries}`);

    // Show revenue by user
    const revenueByUser = await prisma.revenueLedger.groupBy({
      by: ['beneficiaryUserId'],
      _sum: {
        amount: true
      },
      orderBy: {
        beneficiaryUserId: 'asc'
      }
    });

    console.log('\n💰 Revenue summary by user:');
    for (const userRevenue of revenueByUser) {
      const user = await prisma.appUser.findUnique({
        where: { id: userRevenue.beneficiaryUserId },
        select: { fullName: true, email: true }
      });
      console.log(`  User ${userRevenue.beneficiaryUserId} (${user?.fullName || 'Unknown'}): ${Number(userRevenue._sum.amount).toLocaleString('vi-VN')} VND`);
    }

    // Show revenue by role
    console.log('\n📊 Revenue summary by role:');
    const revenueByRole = await prisma.revenueLedger.groupBy({
      by: ['role'],
      _sum: {
        amount: true
      },
      orderBy: {
        role: 'asc'
      }
    });

    for (const roleRevenue of revenueByRole) {
      console.log(`  ${roleRevenue.role}: ${Number(roleRevenue._sum.amount).toLocaleString('vi-VN')} VND`);
    }

    // Show sample entries
    console.log('\n📋 Sample revenue entries:');
    const sampleEntries = await prisma.revenueLedger.findMany({
      take: 10,
      include: {
        beneficiaryUser: {
          select: { fullName: true }
        },
        booking: {
          select: { id: true, status: true, price: true }
        }
      },
      orderBy: { id: 'asc' }
    });

    for (const entry of sampleEntries) {
      console.log(`  Entry ${entry.id}: Booking ${entry.bookingId} (${entry.booking?.status}) - ${entry.role} - User ${entry.beneficiaryUserId} (${entry.beneficiaryUser?.fullName}) - ${Number(entry.amount).toLocaleString('vi-VN')} VND`);
    }

  } catch (error) {
    console.error('❌ Error checking revenue:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRevenue();
