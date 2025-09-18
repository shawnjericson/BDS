// Simple test for products API
const API_BASE_URL = 'http://192.168.1.59:3000';

async function testAPI() {
  console.log('🔍 Testing Products API...\n');

  try {
    const response = await fetch(`${API_BASE_URL}/products?status=APPROVED`);
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('📦 Products count:', data.length);
    
    if (data.length > 0) {
      const product = data[0];
      console.log('\n📋 First product:');
      console.log('  - ID:', product.id);
      console.log('  - Name:', product.name);
      console.log('  - Description:', product.description);
      console.log('  - Price:', product.price);
      console.log('  - Images:', product.images);
      console.log('  - Owner:', product.owner);
      console.log('  - Commission:', product.commissionPct);
      console.log('  - Status:', product.status);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
