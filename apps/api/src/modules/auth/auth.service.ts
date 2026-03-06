import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { RolUsuario } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../prisma/prisma.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.usuario.findUnique({
      where: { email: dto.email }
    })

    if (existing) {
      throw new ConflictException('Ese correo ya está registrado')
    }

    const passwordHash = await bcrypt.hash(dto.password, 10)

    const user = await this.prisma.usuario.create({
      data: {
        email: dto.email,
        passwordHash,
        telefono: dto.telefono,
        nombre: dto.nombre,
        apellido: dto.apellido,
        rol: RolUsuario.COMPRADOR
      }
    })

    return this.buildAuthResponse(user.id, user.email, user.rol)
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { email: dto.email }
    })

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas')
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash)

    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas')
    }

    return this.buildAuthResponse(user.id, user.email, user.rol)
  }

  private buildAuthResponse(userId: string, email: string, rol: RolUsuario) {
    const payload = { sub: userId, email, rol }

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: userId,
        email,
        rol
      }
    }
  }
}
