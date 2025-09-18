const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProviderPct() {
  console.log('🔍 Checking Provider percentage calculation...');
  
  // Get booking 21 details
  const booking = await prisma.booking.findUnique({
    where: { id: 21 },
    include: {
      product: {
        select: { 
          commissionPct: true, 
          providerDesiredPct: true,
          name: true
        }
      }
    }
  });
  
  if (!booking) {
    console.log('❌ Booking 21 not found');
    return;
  }
  
  console.log('📊 Booking 21 details:');
  console.log('- Price:', booking.price);
  console.log('- Product:', booking.product?.name);
  console.log('- Commission Pct:', booking.product?.commissionPct);
  console.log('- Provider Desired Pct:', booking.product?.providerDesiredPct);
  
  // Calculate what provider percentage should be
  const price = Number(booking.price);
  const commissionPct = Number(booking.product?.commissionPct || 0);
  const providerDesiredPct = Number(booking.product?.providerDesiredPct || 0);
  
  const totalCommission = price * commissionPct;
  const providerAmount = price * providerDesiredPct;
  
  console.log('\n💰 Calculations:');
  console.log('- Total Commission:', totalCommission);
  console.log('- Provider Amount:', providerAmount);
  console.log('- Provider % of Price:', (providerDesiredPct * 100).toFixed(4) + '%');
  console.log('- Provider % of Commission:', ((providerAmount / totalCommission) * 100).toFixed(4) + '%');
  
  // Check what's stored in revenue_ledger
  const ledgerEntry = await prisma.revenueLedger.findFirst({
    where: { 
      bookingId: 21,
      role: 'provider'
    }
  });
  
  console.log('\n📋 Revenue Ledger Entry:');
  console.log('- Stored Amount:', ledgerEntry?.amount);
  console.log('- Stored Pct:', ledgerEntry?.pct);
  console.log('- Stored Pct as %:', (Number(ledgerEntry?.pct || 0) * 100).toFixed(4) + '%');
  
  console.log('\n🤔 Analysis:');
  console.log('- Should provider pct be:', providerDesiredPct, '(', (providerDesiredPct * 100).toFixed(2) + '% of price)');
  console.log('- Currently stored as:', ledgerEntry?.pct);
  console.log('- Admin will display:', (Number(ledgerEntry?.pct || 0) * 100).toFixed(4) + '%');
  
  await prisma.$disconnect();
}

checkProviderPct().catch(console.error);
