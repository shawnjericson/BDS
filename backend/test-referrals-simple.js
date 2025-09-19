const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testReferrals() {
  console.log('🔍 Testing referrals data...');
  
  try {
    // 1. Find admin user
    const adminUser = await prisma.appUser.findFirst({
      where: {
        OR: [
          { role: 'ADMIN' },
          { email: { contains: 'admin' } }
        ]
      }
    });
    
    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }
    
    console.log(`📋 Admin user: ${adminUser.fullName} (ID: ${adminUser.id})`);
    
    // 2. Find users referred by admin
    const referrals = await prisma.appUser.findMany({
      where: {
        referredBy: adminUser.id
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        role: true,
        createdAt: true,
        referralCode: true,
      }
    });
    
    console.log(`👥 Found ${referrals.length} referrals:`);
    
    if (referrals.length > 0) {
      referrals.forEach((user, index) => {
        console.log(`${index + 1}. ${user.fullName} (${user.email})`);
        console.log(`   - ID: ${user.id}, Status: ${user.status}, Role: ${user.role}`);
        console.log(`   - Referral Code: ${user.referralCode}`);
        console.log(`   - Created: ${user.createdAt.toLocaleDateString('vi-VN')}`);
        console.log('');
      });
      
      // 3. Check revenue data for first referral
      const firstReferral = referrals[0];
      console.log(`💰 Checking revenue for ${firstReferral.fullName}...`);
      
      const revenueEntries = await prisma.revenueLedger.findMany({
        where: {
          beneficiaryUserId: firstReferral.id
        },
        select: {
          amount: true,
          role: true,
          createdAt: true,
        }
      });
      
      console.log(`📊 Found ${revenueEntries.length} revenue entries`);
      const totalRevenue = revenueEntries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
      console.log(`💵 Total revenue: ${totalRevenue.toLocaleString()} VND`);
      
      // 4. Check bookings for first referral
      const bookings = await prisma.booking.findMany({
        where: {
          sellerUserId: firstReferral.id
        },
        select: {
          id: true,
          price: true,
          status: true,
          createdAt: true,
        }
      });
      
      console.log(`📋 Found ${bookings.length} bookings`);
      
    } else {
      console.log('❌ Admin has no referrals. Checking all users...');
      
      // Check all users to see referral structure
      const allUsers = await prisma.appUser.findMany({
        select: {
          id: true,
          fullName: true,
          referredBy: true,
          role: true,
        },
        take: 10
      });
      
      console.log('\n👥 Sample users:');
      allUsers.forEach(user => {
        console.log(`- ${user.fullName} (ID: ${user.id}) - Referred by: ${user.referredBy || 'None'} - Role: ${user.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await prisma.$disconnect();
}

testReferrals().catch(console.error);
