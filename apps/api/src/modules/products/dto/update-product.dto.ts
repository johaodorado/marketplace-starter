import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  titulo?: string

  @IsOptional()
  @IsString()
  @MinLength(10)
  descripcion?: string

  @IsOptional()
  @IsString()
  categoriaId?: string

  @IsOptional()
  @IsNumber()
  precioBase?: number

  @IsOptional()
  @IsString()
  moneda?: string
}