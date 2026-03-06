import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { EstadoVendedor, RolUsuario } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateSellerDto } from './dto/create-seller.dto'
import { UpdateSellerStatusDto } from './dto/update-seller-status.dto'

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string, dto: CreateSellerDto) {
    const existing = await this.prisma.vendedor.findUnique({
      where: { usuarioId: userId }
    })

    if (existing) {
      throw new ConflictException('Ya existe una solicitud de vendedor para este usuario')
    }

    return this.prisma.vendedor.create({
      data: {
        usuarioId: userId,
        nombreTienda: dto.nombreTienda,
        estado: EstadoVendedor.PENDIENTE
      }
    })
  }

  async getMine(userId: string) {
    const seller = await this.prisma.vendedor.findUnique({
      where: { usuarioId: userId },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            telefono: true,
            rol: true
          }
        }
      }
    })

    if (!seller) {
      throw new NotFoundException('Perfil de vendedor no encontrado')
    }

    return seller
  }

  async list() {
    return this.prisma.vendedor.findMany({
      orderBy: {
        creadoEn: 'desc'
      },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            telefono: true,
            rol: true
          }
        }
      }
    })
  }

  async updateStatus(sellerId: string, dto: UpdateSellerStatusDto) {
    const seller = await this.prisma.vendedor.findUnique({
      where: { id: sellerId }
    })

    if (!seller) {
      throw new NotFoundException('Vendedor no encontrado')
    }

    const userRole =
      dto.estado === EstadoVendedor.APROBADO ? RolUsuario.VENDEDOR : RolUsuario.COMPRADOR

    const [, updatedSeller] = await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id: seller.usuarioId },
        data: {
          rol: userRole
        }
      }),
      this.prisma.vendedor.update({
        where: { id: sellerId },
        data: {
          estado: dto.estado
        }
      })
    ])

    return updatedSeller
  }
}
