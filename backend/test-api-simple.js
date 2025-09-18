const API_BASE_URL = 'http://192.168.1.59:3000';

async function testAPI() {
  console.log('🔍 Testing Commission API...');

  try {
    // Test basic endpoint first
    const response = await fetch(`${API_BASE_URL}/bookings`);
    console.log(`Bookings endpoint status: ${response.status}`);
    
    if (response.ok) {
      const bookings = await response.json();
      console.log(`Found ${bookings.length} bookings`);
      
      if (bookings.length > 0) {
        const firstBooking = bookings[0];
        console.log(`Testing commission info for booking #${firstBooking.id}`);
        
        // Test commission info endpoint
        const commissionResponse = await fetch(`${API_BASE_URL}/bookings/${firstBooking.id}/commission-info`);
        console.log(`Commission info status: ${commissionResponse.status}`);
        
        if (commissionResponse.ok) {
          const commissionInfo = await commissionResponse.json();
          console.log('✅ Commission API working!');
          console.log(`Commission info:`, JSON.stringify(commissionInfo, null, 2));
        } else {
          console.log('❌ Commission API failed');
          const errorText = await commissionResponse.text();
          console.log('Error:', errorText);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
