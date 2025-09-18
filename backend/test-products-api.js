// Test products API to check images and prices
const API_BASE_URL = 'http://192.168.1.15:3000';

async function testProductsAPI() {
  console.log('🔍 Testing Products API...\n');

  try {
    // Test 1: Get approved products
    console.log('1️⃣ Testing /products/approved endpoint...');
    const approvedResponse = await fetch(`${API_BASE_URL}/products/approved`);
    const approvedData = await approvedResponse.json();
    console.log('✅ Approved products response status:', approvedResponse.status);
    console.log('📦 Number of approved products:', approvedData.length);

    if (approvedData.length > 0) {
      const firstProduct = approvedData[0];
      console.log('\n📋 First product details:');
      console.log('  - ID:', firstProduct.id);
      console.log('  - Name:', firstProduct.name);
      console.log('  - Description:', firstProduct.description);
      console.log('  - Price:', firstProduct.price ? `${firstProduct.price.toLocaleString()} VND` : 'No price');
      console.log('  - Images:', firstProduct.images ? firstProduct.images.length + ' images' : 'No images');
      console.log('  - Commission %:', firstProduct.commissionPct);
      console.log('  - Status:', firstProduct.status);

      if (firstProduct.images && firstProduct.images.length > 0) {
        console.log('  - First image URL:', firstProduct.images[0]);
      }
    }

    // Test 2: Get all products
    console.log('\n2️⃣ Testing /products endpoint...');
    const allResponse = await fetch(`${API_BASE_URL}/products`);
    const allData = await allResponse.json();
    console.log('✅ All products response status:', allResponse.status);
    console.log('📦 Number of all products:', allData.length);

    // Test 3: Get specific product
    if (approvedData.length > 0) {
      const productId = approvedData[0].id;
      console.log(`\n3️⃣ Testing /products/${productId} endpoint...`);
      const productResponse = await fetch(`${API_BASE_URL}/products/${productId}`);
      const product = await productResponse.json();
      console.log('✅ Product detail response status:', productResponse.status);
      console.log('\n📋 Product detail:');
      console.log('  - ID:', product.id);
      console.log('  - Name:', product.name);
      console.log('  - Price:', product.price ? `${product.price.toLocaleString()} VND` : 'No price');
      console.log('  - Images:', product.images ? product.images.length + ' images' : 'No images');
      console.log('  - Bookings count:', product.bookings ? product.bookings.length : 0);
      
      if (product.bookings && product.bookings.length > 0) {
        console.log('  - Latest booking price:', Number(product.bookings[0].price).toLocaleString() + ' VND');
        console.log('  - Latest booking status:', product.bookings[0].status);
      }
    }

    console.log('\n🎉 All API tests completed successfully!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testProductsAPI();
