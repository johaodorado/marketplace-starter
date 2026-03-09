import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { JwtGuard } from '../../common/guards/jwt.guard'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { UpdateProductStatusDto } from './dto/update-product-status.dto'
import { AddProductImageDto } from './dto/add-product-image.dto'
import { CreateProductVariantDto } from './dto/create-product-variant.dto'
import { UpdateProductVariantDto } from './dto/update-product-variant.dto'
import { AdjustStockDto } from './dto/adjust-stock.dto'

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('products')
  listPublic() {
    return this.productsService.listPublic()
  }

  @Get('products/:id')
  getPublicById(@Param('id') id: string) {
    return this.productsService.getPublicById(id)
  }

  @Get('seller/products')
  @UseGuards(JwtGuard)
  listSellerProducts(@Req() req: any) {
    return this.productsService.listSellerProducts(req.user.sub)
  }

  @Get('seller/products/:id')
  @UseGuards(JwtGuard)
  getSellerProductById(@Req() req: any, @Param('id') id: string) {
    return this.productsService.getSellerProductById(req.user.sub, id)
  }

  @Post('seller/products')
  @UseGuards(JwtGuard)
  create(@Req() req: any, @Body() dto: CreateProductDto) {
    return this.productsService.create(req.user.sub, dto)
  }

  @Patch('seller/products/:id')
  @UseGuards(JwtGuard)
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(req.user.sub, id, dto)
  }
@Patch('seller/products/:id/status')
@UseGuards(JwtGuard)
updateStatus(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProductStatusDto) {
  return this.productsService.updateStatus(req.user.sub, id, dto)
}

@Post('seller/products/:id/images')
@UseGuards(JwtGuard)
addImage(@Req() req: any, @Param('id') id: string, @Body() dto: AddProductImageDto) {
  return this.productsService.addImage(req.user.sub, id, dto)
}

@Delete('seller/products/:id/images/:imageId')
@UseGuards(JwtGuard)
deleteImage(@Req() req: any, @Param('id') id: string, @Param('imageId') imageId: string) {
  return this.productsService.deleteImage(req.user.sub, id, imageId)
}

@Post('seller/products/:id/variants')
@UseGuards(JwtGuard)
addVariant(@Req() req: any, @Param('id') id: string, @Body() dto: CreateProductVariantDto) {
  return this.productsService.addVariant(req.user.sub, id, dto)
}

@Patch('seller/products/:id/variants/:variantId')
@UseGuards(JwtGuard)
updateVariant(
  @Req() req: any,
  @Param('id') id: string,
  @Param('variantId') variantId: string,
  @Body() dto: UpdateProductVariantDto
) {
  return this.productsService.updateVariant(req.user.sub, id, variantId, dto)
}
@Post('seller/products/:id/variants/:variantId/stock')
@UseGuards(JwtGuard)
adjustStock(
  @Req() req: any,
  @Param('id') id: string,
  @Param('variantId') variantId: string,
  @Body() dto: AdjustStockDto
) {
  return this.productsService.adjustStock(req.user.sub, id, variantId, dto)
}

@Get('seller/products/:id/variants/:variantId/movements')
@UseGuards(JwtGuard)
listStockMovements(
  @Req() req: any,
  @Param('id') id: string,
  @Param('variantId') variantId: string
) {
  return this.productsService.listStockMovements(req.user.sub, id, variantId)
}

}