import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto, UpdateProductStatusDto, ProductStatus } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
  };
}

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto, @Request() req: AuthenticatedRequest) {
    return this.productsService.create(createProductDto, req.user.id);
  }

  @Get()
  findAll(@Query('status') status?: ProductStatus, @Query('userId') userId?: string) {
    const userIdNum = userId ? parseInt(userId) : undefined;
    return this.productsService.findAll(status, userIdNum);
  }

  @Get('approved')
  getApprovedProducts() {
    return this.productsService.getApprovedProducts();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-products')
  getMyProducts(@Request() req: AuthenticatedRequest) {
    return this.productsService.getMyProducts(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.productsService.update(id, updateProductDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: AuthenticatedRequest) {
    return this.productsService.remove(id, req.user.id);
  }
}
