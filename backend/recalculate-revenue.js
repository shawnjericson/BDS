const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Commission Calculator Logic (simplified version)
async function calculateCommissionByBookingId(bookingId) {
  console.log(`🔍 Calculating commission for booking ${bookingId}`);
  
  // Get booking with basic related data
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      product: {
        include: {
          owner: true
        }
      },
      seller: true,
      referrer: true,
      manager: true
    }
  });

  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  const price = Number(booking.price);
  const commissionPct = Number(booking.product.commissionPct) / 100;
  const providerDesiredPct = Number(booking.product.providerDesiredPct) / 100;

  // Calculate base commission
  const baseCommission = price * commissionPct;
  
  // Provider gets their desired percentage of base commission
  const providerAmount = baseCommission * providerDesiredPct;
  
  // Remaining commission to be split among seller, referrer, manager
  const remainingCommission = baseCommission - providerAmount;

  // Use default percentages (simplified)
  const sellerPct = 0.7; // 70% default
  const referrerPct = 0.2; // 20% default
  const managerPct = 0.1; // 10% default

  // Calculate amounts
  const sellerAmount = remainingCommission * sellerPct;
  const referrerAmount = booking.referrerUserId ? remainingCommission * referrerPct : 0;
  const managerAmount = booking.managerUserId ? remainingCommission * managerPct : 0;

  return {
    booking_id: bookingId,
    base_commission: baseCommission,
    provider: {
      user_id: booking.product.ownerUserId,
      amount: providerAmount
    },
    seller: {
      user_id: booking.sellerUserId,
      amount: sellerAmount
    },
    referrer: booking.referrerUserId ? {
      user_id: booking.referrerUserId,
      amount: referrerAmount
    } : null,
    manager: booking.managerUserId ? {
      user_id: booking.managerUserId,
      amount: managerAmount
    } : null,
    system_residual: remainingCommission - sellerAmount - referrerAmount - managerAmount
  };
}

// Process revenue for a single booking
async function processBookingRevenue(bookingId) {
  console.log(`💰 Processing revenue for booking ${bookingId}`);

  // Delete existing entries for this booking
  await prisma.revenueLedger.deleteMany({
    where: { bookingId }
  });

  try {
    // Calculate commission
    const commissionData = await calculateCommissionByBookingId(bookingId);
    
    console.log(`📊 Commission calculated:`, {
      baseCommission: commissionData.base_commission,
      provider: commissionData.provider.amount,
      seller: commissionData.seller.amount,
      referrer: commissionData.referrer?.amount || 0,
      manager: commissionData.manager?.amount || 0
    });

    // Create revenue ledger entries
    const ledgerEntries = [];

    // 1. Provider revenue
    if (commissionData.provider.user_id) {
      ledgerEntries.push({
        bookingId,
        role: 'provider',
        beneficiaryUserId: commissionData.provider.user_id,
        amount: commissionData.provider.amount,
      });
    }

    // 2. Seller revenue
    if (commissionData.seller.user_id) {
      ledgerEntries.push({
        bookingId,
        role: 'seller',
        beneficiaryUserId: commissionData.seller.user_id,
        amount: commissionData.seller.amount,
      });
    }

    // 3. Referrer revenue
    if (commissionData.referrer?.user_id) {
      ledgerEntries.push({
        bookingId,
        role: 'referrer',
        beneficiaryUserId: commissionData.referrer.user_id,
        amount: commissionData.referrer.amount,
      });
    }

    // 4. Manager revenue
    if (commissionData.manager?.user_id) {
      ledgerEntries.push({
        bookingId,
        role: 'manager',
        beneficiaryUserId: commissionData.manager.user_id,
        amount: commissionData.manager.amount,
      });
    }

    // Save all entries
    if (ledgerEntries.length > 0) {
      await prisma.revenueLedger.createMany({
        data: ledgerEntries
      });
      console.log(`✅ Created ${ledgerEntries.length} revenue entries for booking ${bookingId}`);
    }

  } catch (error) {
    console.error(`❌ Error processing booking ${bookingId}:`, error.message);
  }
}

// Main function to recalculate all revenue
async function recalculateAllRevenue() {
  console.log('🔄 Starting revenue recalculation for all bookings...');

  try {
    // Clear all existing revenue ledger entries
    console.log('🗑️ Clearing existing revenue ledger...');
    await prisma.revenueLedger.deleteMany({});

    // Get all bookings
    const allBookings = await prisma.booking.findMany({
      orderBy: { id: 'asc' }
    });

    console.log(`📊 Found ${allBookings.length} total bookings to process`);

    // Process each booking
    for (let i = 0; i < allBookings.length; i++) {
      const booking = allBookings[i];
      console.log(`\n[${i + 1}/${allBookings.length}] Processing booking ${booking.id} (${booking.status})`);
      
      try {
        await processBookingRevenue(booking.id);
      } catch (error) {
        console.error(`❌ Failed to process booking ${booking.id}:`, error.message);
      }
    }

    // Show summary
    const totalEntries = await prisma.revenueLedger.count();
    console.log(`\n✅ Revenue recalculation completed!`);
    console.log(`📊 Total revenue ledger entries created: ${totalEntries}`);

    // Show revenue by user
    const revenueByUser = await prisma.revenueLedger.groupBy({
      by: ['beneficiaryUserId'],
      _sum: {
        amount: true
      },
      orderBy: {
        beneficiaryUserId: 'asc'
      }
    });

    console.log('\n💰 Revenue summary by user:');
    for (const userRevenue of revenueByUser) {
      const user = await prisma.appUser.findUnique({
        where: { id: userRevenue.beneficiaryUserId },
        select: { fullName: true, email: true }
      });
      console.log(`  User ${userRevenue.beneficiaryUserId} (${user?.fullName || 'Unknown'}): ${Number(userRevenue._sum.amount).toLocaleString('vi-VN')} VND`);
    }

  } catch (error) {
    console.error('❌ Error during revenue recalculation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
recalculateAllRevenue();
