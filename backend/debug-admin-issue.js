const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugAdminIssue() {
  console.log('🔍 Debugging admin webapp display issue...');
  
  // Check what admin webapp SHOULD be getting
  console.log('\n1️⃣ Testing getBookingCommissionFromLedger API:');
  try {
    const { RevenueLedgerService } = require('./dist/src/revenue/revenue-ledger.service');
    const { CommissionCalculatorService } = require('./dist/src/commission/commission-calculator.service');
    
    const commissionCalculatorService = new CommissionCalculatorService(prisma);
    const revenueLedgerService = new RevenueLedgerService(prisma, commissionCalculatorService);
    
    const result = await revenueLedgerService.getBookingCommissionFromLedger(21);
    
    console.log('✅ API Response for booking 21:');
    console.log('- Provider:', result.provider.percentage, '→', (result.provider.percentage * 100).toFixed(4) + '%');
    console.log('- Seller:', result.seller.percentage, '→', (result.seller.percentage * 100).toFixed(4) + '%');
    console.log('- Referrer:', result.referrer.percentage, '→', (result.referrer.percentage * 100).toFixed(4) + '%');
    console.log('- Manager:', result.manager.percentage, '→', (result.manager.percentage * 100).toFixed(4) + '%');
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
  }
  
  // Check what admin webapp is ACTUALLY showing (from screenshot)
  console.log('\n2️⃣ What admin webapp is showing (from screenshot):');
  console.log('- Provider: 5.0000% (should be 0.0500%)');
  console.log('- Seller: 3.2500% (should be 65.0000%)');
  console.log('- Referrer: 0.3000% (should be 6.0000%)');
  console.log('- Manager: N/A (should be 0.0000%)');
  
  // Possible causes
  console.log('\n3️⃣ Possible causes:');
  console.log('❌ Admin webapp is NOT calling getBookingCommissionFromLedger');
  console.log('❌ Admin webapp is calling a different API');
  console.log('❌ Admin webapp is calculating percentages itself');
  console.log('❌ Admin webapp is using cached/old data');
  
  // Check if admin webapp might be calling calculateCommission instead
  console.log('\n4️⃣ Testing other possible APIs admin might be calling:');
  
  try {
    const { BookingsService } = require('./dist/src/bookings/bookings.service');
    const bookingsService = new BookingsService(prisma, null, null);
    
    // This might be what admin is actually calling
    const commissionCalc = await bookingsService.calculateCommission(21);
    console.log('📊 calculateCommission result:');
    console.log('- Total participants:', commissionCalc.participants.length);
    
    commissionCalc.participants.forEach(p => {
      const pct = p.rankSharePct || p.fixedRatePct || 0;
      console.log(`- ${p.role}: ${(pct * 100).toFixed(4)}% (${p.calculatedAmount})`);
    });
    
  } catch (error) {
    console.error('❌ calculateCommission Error:', error.message);
  }
  
  // Check raw database data
  console.log('\n5️⃣ Raw database data for booking 21:');
  const ledgerEntries = await prisma.revenueLedger.findMany({
    where: { bookingId: 21 },
    include: {
      beneficiaryUser: {
        select: { fullName: true }
      }
    }
  });
  
  ledgerEntries.forEach(entry => {
    console.log(`- ${entry.role}: ${entry.beneficiaryUser?.fullName}, pct=${entry.pct}, amount=${entry.amount}`);
  });
  
  await prisma.$disconnect();
}

debugAdminIssue().catch(console.error);
