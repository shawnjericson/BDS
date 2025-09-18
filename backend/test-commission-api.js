const API_BASE_URL = 'http://192.168.1.59:3000';

async function testCommissionAPI() {
  console.log('🔍 Testing Commission Info API Endpoint...');

  try {
    // Test with booking ID 16 (has all participants)
    const bookingId = 16;
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/commission-info`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const commissionInfo = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📋 Commission Info for Booking #${bookingId}:`);
    
    console.log(`\n💰 Basic Info:`);
    console.log(`  - Booking ID: ${commissionInfo.bookingId}`);
    console.log(`  - Product ID: ${commissionInfo.productId}`);
    console.log(`  - Price: ${commissionInfo.price.toLocaleString()} VND`);
    console.log(`  - Commission %: ${(commissionInfo.commissionPct * 100).toFixed(2)}%`);
    console.log(`  - Provider Desired %: ${(commissionInfo.providerDesiredPct * 100).toFixed(2)}%`);
    
    console.log(`\n👥 Participants:`);
    
    if (commissionInfo.seller) {
      console.log(`  🏪 Seller: ${commissionInfo.seller.fullName} (ID: ${commissionInfo.seller.id})`);
      console.log(`    - Role: ${commissionInfo.seller.role}`);
      if (commissionInfo.seller.currentRank) {
        console.log(`    - Rank: ${commissionInfo.seller.currentRank.name}`);
        console.log(`    - Rank Shares: ${commissionInfo.seller.rankShares?.length || 0} entries`);
        commissionInfo.seller.rankShares?.forEach(share => {
          console.log(`      * ${share.role}: ${(share.pct * 100).toFixed(2)}%`);
        });
      }
    }
    
    if (commissionInfo.referrer) {
      console.log(`  🤝 Referrer: ${commissionInfo.referrer.fullName} (ID: ${commissionInfo.referrer.id})`);
      console.log(`    - Role: ${commissionInfo.referrer.role}`);
      if (commissionInfo.referrer.currentRank) {
        console.log(`    - Rank: ${commissionInfo.referrer.currentRank.name}`);
        console.log(`    - Rank Shares: ${commissionInfo.referrer.rankShares?.length || 0} entries`);
        commissionInfo.referrer.rankShares?.forEach(share => {
          console.log(`      * ${share.role}: ${(share.pct * 100).toFixed(2)}%`);
        });
      }
    }
    
    if (commissionInfo.manager) {
      console.log(`  👔 Manager: ${commissionInfo.manager.fullName} (ID: ${commissionInfo.manager.id})`);
      console.log(`    - Role: ${commissionInfo.manager.role}`);
      if (commissionInfo.manager.currentRank) {
        console.log(`    - Rank: ${commissionInfo.manager.currentRank.name}`);
        console.log(`    - Rank Shares: ${commissionInfo.manager.rankShares?.length || 0} entries`);
        commissionInfo.manager.rankShares?.forEach(share => {
          console.log(`      * ${share.role}: ${(share.pct * 100).toFixed(2)}%`);
        });
      }
    }
    
    if (commissionInfo.provider) {
      console.log(`  🏢 Provider: ${commissionInfo.provider.fullName} (ID: ${commissionInfo.provider.id})`);
      console.log(`    - Role: ${commissionInfo.provider.role}`);
      if (commissionInfo.provider.currentRank) {
        console.log(`    - Rank: ${commissionInfo.provider.currentRank.name}`);
        console.log(`    - Rank Shares: ${commissionInfo.provider.rankShares?.length || 0} entries`);
        commissionInfo.provider.rankShares?.forEach(share => {
          console.log(`      * ${share.role}: ${(share.pct * 100).toFixed(2)}%`);
        });
      }
    }

    console.log(`\n🧮 Commission Calculation Example:`);
    const totalCommission = commissionInfo.price * commissionInfo.commissionPct;
    console.log(`  - Total Commission: ${totalCommission.toLocaleString()} VND`);
    
    if (commissionInfo.seller?.rankShares?.length > 0) {
      const sellerShare = commissionInfo.seller.rankShares.find(s => s.role === 'SELLER');
      if (sellerShare) {
        const sellerAmount = totalCommission * sellerShare.pct;
        console.log(`  - Seller Amount (${(sellerShare.pct * 100).toFixed(2)}%): ${sellerAmount.toLocaleString()} VND`);
      }
    }
    
    if (commissionInfo.referrer?.rankShares?.length > 0) {
      const referrerShare = commissionInfo.referrer.rankShares.find(s => s.role === 'REFERRER');
      if (referrerShare) {
        const referrerAmount = totalCommission * referrerShare.pct;
        console.log(`  - Referrer Amount (${(referrerShare.pct * 100).toFixed(2)}%): ${referrerAmount.toLocaleString()} VND`);
      }
    }
    
    if (commissionInfo.manager?.rankShares?.length > 0) {
      const managerShare = commissionInfo.manager.rankShares.find(s => s.role === 'MANAGER');
      if (managerShare) {
        const managerAmount = totalCommission * managerShare.pct;
        console.log(`  - Manager Amount (${(managerShare.pct * 100).toFixed(2)}%): ${managerAmount.toLocaleString()} VND`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCommissionAPI();
