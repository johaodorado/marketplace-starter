import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  titulo!: string

  @IsString()
  @MinLength(10)
  descripcion!: string

  @IsOptional()
  @IsString()
  categoriaId?: string

  @IsNumber()
  precioBase!: number

  @IsOptional()
  @IsString()
  moneda?: string
}