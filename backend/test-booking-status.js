// Use built-in fetch (Node 18+) or curl

const API_BASE_URL = 'http://192.168.1.59:3000';

async function testBookingStatus() {
  console.log('🔍 Testing Booking Status...');

  try {
    const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImVtYWlsIjoic2VsbGVyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzM3MjE5NzY5LCJleHAiOjE3Mzc4MjQ1Njl9.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const bookings = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📦 Bookings count: ${bookings.length}`);

    console.log(`\n📋 Booking statuses:`);
    bookings.forEach((booking, index) => {
      console.log(`  ${index + 1}. Booking #${booking.id}: "${booking.status}" (type: ${typeof booking.status})`);
    });

    // Group by status
    const statusGroups = {};
    bookings.forEach(booking => {
      const status = booking.status;
      if (!statusGroups[status]) {
        statusGroups[status] = 0;
      }
      statusGroups[status]++;
    });

    console.log(`\n📊 Status distribution:`);
    Object.entries(statusGroups).forEach(([status, count]) => {
      console.log(`  - "${status}": ${count} bookings`);
    });

    // Test filter logic
    console.log(`\n🔍 Filter test:`);
    const filters = ['pending', 'confirmed', 'cancelled', 'PENDING', 'CONFIRMED', 'CANCELLED'];
    
    filters.forEach(filter => {
      // HomeScreen logic
      const homeFiltered = bookings.filter(booking => booking.status === filter);
      
      // BookingsScreen logic  
      const bookingFiltered = bookings.filter(booking => {
        const backendStatus = booking.status.toLowerCase();
        return backendStatus === filter;
      });
      
      console.log(`  Filter "${filter}":`);
      console.log(`    - HomeScreen: ${homeFiltered.length} results`);
      console.log(`    - BookingsScreen: ${bookingFiltered.length} results`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBookingStatus();
