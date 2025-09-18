// Test database connection
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Test 2: Query users table
    console.log('\n2️⃣ Testing users table...');
    const userCount = await prisma.appUser.count();
    console.log(`✅ Users table accessible - ${userCount} users found`);

    // Test 3: Query products table
    console.log('\n3️⃣ Testing products table...');
    const productCount = await prisma.product.count();
    console.log(`✅ Products table accessible - ${productCount} products found`);

    // Test 4: Query bookings table
    console.log('\n4️⃣ Testing bookings table...');
    const bookingCount = await prisma.booking.count();
    console.log(`✅ Bookings table accessible - ${bookingCount} bookings found`);

    // Test 5: Test products with images
    console.log('\n5️⃣ Testing products with images...');
    const productsWithImages = await prisma.product.findMany({
      where: {
        images: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        images: true
      }
    });
    console.log(`✅ Found ${productsWithImages.length} products with images`);
    
    if (productsWithImages.length > 0) {
      const firstProduct = productsWithImages[0];
      console.log(`   - First product: ${firstProduct.name}`);
      console.log(`   - Images: ${firstProduct.images ? 'Yes' : 'No'}`);
    }

    // Test 6: Test bookings with prices
    console.log('\n6️⃣ Testing bookings with prices...');
    const bookingsWithPrices = await prisma.booking.findMany({
      select: {
        id: true,
        productId: true,
        price: true,
        status: true
      },
      take: 3
    });
    console.log(`✅ Found ${bookingsWithPrices.length} bookings with prices`);
    
    bookingsWithPrices.forEach((booking, index) => {
      console.log(`   - Booking ${index + 1}: Product ${booking.productId}, Price: ${Number(booking.price).toLocaleString()} VND, Status: ${booking.status}`);
    });

    console.log('\n🎉 All database tests passed!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Error details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
