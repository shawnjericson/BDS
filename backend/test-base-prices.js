const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBasePrices() {
  console.log('🔍 Testing base prices...');

  try {
    const products = await prisma.product.findMany({
      where: { status: 'APPROVED' },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { id: 'desc' },
    });

    console.log(`📦 Found ${products.length} approved products`);

    products.forEach(product => {
      const bookingPrice = product.bookings.length > 0 ? Number(product.bookings[0].price) : null;
      const basePrice = product.basePrice ? Number(product.basePrice) : null;
      const finalPrice = bookingPrice || basePrice;

      console.log(`\n📋 Product ${product.id}:`);
      console.log(`  - Name: ${product.name}`);
      console.log(`  - Base Price: ${basePrice ? basePrice.toLocaleString() : 'null'} VND`);
      console.log(`  - Booking Price: ${bookingPrice ? bookingPrice.toLocaleString() : 'null'} VND`);
      console.log(`  - Final Price: ${finalPrice ? finalPrice.toLocaleString() : 'null'} VND`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBasePrices();
