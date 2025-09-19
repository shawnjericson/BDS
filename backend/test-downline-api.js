const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDownlineAPI() {
  console.log('🧪 Testing Downline API...');
  
  try {
    // 1. Check if admin user exists and has referrals
    const adminUser = await prisma.appUser.findFirst({
      where: {
        OR: [
          { role: 'ADMIN' },
          { email: { contains: 'admin' } }
        ]
      },
      include: {
        referrals: {
          select: {
            id: true,
            fullName: true,
            email: true,
            status: true,
            createdAt: true,
          }
        }
      }
    });
    
    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }
    
    console.log(`📋 Admin user: ${adminUser.fullName} (ID: ${adminUser.id})`);
    console.log(`📊 Total referrals: ${adminUser.referrals.length}`);
    
    if (adminUser.referrals.length > 0) {
      console.log('\n👥 Referrals:');
      adminUser.referrals.forEach(ref => {
        console.log(`- ${ref.fullName} (${ref.email}) - ${ref.status}`);
      });
    }
    
    // 2. Test the service method directly
    console.log('\n🔍 Testing getMyDownline service...');
    
    const { UsersService } = require('./dist/src/users/users.service');
    const { RevenueLedgerService } = require('./dist/src/revenue/revenue-ledger.service');
    const { CommissionCalculatorService } = require('./dist/src/commission/commission-calculator.service');
    const { RanksService } = require('./dist/src/ranks/ranks.service');
    
    const commissionCalculatorService = new CommissionCalculatorService(prisma);
    const revenueLedgerService = new RevenueLedgerService(prisma, commissionCalculatorService);
    const ranksService = new RanksService(prisma);
    const usersService = new UsersService(prisma, revenueLedgerService, ranksService);
    
    const downlineResult = await usersService.getMyDownline(adminUser.id);
    console.log(`✅ Service returned ${downlineResult.length} downline users`);
    
    if (downlineResult.length > 0) {
      console.log('\n📋 Downline users:');
      downlineResult.forEach(user => {
        console.log(`- ${user.fullName}: Revenue=${user.totalRevenue}, Bookings=${user.totalBookings}`);
      });
    }
    
    // 3. Test stats
    const statsResult = await usersService.getDownlineStats(adminUser.id);
    console.log('\n📊 Stats:', statsResult);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
  
  await prisma.$disconnect();
}

testDownlineAPI().catch(console.error);
