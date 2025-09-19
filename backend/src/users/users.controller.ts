import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: AuthenticatedRequest) {
    return this.usersService.findOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/dashboard-stats')
  getDashboardStats(@Request() req: AuthenticatedRequest) {
    return this.usersService.getDashboardStats(req.user.id);
  }

  @UseGuards(JwtAuthGuard)


  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Get('validate-referral/:code')
  async validateReferralCode(@Param('code') code: string) {
    const isValid = await this.usersService.validateReferralCode(code);
    return { valid: isValid };
  }

  @Get('revenue')
  @UseGuards(JwtAuthGuard)
  getUserRevenue(@Request() req: AuthenticatedRequest) {
    return this.usersService.getUserRevenue(req.user.id);
  }

  @Get('wallet')
  @UseGuards(JwtAuthGuard)
  getWalletData(@Request() req: AuthenticatedRequest) {
    console.log('🔍 /users/wallet called for user:', req.user?.id);
    try {
      return this.usersService.getWalletData(req.user.id);
    } catch (error) {
      console.error('❌ Error in wallet controller:', error);
      throw error;
    }
  }

  @Get('wallet-test')
  @UseGuards(JwtAuthGuard)
  getWalletTest(@Request() req: AuthenticatedRequest) {
    console.log('🔍 /users/wallet-test called for user:', req.user?.id);
    return {
      message: 'Wallet test endpoint works',
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    };
  }

  @Get('wallet-test-public')
  getWalletTestPublic() {
    console.log('🔍 /users/wallet-test-public called (no auth)');
    return {
      message: 'Public wallet test endpoint works',
      timestamp: new Date().toISOString()
    };
  }

  // Downline Management Endpoints
  @UseGuards(JwtAuthGuard)
  @Get('me/downline')
  getMyDownline(@Request() req: AuthenticatedRequest) {
    return this.usersService.getMyDownline(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/downline/stats')
  getDownlineStats(@Request() req: AuthenticatedRequest) {
    return this.usersService.getDownlineStats(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/nickname')
  updateMyNickname(@Request() req: AuthenticatedRequest, @Body() body: { nickname: string }) {
    return this.usersService.updateUserNickname(req.user.id, body.nickname);
  }
}
