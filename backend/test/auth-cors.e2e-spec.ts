import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication and CORS Tests (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

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

    await app.init();
  });

  afterAll(async () => {
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

  describe('CORS Configuration', () => {
    it('should handle OPTIONS requests', async () => {
      await request(app.getHttpServer())
        .options('/')
        .expect(204);
    });

    it('should include CORS headers in response', async () => {
      const response = await request(app.getHttpServer())
        .get('/')
        .set('Origin', 'http://localhost:3001')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should handle preflight requests', async () => {
      const response = await request(app.getHttpServer())
        .options('/auth/login')
        .set('Origin', 'http://localhost:3001')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type,Authorization')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
      expect(response.headers).toHaveProperty('access-control-allow-headers');
    });
  });

  describe('Referral Code Validation', () => {
    it('/users/validate-referral/:code (GET) should validate existing referral code', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/validate-referral/ADMIN01')
        .expect(200);

      expect(response.body).toHaveProperty('valid');
      expect(response.body.valid).toBe(true);
    });

    it('/users/validate-referral/:code (GET) should reject invalid referral code', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/validate-referral/INVALID123')
        .expect(200);

      expect(response.body).toHaveProperty('valid');
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
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('fullName');
      expect(response.body.user).toHaveProperty('referralCode');
      
      // Store token for later tests
      authToken = response.body.access_token;
    });

    it('/auth/login (POST) should fail with invalid email', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: '123456',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('/auth/login (POST) should fail with invalid password', async () => {
      const loginDto = {
        email: 'admin@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('/auth/login (POST) should validate input format', async () => {
      const loginDto = {
        email: 'invalid-email',
        password: '123',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(400); // Validation error
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
      expect(response.body).toHaveProperty('status');
      expect(response.body.email).toBe('admin@example.com');
    });

    it('/users/me (GET) should fail without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('/users/me (GET) should fail with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('/users/me (GET) should fail with malformed authorization header', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'invalid-format')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Registration Validation', () => {
    it('/auth/register (POST) should fail without referral code', async () => {
      const registerDto = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409); // Conflict - referral code required

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Referral code is required for registration');
    });

    it('/auth/register (POST) should fail with invalid referral code', async () => {
      const registerDto = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        referralCode: 'INVALID',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid referral code');
    });

    it('/auth/register (POST) should validate input format', async () => {
      const registerDto = {
        fullName: 'A', // Too short
        email: 'invalid-email',
        password: '123', // Too short
        referralCode: 'ADMIN01',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400); // Validation error
    });
  });
});
