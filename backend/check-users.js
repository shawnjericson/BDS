const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('👤 Checking users in database...');

  try {
    const users = await prisma.appUser.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        password: true, // We'll check if password is hashed
      },
      take: 5
    });

    console.log(`Found ${users.length} users:`);
    
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.fullName}`);
      console.log(`  Password: ${user.password.substring(0, 20)}... (${user.password.length} chars)`);
    });

    // Try to find the specific user
    const sellerB = await prisma.appUser.findUnique({
      where: { email: 'seller.b@example.com' }
    });

    if (sellerB) {
      console.log('\n✅ Found seller.b@example.com');
      console.log(`Password hash: ${sellerB.password}`);
    } else {
      console.log('\n❌ seller.b@example.com not found');
      
      // Show available emails
      const emails = users.map(u => u.email);
      console.log('Available emails:', emails);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
