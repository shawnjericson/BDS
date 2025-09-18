const axios = require('axios');

const API_BASE_URL = 'http://172.16.0.39:3000';

async function testCreateBooking() {
  try {
    // First login to get token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'seller@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');
    
    // Get approved products
    console.log('📦 Getting approved products...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products/approved`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Products found:', productsResponse.data.length);
    if (productsResponse.data.length > 0) {
      console.log('First product:', productsResponse.data[0]);
    }
    
    // Create booking
    console.log('📝 Creating booking...');
    const bookingData = {
      productId: productsResponse.data[0]?.id || 1,
      price: 1000000,
      customerName: 'Test Customer',
      customerPhone: '0123456789',
      customerEmail: 'test@example.com'
    };
    
    console.log('Booking data:', bookingData);
    
    const bookingResponse = await axios.post(`${API_BASE_URL}/bookings`, bookingData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Booking created successfully:', bookingResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
    }
  }
}

testCreateBooking();
