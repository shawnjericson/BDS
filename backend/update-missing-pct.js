const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateMissingPct() {
  console.log('🔄 Updating missing pct values in revenue_ledger...');
  
  // Get all entries with NULL pct
  const nullPctEntries = await prisma.revenueLedger.findMany({
    where: { pct: null },
    include: {
      beneficiaryUser: {
        select: { id: true, fullName: true }
      }
    },
    orderBy: { bookingId: 'asc' }
  });
  
  console.log(`📊 Found ${nullPctEntries.length} entries with NULL pct`);
  
  let updatedCount = 0;
  
  // Group by booking ID to process each booking
  const bookingGroups = {};
  nullPctEntries.forEach(entry => {
    if (!bookingGroups[entry.bookingId]) {
      bookingGroups[entry.bookingId] = [];
    }
    bookingGroups[entry.bookingId].push(entry);
  });
  
  for (const bookingId of Object.keys(bookingGroups)) {
    console.log(`\n🔍 Processing booking ${bookingId}...`);
    
    try {
      // Get booking with seller rank info
      const booking = await prisma.booking.findUnique({
        where: { id: parseInt(bookingId) },
        include: {
          product: {
            select: { 
              commissionPct: true, 
              providerDesiredPct: true,
              ownerUserId: true 
            }
          },
          seller: {
            include: {
              userRanks: {
                where: { effectiveTo: null },
                include: {
                  rank: {
                    include: {
                      rankShares: true
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      if (!booking || !booking.seller || !booking.product) {
        console.log(`❌ Booking ${bookingId}: Missing booking/seller/product data`);
        continue;
      }
      
      const sellerRank = booking.seller.userRanks?.[0]?.rank;
      if (!sellerRank) {
        console.log(`❌ Booking ${bookingId}: No seller rank found`);
        continue;
      }
      
      console.log(`📋 Booking ${bookingId}: Seller rank ${sellerRank.name}`);
      
      // Get rank shares
      const sellerShare = sellerRank.rankShares.find(rs => rs.role === 'SELLER');
      const referrerShare = sellerRank.rankShares.find(rs => rs.role === 'REFERRER');
      const managerShare = sellerRank.rankShares.find(rs => rs.role === 'MANAGER');
      
      // Update each entry in this booking
      for (const entry of bookingGroups[bookingId]) {
        let pctValue = 0;
        
        if (entry.role === 'provider') {
          pctValue = Number(booking.product.providerDesiredPct || 0);
        } else if (entry.role === 'seller') {
          pctValue = Number(sellerShare?.pct || 0);
        } else if (entry.role === 'referrer') {
          pctValue = Number(referrerShare?.pct || 0);
        } else if (entry.role === 'manager') {
          pctValue = Number(managerShare?.pct || 0);
        }
        
        // Update the entry
        await prisma.revenueLedger.update({
          where: { id: entry.id },
          data: { pct: pctValue }
        });
        
        console.log(`✅ Updated ${entry.role}: ${entry.beneficiaryUser?.fullName} -> pct = ${pctValue} (${(pctValue * 100).toFixed(2)}%)`);
        updatedCount++;
      }
      
    } catch (error) {
      console.error(`❌ Error processing booking ${bookingId}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Successfully updated ${updatedCount} entries!`);
  
  // Verify the update
  const remainingNullEntries = await prisma.revenueLedger.count({
    where: { pct: null }
  });
  console.log(`📊 Remaining NULL pct entries: ${remainingNullEntries}`);
  
  await prisma.$disconnect();
}

updateMissingPct().catch(console.error);
