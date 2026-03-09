import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { RolUsuario } from '@prisma/client'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtGuard } from '../../common/guards/jwt.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  list() {
    return this.categoriesService.list()
  }

  @Get('slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.categoriesService.getBySlug(slug)
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.categoriesService.getById(id)
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto)
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto)
  }
}