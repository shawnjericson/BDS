const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBooking21() {
  console.log('🔍 Checking booking 21 revenue_ledger data...');
  
  // Check revenue ledger entries
  const ledgerEntries = await prisma.revenueLedger.findMany({
    where: { bookingId: 21 },
    include: {
      beneficiaryUser: {
        select: { id: true, fullName: true }
      }
    }
  });
  
  console.log('💰 Revenue ledger entries for booking 21:');
  if (ledgerEntries.length === 0) {
    console.log('❌ No revenue ledger entries found!');
  } else {
    ledgerEntries.forEach(entry => {
      const pctDisplay = entry.pct ? (Number(entry.pct) * 100).toFixed(2) + '%' : 'NULL/0%';
      console.log(`- ${entry.role}: User ${entry.beneficiaryUser?.fullName || 'Unknown'} (${entry.beneficiaryUserId})`);
      console.log(`  Amount: ${entry.amount}, Pct: ${entry.pct} = ${pctDisplay}`);
    });
  }
  
  // Check what getBookingCommissionFromLedger returns
  console.log('\n🧪 Testing getBookingCommissionFromLedger API...');
  try {
    const { RevenueLedgerService } = require('./dist/src/revenue/revenue-ledger.service');
    const revenueLedgerService = new RevenueLedgerService(prisma, null);
    
    const result = await revenueLedgerService.getBookingCommissionFromLedger(21);
    
    console.log('📊 API Result:');
    console.log('- Provider:', result.provider.percentage, '=', (Number(result.provider.percentage || 0) * 100).toFixed(2) + '%');
    console.log('- Seller:', result.seller.percentage, '=', (Number(result.seller.percentage || 0) * 100).toFixed(2) + '%');
    console.log('- Referrer:', result.referrer.percentage, '=', (Number(result.referrer.percentage || 0) * 100).toFixed(2) + '%');
    console.log('- Manager:', result.manager.percentage, '=', (Number(result.manager.percentage || 0) * 100).toFixed(2) + '%');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
  
  await prisma.$disconnect();
}

checkBooking21().catch(console.error);
