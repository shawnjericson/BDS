import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../users/dto/login.dto';
import { RegisterDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.register(registerDto);
    
    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
    };

    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
    };

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        referralCode: user.referralCode,
        status: user.status,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(payload: any) {
    console.log('🔍 JWT payload:', payload);
    console.log('🔍 payload.sub:', payload.sub, typeof payload.sub);

    if (!payload.sub) {
      console.error('❌ payload.sub is missing');
      return null;
    }

    return this.usersService.findById(payload.sub);
  }
}
