// Using built-in fetch (Node.js 18+)

const API_BASE_URL = 'http://192.168.1.59:3000';

async function testRevenue() {
  try {
    console.log('🔍 Testing Revenue API...');
    
    // 1. Login first
    console.log('\n1. Logging in...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'seller@example.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ Login successful');
    
    // 2. Test revenue-summary endpoint
    console.log('\n2. Testing revenue-summary...');
    const revenueResponse = await fetch(`${API_BASE_URL}/users/revenue-summary`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Revenue API status: ${revenueResponse.status}`);
    
    if (revenueResponse.ok) {
      const revenueData = await revenueResponse.json();
      console.log('✅ Revenue API working!');
      console.log('Revenue data:', JSON.stringify(revenueData, null, 2));
    } else {
      const errorText = await revenueResponse.text();
      console.log('❌ Revenue API error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRevenue();
