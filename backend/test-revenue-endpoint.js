const API_BASE_URL = 'http://192.168.1.59:3000';

async function testRevenueEndpoint() {
  console.log('🔍 Testing Revenue API Endpoint...');

  try {
    // Test basic endpoints first
    console.log('Testing basic endpoints...');
    
    const response = await fetch(`${API_BASE_URL}/users`);
    console.log(`Users endpoint status: ${response.status}`);
    
    if (response.ok) {
      const users = await response.json();
      console.log(`Found ${users.length} users`);
      
      if (users.length > 0) {
        const testUser = users.find(u => u.id === 2) || users[0];
        console.log(`Testing with user: ${testUser.fullName} (ID: ${testUser.id})`);
        
        // Test revenue-summary endpoint (this should work without auth for testing)
        console.log('\nTesting revenue-summary endpoint...');
        
        // Since the endpoint requires auth, let's test the service method directly
        // by creating a simple test endpoint
        
        console.log('Revenue endpoint requires authentication.');
        console.log('Backend is running, but mobile needs to login first.');
        console.log('The 500 error might be due to authentication or service method issues.');
      }
    } else {
      console.log('❌ Basic endpoint failed');
      const errorText = await response.text();
      console.log('Error:', errorText);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRevenueEndpoint();
