import { EstadoVendedor } from '@prisma/client'
import { IsEnum } from 'class-validator'

export class UpdateSellerStatusDto {
  @IsEnum(EstadoVendedor)
  estado!: EstadoVendedor
}
