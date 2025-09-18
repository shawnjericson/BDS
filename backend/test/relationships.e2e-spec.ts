import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Relationships API Tests (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testBookingId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    });

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: '123456',
      })
      .expect(200);

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    // Clean up test booking if created
    if (testBookingId) {
      try {
        await prisma.booking.delete({ where: { id: testBookingId } });
      } catch (error) {
        // Booking might already be deleted
      }
    }
    await app.close();
  });

  describe('User Relationships', () => {
    it('/users/me (GET) should return user with manager and referrer info', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('fullName');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('referralCode');
      expect(response.body).toHaveProperty('managerId');
      expect(response.body).toHaveProperty('referredBy');
      
      // Should include manager info if exists
      if (response.body.managerId) {
        expect(response.body).toHaveProperty('manager');
        expect(response.body.manager).toHaveProperty('id');
        expect(response.body.manager).toHaveProperty('fullName');
        expect(response.body.manager).toHaveProperty('email');
      }

      // Should include referrer info if exists
      if (response.body.referredBy) {
        expect(response.body).toHaveProperty('referrer');
        expect(response.body.referrer).toHaveProperty('id');
        expect(response.body.referrer).toHaveProperty('fullName');
        expect(response.body.referrer).toHaveProperty('referralCode');
      }

      // Should include managed users if any
      expect(response.body).toHaveProperty('managedUsers');
      expect(Array.isArray(response.body.managedUsers)).toBe(true);

      // Should include referrals if any
      expect(response.body).toHaveProperty('referrals');
      expect(Array.isArray(response.body.referrals)).toBe(true);

      console.log('User profile response:', JSON.stringify(response.body, null, 2));
    });

    it('/users (GET) should return users with manager info', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('pagination');

      const user = response.body.users[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('fullName');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('managerId');

      // Should include manager info if exists
      if (user.managerId) {
        expect(user).toHaveProperty('manager');
        expect(user.manager).toHaveProperty('id');
        expect(user.manager).toHaveProperty('fullName');
        expect(user.manager).toHaveProperty('email');
      }

      // Should include count of managed users
      expect(user).toHaveProperty('_count');
      expect(user._count).toHaveProperty('managedUsers');
      expect(typeof user._count.managedUsers).toBe('number');

      console.log('Users list response (first user):', JSON.stringify(user, null, 2));
    });

    it('/users/:id (GET) should return user with full relationship details', async () => {
      // Get a user with manager (Manager D has ID 4)
      const response = await request(app.getHttpServer())
        .get('/users/4')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', 4);
      expect(response.body).toHaveProperty('fullName');
      expect(response.body).toHaveProperty('managerId');
      expect(response.body).toHaveProperty('referredBy');

      // Should include manager info (Admin)
      if (response.body.managerId) {
        expect(response.body).toHaveProperty('manager');
        expect(response.body.manager).toHaveProperty('fullName');
      }

      // Should include managed users
      expect(response.body).toHaveProperty('managedUsers');
      expect(Array.isArray(response.body.managedUsers)).toBe(true);
      expect(response.body.managedUsers.length).toBeGreaterThan(0);

      // Should include referrals
      expect(response.body).toHaveProperty('referrals');
      expect(Array.isArray(response.body.referrals)).toBe(true);

      console.log('User detail response:', JSON.stringify(response.body, null, 2));
    });
  });

  describe('Booking Relationships', () => {
    it('POST /bookings should create booking with product and user relationships', async () => {
      // First get a product
      const productsResponse = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(productsResponse.body)).toBe(true);
      expect(productsResponse.body.length).toBeGreaterThan(0);
      const product = productsResponse.body[0];

      // Create a booking
      const bookingData = {
        productId: product.id,
        price: 1000.00,
        sellerUserId: 2, // Seller B
        referrerUserId: 3, // Referrer C
        managerUserId: 4, // Manager D
      };

      const response = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(201);

      testBookingId = response.body.id;

      // Verify booking includes all relationships
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('price');
      expect(response.body).toHaveProperty('status');

      // Product relationship
      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('id', product.id);
      expect(response.body.product).toHaveProperty('name');
      expect(response.body.product).toHaveProperty('owner');
      expect(response.body.product.owner).toHaveProperty('fullName');

      // User relationships
      expect(response.body).toHaveProperty('seller');
      expect(response.body.seller).toHaveProperty('id', 2);
      expect(response.body.seller).toHaveProperty('fullName');

      expect(response.body).toHaveProperty('referrer');
      expect(response.body.referrer).toHaveProperty('id', 3);
      expect(response.body.referrer).toHaveProperty('fullName');

      expect(response.body).toHaveProperty('manager');
      expect(response.body.manager).toHaveProperty('id', 4);
      expect(response.body.manager).toHaveProperty('fullName');

      console.log('Created booking response:', JSON.stringify(response.body, null, 2));
    });

    it('GET /bookings should return bookings with product and user relationships', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        const booking = response.body[0];
        
        // Should include product with owner
        expect(booking).toHaveProperty('product');
        if (booking.product) {
          expect(booking.product).toHaveProperty('name');
          expect(booking.product).toHaveProperty('owner');
          expect(booking.product.owner).toHaveProperty('fullName');
        }

        // Should include user relationships
        if (booking.seller) {
          expect(booking.seller).toHaveProperty('fullName');
          expect(booking.seller).toHaveProperty('email');
        }

        if (booking.referrer) {
          expect(booking.referrer).toHaveProperty('fullName');
          expect(booking.referrer).toHaveProperty('email');
        }

        if (booking.manager) {
          expect(booking.manager).toHaveProperty('fullName');
          expect(booking.manager).toHaveProperty('email');
        }

        console.log('Bookings list response (first booking):', JSON.stringify(booking, null, 2));
      }
    });

    it('GET /bookings/:id should return booking with full relationship details', async () => {
      if (!testBookingId) {
        throw new Error('Test booking not created');
      }

      const response = await request(app.getHttpServer())
        .get(`/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify all relationships are included
      expect(response.body).toHaveProperty('id', testBookingId);
      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('owner');
      
      expect(response.body).toHaveProperty('seller');
      expect(response.body).toHaveProperty('referrer');
      expect(response.body).toHaveProperty('manager');

      // Should include revenue ledger (even if empty for pending booking)
      expect(response.body).toHaveProperty('revenueLedger');
      expect(Array.isArray(response.body.revenueLedger)).toBe(true);

      console.log('Booking detail response:', JSON.stringify(response.body, null, 2));
    });
  });

  describe('Product Relationships', () => {
    it('GET /products should return products with owner information', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        const product = response.body[0];
        
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('owner');
        expect(product.owner).toHaveProperty('id');
        expect(product.owner).toHaveProperty('fullName');
        expect(product.owner).toHaveProperty('email');

        console.log('Product with owner:', JSON.stringify(product, null, 2));
      }
    });
  });
});
