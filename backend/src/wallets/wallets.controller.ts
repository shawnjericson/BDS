import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletTransactionDto, TransactionType } from './dto/create-wallet-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
  };
}

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('me/summary')
  getMyWalletSummary(@Request() req: AuthenticatedRequest) {
    return this.walletsService.getWalletSummary(req.user.id);
  }

  @Get('me/transactions')
  getMyTransactions(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.walletsService.getWalletTransactions(req.user.id, pageNum, limitNum);
  }

  @Get('me/transactions/type/:type')
  getMyTransactionsByType(
    @Request() req: AuthenticatedRequest,
    @Param('type') type: TransactionType,
  ) {
    return this.walletsService.getTransactionsByType(req.user.id, type);
  }

  @Get(':id')
  getWallet(@Param('id', ParseIntPipe) id: number) {
    return this.walletsService.getWalletById(id);
  }
}
