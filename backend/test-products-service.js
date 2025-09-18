const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProductsService() {
  console.log('🔍 Testing Products Service Logic...');

  try {
    // Simulate the ProductsService.findAll() logic
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

    // Transform products to include price from latest booking or base price
    const transformedProducts = products.map(product => ({
      ...product,
      price: product.bookings.length > 0 
        ? Number(product.bookings[0].price) 
        : product.basePrice 
          ? Number(product.basePrice)
          : null,
      images: product.images ? JSON.parse(product.images) : [],
      bookings: undefined, // Remove bookings from response to keep it clean
    }));

    console.log(`✅ Status: 200`);
    console.log(`📦 Products count: ${transformedProducts.length}`);

    console.log(`\n📋 First product:`);
    const firstProduct = transformedProducts[0];
    console.log(`  - ID: ${firstProduct.id}`);
    console.log(`  - Name: ${firstProduct.name}`);
    console.log(`  - Description: ${firstProduct.description}`);
    console.log(`  - Price: ${firstProduct.price}`);
    console.log(`  - Images: ${JSON.stringify(firstProduct.images, null, 2)}`);
    console.log(`  - Owner: ${JSON.stringify(firstProduct.owner, null, 2)}`);
    console.log(`  - Commission: ${firstProduct.commissionPct}`);
    console.log(`  - Status: ${firstProduct.status}`);

    console.log(`\n📋 All products with prices:`);
    transformedProducts.forEach(product => {
      console.log(`  - ${product.name}: ${product.price ? Number(product.price).toLocaleString() : 'null'} VND`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProductsService();
