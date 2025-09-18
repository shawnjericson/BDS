const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAdminAPI() {
  console.log('🧪 Testing admin API endpoints...');
  
  try {
    // Import the services
    const { RevenueLedgerService } = require('./dist/src/revenue/revenue-ledger.service');
    const { CommissionCalculatorService } = require('./dist/src/commission/commission-calculator.service');
    
    const commissionCalculatorService = new CommissionCalculatorService(prisma);
    const revenueLedgerService = new RevenueLedgerService(prisma, commissionCalculatorService);
    
    console.log('📊 Testing getBookingCommissionFromLedger for booking 21...');
    const result = await revenueLedgerService.getBookingCommissionFromLedger(21);
    
    console.log('🔍 Raw API Response:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n📋 Formatted for Admin Display:');
    console.log('- Provider:', result.provider.percentage, '→', (result.provider.percentage * 100).toFixed(4) + '%');
    console.log('- Seller:', result.seller.percentage, '→', (result.seller.percentage * 100).toFixed(4) + '%');
    console.log('- Referrer:', result.referrer.percentage, '→', (result.referrer.percentage * 100).toFixed(4) + '%');
    console.log('- Manager:', result.manager.percentage, '→', (result.manager.percentage * 100).toFixed(4) + '%');
    
    console.log('\n🎯 Expected Admin Display:');
    console.log('- Provider: 0.0500% (0.05% of price)');
    console.log('- Seller: 65.0000% (65% rank share)');
    console.log('- Referrer: 6.0000% (6% rank 5 share)');
    console.log('- Manager: 0.0000% (no manager)');
    
    // Test what admin webapp formatCommission would show
    const formatCommission = (commissionPct, amount) => {
      const percentage = (commissionPct * 100).toFixed(4);
      if (amount) {
        return `${percentage}% (${amount.toLocaleString()} VND)`;
      }
      return `${percentage}%`;
    };
    
    console.log('\n🖥️ Admin Webapp formatCommission Output:');
    console.log('- Provider:', formatCommission(result.provider.percentage, result.provider.amount));
    console.log('- Seller:', formatCommission(result.seller.percentage, result.seller.amount));
    console.log('- Referrer:', formatCommission(result.referrer.percentage, result.referrer.amount));
    console.log('- Manager:', formatCommission(result.manager.percentage, result.manager.amount));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  await prisma.$disconnect();
}

testAdminAPI().catch(console.error);
