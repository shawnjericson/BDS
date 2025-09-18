const http = require('http');
const https = require('https');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: options.method || 'GET',
      headers: options.headers || {},
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    });

    req.on('error', reject);
    req.setTimeout(options.timeout || 5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function debugWebLogin() {
  console.log('🔍 Debugging Web Login Issues...\n');

  // Test 1: Check backend connection from localhost
  console.log('1️⃣ Testing backend connection from localhost...');
  try {
    const response = await makeRequest('http://localhost:3000/');
    console.log('✅ Backend reachable from localhost');
    console.log(`   Response: ${response.data}`);
  } catch (error) {
    console.log('❌ Backend not reachable from localhost');
    console.log(`   Error: ${error.message}`);
    console.log('   Make sure backend is running: npm run start:dev');
    return;
  }
  
  // Test 2: Test login API from localhost
  console.log('\n2️⃣ Testing login API from localhost...');
  try {
    const loginResponse = await makeRequest('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8080',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: '123456'
      }),
      timeout: 10000
    });

    console.log('✅ Login API successful from localhost');
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Response: ${loginResponse.data.substring(0, 100)}...`);

  } catch (error) {
    console.log('❌ Login API failed from localhost');
    console.log(`   Error: ${error.message}`);
  }
  
  // Test 3: Check if backend is listening on different URLs
  console.log('\n3️⃣ Testing different backend URLs...');
  const testUrls = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://172.16.20.213:3000',
  ];

  for (const url of testUrls) {
    try {
      const response = await makeRequest(`${url}/`, { timeout: 3000 });
      console.log(`   ✅ ${url}: Reachable (${response.status})`);
    } catch (error) {
      console.log(`   ❌ ${url}: Not reachable - ${error.message}`);
    }
  }
  
  console.log('\n🔧 Potential Solutions:');
  console.log('1. Backend might not be listening on localhost (only on 172.16.20.213)');
  console.log('2. CORS might not be configured for localhost origin');
  console.log('3. Web test app might need to use the IP address instead');
  console.log('4. Browser might be blocking the request');
  
  console.log('\n📝 Recommended fixes:');
  console.log('1. Update web test to use IP address: http://172.16.20.213:3000');
  console.log('2. Or configure backend to listen on both localhost and IP');
  console.log('3. Check browser console for detailed error messages');
}

debugWebLogin().catch(console.error);
