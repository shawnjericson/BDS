const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPctFormat() {
  console.log('🔍 Checking how pct is stored in revenue_ledger...');
  
  // Check a few bookings to see pct format
  const ledgerEntries = await prisma.revenueLedger.findMany({
    where: { 
      bookingId: { in: [21, 20, 19] },
      role: 'referrer'
    },
    include: {
      beneficiaryUser: {
        select: { id: true, fullName: true }
      }
    },
    orderBy: { bookingId: 'desc' }
  });
  
  console.log('💰 Referrer entries from multiple bookings:');
  ledgerEntries.forEach(entry => {
    console.log(`- Booking ${entry.bookingId}: User ${entry.beneficiaryUser?.fullName}`);
    console.log(`  Raw pct value: ${entry.pct} (type: ${typeof entry.pct})`);
    console.log(`  As number: ${Number(entry.pct)}`);
    console.log(`  * 100: ${Number(entry.pct) * 100}`);
    console.log(`  Direct display: ${entry.pct}%`);
    console.log('');
  });
  
  // Check what rank shares look like
  console.log('🏆 Checking rank shares for comparison:');
  const rankShares = await prisma.rankShare.findMany({
    where: { role: 'REFERRER' },
    include: {
      rank: { select: { name: true } }
    }
  });
  
  rankShares.forEach(share => {
    console.log(`- ${share.rank.name}: pct = ${share.pct} (${Number(share.pct) * 100}%)`);
  });
  
  await prisma.$disconnect();
}

checkPctFormat().catch(console.error);
