import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { JwtGuard } from '../../common/guards/jwt.guard'
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
}