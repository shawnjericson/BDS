const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNullPct() {
  console.log('🔍 Checking NULL pct values in revenue_ledger...');
  
  // Count total entries
  const totalEntries = await prisma.revenueLedger.count();
  console.log(`📊 Total revenue_ledger entries: ${totalEntries}`);
  
  // Count NULL pct entries
  const nullPctEntries = await prisma.revenueLedger.count({
    where: { pct: null }
  });
  console.log(`❌ Entries with NULL pct: ${nullPctEntries}`);
  
  // Count non-NULL pct entries
  const nonNullPctEntries = await prisma.revenueLedger.count({
    where: { pct: { not: null } }
  });
  console.log(`✅ Entries with pct value: ${nonNullPctEntries}`);
  
  // Show some examples of NULL entries
  console.log('\n📋 Sample NULL pct entries:');
  const sampleNullEntries = await prisma.revenueLedger.findMany({
    where: { pct: null },
    take: 5,
    include: {
      beneficiaryUser: {
        select: { id: true, fullName: true }
      }
    },
    orderBy: { bookingId: 'desc' }
  });
  
  sampleNullEntries.forEach(entry => {
    console.log(`- Booking ${entry.bookingId}, ${entry.role}: User ${entry.beneficiaryUser?.fullName}, Amount: ${entry.amount}, Pct: ${entry.pct}`);
  });
  
  // Show some examples of non-NULL entries
  console.log('\n📋 Sample entries with pct values:');
  const sampleNonNullEntries = await prisma.revenueLedger.findMany({
    where: { pct: { not: null } },
    take: 5,
    include: {
      beneficiaryUser: {
        select: { id: true, fullName: true }
      }
    },
    orderBy: { bookingId: 'desc' }
  });
  
  sampleNonNullEntries.forEach(entry => {
    console.log(`- Booking ${entry.bookingId}, ${entry.role}: User ${entry.beneficiaryUser?.fullName}, Amount: ${entry.amount}, Pct: ${entry.pct}`);
  });
  
  await prisma.$disconnect();
}

checkNullPct().catch(console.error);
