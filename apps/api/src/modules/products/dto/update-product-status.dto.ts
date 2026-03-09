import { EstadoProducto } from '@prisma/client'
import { IsEnum } from 'class-validator'

export class UpdateProductStatusDto {
  @IsEnum(EstadoProducto)
  estado!: EstadoProducto
}