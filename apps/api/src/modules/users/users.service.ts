import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { UpdateMeDto } from './dto/update-me.dto'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        vendedor: true
      }
    })

    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    const { passwordHash, ...safeUser } = user
    return safeUser
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.prisma.usuario.update({
      where: { id: userId },
      data: dto
    })

    const { passwordHash, ...safeUser } = user
    return safeUser
  }

  async listUsers() {
    const users = await this.prisma.usuario.findMany({
      orderBy: {
        creadoEn: 'desc'
      },
      include: {
        vendedor: true
      }
    })

    return users.map(({ passwordHash, ...user }) => user)
  }
}
