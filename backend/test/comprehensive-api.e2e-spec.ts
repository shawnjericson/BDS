import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Comprehensive API Tests (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Enable validation pipe like in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Enable CORS
    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    });

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    // Clean up test user if created
    if (testUserId) {
      await prisma.wallet.deleteMany({ where: { userId: testUserId } });
      await prisma.appUser.deleteMany({ where: { id: testUserId } });
    }
    await app.close();
  });

  describe('Health Check', () => {
    it('/ (GET) should return Hello World', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('Referral Code Validation', () => {
    it('/users/validate-referral/:code (GET) should validate existing referral code', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/validate-referral/ADMIN01')
        .expect(200);

      expect(response.body.valid).toBe(true);
    });

    it('/users/validate-referral/:code (GET) should reject invalid referral code', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/validate-referral/INVALID123')
        .expect(200);

      expect(response.body.valid).toBe(false);
    });
  });

  describe('Authentication', () => {
    it('/auth/login (POST) should login with valid credentials', async () => {
      const loginDto = {
        email: 'admin@example.com',
        password: '123456',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginDto.email);
      
      // Store token for later tests
      authToken = response.body.access_token;
    });

    it('/auth/login (POST) should fail with invalid credentials', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('/auth/register (POST) should register new user with valid referral code', async () => {
      const timestamp = Date.now();
      const registerDto = {
        fullName: 'Test User E2E',
        email: `teste2e${timestamp}@example.com`,
        password: 'password123',
        referralCode: 'ADMIN01',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user.email).toBe(registerDto.email);
      expect(response.body.user.fullName).toBe(registerDto.fullName);
      expect(response.body.user).toHaveProperty('referralCode');

      // Store test user ID for cleanup
      testUserId = response.body.user.id;
    });

    it('/auth/register (POST) should fail without referral code', async () => {
      const registerDto = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409); // Conflict - referral code required
    });

    it('/auth/register (POST) should fail with invalid referral code', async () => {
      const registerDto = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        referralCode: 'INVALID',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(404);
    });
  });

  describe('Protected Routes', () => {
    it('/users/me (GET) should return user profile with valid token', async () => {
      if (!authToken) {
        throw new Error('Auth token not available. Login test must pass first.');
      }

      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('fullName');
      expect(response.body).toHaveProperty('referralCode');
    });

    it('/users/me (GET) should fail without token', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });

    it('/users/me (GET) should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('CORS Configuration', () => {
    it('should handle OPTIONS requests', async () => {
      await request(app.getHttpServer())
        .options('/')
        .expect(204);
    });

    it('should include CORS headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});
