const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testNewBookingPct() {
  console.log('🧪 Testing new booking pct creation...');
  
  try {
    // Import the service
    const { RevenueLedgerService } = require('./dist/src/revenue/revenue-ledger.service');
    const { CommissionCalculatorService } = require('./dist/src/commission/commission-calculator.service');
    
    const commissionCalculatorService = new CommissionCalculatorService(prisma);
    const revenueLedgerService = new RevenueLedgerService(prisma, commissionCalculatorService);
    
    // Test with existing booking 21
    console.log('🔄 Re-processing booking 21 to test pct creation...');
    
    // Delete existing entries first
    await prisma.revenueLedger.deleteMany({
      where: { bookingId: 21 }
    });
    
    // Process booking revenue (this should create entries with pct)
    await revenueLedgerService.processBookingRevenue(21);
    
    // Check the results
    const newEntries = await prisma.revenueLedger.findMany({
      where: { bookingId: 21 },
      include: {
        beneficiaryUser: {
          select: { id: true, fullName: true }
        }
      }
    });
    
    console.log('\n📊 New entries created:');
    newEntries.forEach(entry => {
      const pctDisplay = entry.pct ? (Number(entry.pct) * 100).toFixed(2) + '%' : 'NULL';
      console.log(`- ${entry.role}: User ${entry.beneficiaryUser?.fullName}, Amount: ${entry.amount}, Pct: ${entry.pct} = ${pctDisplay}`);
    });
    
    // Test API
    console.log('\n🧪 Testing API result:');
    const apiResult = await revenueLedgerService.getBookingCommissionFromLedger(21);
    console.log('- Provider:', apiResult.provider.percentage, '=', (Number(apiResult.provider.percentage || 0) * 100).toFixed(2) + '%');
    console.log('- Seller:', apiResult.seller.percentage, '=', (Number(apiResult.seller.percentage || 0) * 100).toFixed(2) + '%');
    console.log('- Referrer:', apiResult.referrer.percentage, '=', (Number(apiResult.referrer.percentage || 0) * 100).toFixed(2) + '%');
    console.log('- Manager:', apiResult.manager.percentage, '=', (Number(apiResult.manager.percentage || 0) * 100).toFixed(2) + '%');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  await prisma.$disconnect();
}

testNewBookingPct().catch(console.error);
