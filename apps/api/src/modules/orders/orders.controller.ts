import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { RolUsuario } from '@prisma/client'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtGuard } from '../../common/guards/jwt.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from './dto/create-order.dto'

@Controller('orders')
@UseGuards(JwtGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.sub, dto)
  }

  @Get('me')
  listMine(@Req() req: any) {
    return this.ordersService.listMine(req.user.sub)
  }

  @Get('me/:id')
  getMineById(@Req() req: any, @Param('id') id: string) {
    return this.ordersService.getMineById(req.user.sub, id)
  }

  @Get('admin/all')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  listAllForAdmin() {
    return this.ordersService.listAllForAdmin()
  }

  @Get('admin/all/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  getByIdForAdmin(@Param('id') id: string) {
    return this.ordersService.getByIdForAdmin(id)
  }
}