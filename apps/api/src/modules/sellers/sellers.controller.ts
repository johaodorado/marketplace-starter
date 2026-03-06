import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common'
import { RolUsuario } from '@prisma/client'
import { CurrentUser, JwtUser } from '../../common/decorators/user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtGuard } from '../../common/guards/jwt.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CreateSellerDto } from './dto/create-seller.dto'
import { UpdateSellerStatusDto } from './dto/update-seller-status.dto'
import { SellersService } from './sellers.service'

@Controller('sellers')
@UseGuards(JwtGuard, RolesGuard)
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post('apply')
  apply(@CurrentUser() user: JwtUser, @Body() dto: CreateSellerDto) {
    return this.sellersService.apply(user.sub, dto)
  }

  @Get('me')
  getMine(@CurrentUser() user: JwtUser) {
    return this.sellersService.getMine(user.sub)
  }

  @Get()
  @Roles(RolUsuario.ADMIN, RolUsuario.SOPORTE)
  list() {
    return this.sellersService.list()
  }

  @Patch(':id/status')
  @Roles(RolUsuario.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateSellerStatusDto) {
    return this.sellersService.updateStatus(id, dto)
  }
}
