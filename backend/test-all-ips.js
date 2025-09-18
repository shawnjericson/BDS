// Test all possible IP addresses
const os = require('os');

async function testAllIPs() {
  console.log('🔍 Testing all possible IP addresses...\n');

  // Get all network interfaces
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  // Add localhost
  ips.push('localhost');
  ips.push('127.0.0.1');
  
  // Add all network interface IPs
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }

  console.log('📋 Found IP addresses:', ips);
  console.log('');

  // Test each IP
  for (const ip of ips) {
    const url = `http://${ip}:3000`;
    console.log(`🔗 Testing ${url}...`);
    
    try {
      const response = await fetch(url);
      const text = await response.text();
      console.log(`✅ ${url} - Status: ${response.status} - Response: ${text.substring(0, 50)}`);
      
      // Test products endpoint
      try {
        const productsResponse = await fetch(`${url}/products/approved`);
        const productsData = await productsResponse.json();
        console.log(`   📦 Products endpoint: ${productsResponse.status} - ${productsData.length} products`);
      } catch (error) {
        console.log(`   ❌ Products endpoint failed: ${error.message}`);
      }
      
    } catch (error) {
      console.log(`❌ ${url} - Failed: ${error.message}`);
    }
    console.log('');
  }

  // Test the specific IP from mobile config
  const mobileIP = 'http://192.168.1.15:3000';
  console.log(`🎯 Testing mobile config IP: ${mobileIP}...`);
  try {
    const response = await fetch(mobileIP);
    const text = await response.text();
    console.log(`✅ Mobile IP works - Status: ${response.status} - Response: ${text.substring(0, 50)}`);
  } catch (error) {
    console.log(`❌ Mobile IP failed: ${error.message}`);
  }
}

testAllIPs();
