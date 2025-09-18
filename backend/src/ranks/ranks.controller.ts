import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { RanksService } from './ranks.service';
import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';
import { UpdateRankSharesDto, AssignUserRankDto } from './dto/rank-share.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin/ranks')
@UseGuards(JwtAuthGuard)
export class RanksController {
  constructor(private readonly ranksService: RanksService) {}

  @Post()
  create(@Body() createRankDto: CreateRankDto) {
    return this.ranksService.create(createRankDto);
  }

  @Get()
  findAll() {
    return this.ranksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ranksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRankDto: UpdateRankDto) {
    return this.ranksService.update(id, updateRankDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ranksService.remove(id);
  }

  @Get(':id/shares')
  getRankShares(@Param('id', ParseIntPipe) id: number) {
    return this.ranksService.getRankShares(id);
  }

  @Patch(':id/shares')
  updateRankShares(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRankSharesDto
  ) {
    console.log('updateRankShares received:', { id, body });
    return this.ranksService.updateRankShares(id, body.shares);
  }
}

@Controller('admin/users/:userId/ranks')
@UseGuards(JwtAuthGuard)
export class UserRanksController {
  constructor(private readonly ranksService: RanksService) {}

  @Get()
  getUserRanks(@Param('userId', ParseIntPipe) userId: number) {
    return this.ranksService.getUserRanks(userId);
  }

  @Post()
  assignUserRank(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: AssignUserRankDto
  ) {
    return this.ranksService.assignUserRank(userId, body.rankId);
  }

  @Delete(':rankId')
  removeUserRank(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('rankId', ParseIntPipe) rankId: number
  ) {
    return this.ranksService.removeUserRank(userId, rankId);
  }
}
