import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user with valid referral code', async () => {
      // Use existing referral code from seeded data
      const registerDto = {
        fullName: 'Test User',
        email: 'newtest@example.com',
        password: 'password123',
        referralCode: 'ADMIN01', // Use admin referral code from seed
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(registerDto.email);
      expect(response.body.fullName).toBe(registerDto.fullName);
      expect(response.body).toHaveProperty('referralCode');

      // Clean up
      await prisma.appUser.deleteMany({
        where: {
          email: 'newtest@example.com',
        },
      });
    });

    it('should fail to register without referral code', async () => {
      const registerDto = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409);
    });

    it('should fail to register with invalid referral code', async () => {
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

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', async () => {
      // Use existing admin user from seed data
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
    });

    it('should fail to login with invalid credentials', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });
  });
});
