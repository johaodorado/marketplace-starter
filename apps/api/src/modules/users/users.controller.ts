import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common'
import { RolUsuario } from '@prisma/client'
import { CurrentUser, JwtUser } from '../../common/decorators/user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtGuard } from '../../common/guards/jwt.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { UpdateMeDto } from './dto/update-me.dto'
import { UsersService } from './users.service'

@Controller('users')
@UseGuards(JwtGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: JwtUser) {
    return this.usersService.getMe(user.sub)
  }

  @Patch('me')
  updateMe(@CurrentUser() user: JwtUser, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(user.sub, dto)
  }

  @Get()
  @Roles(RolUsuario.ADMIN)
  listUsers() {
    return this.usersService.listUsers()
  }
}
