const API_BASE_URL = 'http://192.168.1.59:3000';

async function testAPIDirect() {
  console.log('🔍 Testing API Endpoints Directly...');

  try {
    // Test if backend is running
    console.log('1. Testing basic health check...');
    
    const healthResponse = await fetch(`${API_BASE_URL}/`);
    console.log(`Health check status: ${healthResponse.status}`);
    
    if (healthResponse.status === 404) {
      console.log('✅ Backend is running (404 is expected for root path)');
    }
    
    // Test auth endpoint
    console.log('\n2. Testing auth endpoint...');
    const authResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'seller@example.com',
        password: '123456'
      })
    });
    
    console.log(`Auth status: ${authResponse.status}`);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Login successful');
      
      const token = authData.access_token;
      
      // Test revenue endpoint with auth
      console.log('\n3. Testing revenue-summary endpoint with auth...');
      const revenueResponse = await fetch(`${API_BASE_URL}/users/revenue-summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log(`Revenue endpoint status: ${revenueResponse.status}`);
      
      if (revenueResponse.ok) {
        const revenueData = await revenueResponse.json();
        console.log('✅ Revenue API working!');
        console.log('Revenue data:', JSON.stringify(revenueData, null, 2));
      } else {
        const errorText = await revenueResponse.text();
        console.log('❌ Revenue API error:', errorText);
      }
      
      // Test separate test controller
      console.log('\n4. Testing separate test controller...');
      const testHealthResponse = await fetch(`${API_BASE_URL}/test/health`);

      console.log(`Test health endpoint status: ${testHealthResponse.status}`);

      if (testHealthResponse.ok) {
        const testHealthData = await testHealthResponse.json();
        console.log('✅ Test health API working!');
        console.log('Test health data:', JSON.stringify(testHealthData, null, 2));

        // Now test revenue endpoint
        console.log('\n5. Testing revenue via test controller...');
        const testRevenueResponse = await fetch(`${API_BASE_URL}/test/revenue/2`);

        console.log(`Test revenue endpoint status: ${testRevenueResponse.status}`);

        if (testRevenueResponse.ok) {
          const testRevenueData = await testRevenueResponse.json();
          console.log('✅ Test revenue API working!');
          console.log('Test revenue data:', JSON.stringify(testRevenueData, null, 2));
        } else {
          const errorText = await testRevenueResponse.text();
          console.log('❌ Test revenue API error:', errorText);
        }
      } else {
        const errorText = await testHealthResponse.text();
        console.log('❌ Test health API error:', errorText);
      }

      // Test simple test endpoint with auth
      console.log('\n5. Testing simple test endpoint with auth...');
      const testResponse = await fetch(`${API_BASE_URL}/users/test`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log(`Test endpoint status: ${testResponse.status}`);

      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('✅ Test API working!');
        console.log('Test data:', JSON.stringify(testData, null, 2));
      } else {
        const errorText = await testResponse.text();
        console.log('❌ Test API error:', errorText);
      }
      
    } else {
      const errorText = await authResponse.text();
      console.log('❌ Login failed:', errorText);
    }

  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.log('\n🔍 Possible issues:');
    console.log('- Backend not running on http://192.168.1.59:3000');
    console.log('- Network connectivity issues');
    console.log('- CORS configuration problems');
  }
}

testAPIDirect();
