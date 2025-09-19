import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
  };
}

@Controller('admin/downline')
export class DownlineController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyDownline(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    
    const downlineUsers = await this.prisma.appUser.findMany({
      where: {
        referredBy: userId,
      },
      include: {
        userRanks: {
          where: { effectiveTo: null },
          include: {
            rank: true,
          },
        },
        referrals: {
          select: {
            id: true,
            status: true,
          },
        },
        sellerBookings: {
          select: {
            id: true,
            price: true,
            createdAt: true,
          },
        },
        revenueLedger: {
          select: {
            amount: true,
            createdAt: true,
          },
        },
      },
    });

    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    return downlineUsers.map(user => {
      const totalRevenue = user.revenueLedger.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
      const monthlyRevenue = user.revenueLedger
        .filter(entry => entry.createdAt && new Date(entry.createdAt) >= currentMonth)
        .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

      const totalBookings = user.sellerBookings.length;
      const monthlyBookings = user.sellerBookings
        .filter(booking => new Date(booking.createdAt) >= currentMonth)
        .length;

      const totalReferrals = user.referrals.length;
      const activeReferrals = user.referrals.filter(ref => ref.status === 'ACTIVE').length;

      return {
        id: user.id,
        fullName: user.fullName,
        nickname: user.fullName.split(' ')[0],
        email: user.email || undefined,
        referralCode: user.referralCode || undefined,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        totalRevenue,
        totalBookings,
        monthlyRevenue,
        monthlyBookings,
        currentRank: user.userRanks[0]?.rank ? {
          id: user.userRanks[0].rank.id,
          name: user.userRanks[0].rank.name,
        } : undefined,
        totalReferrals,
        activeReferrals,
      };
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getDownlineStats(@Request() req: AuthenticatedRequest) {
    const downline = await this.getMyDownline(req);
    
    const totalMembers = downline.length;
    const activeMembers = downline.filter(user => user.status === 'ACTIVE').length;
    const totalRevenue = downline.reduce((sum, user) => sum + user.totalRevenue, 0);
    const monthlyRevenue = downline.reduce((sum, user) => sum + user.monthlyRevenue, 0);
    const totalBookings = downline.reduce((sum, user) => sum + user.totalBookings, 0);
    const monthlyBookings = downline.reduce((sum, user) => sum + user.monthlyBookings, 0);
    
    const topPerformers = downline
      .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
      .slice(0, 5);

    return {
      totalMembers,
      activeMembers,
      totalRevenue,
      monthlyRevenue,
      totalBookings,
      monthlyBookings,
      topPerformers,
    };
  }
}
