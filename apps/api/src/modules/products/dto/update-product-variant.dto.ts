import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator'

export class UpdateProductVariantDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string

  @IsOptional()
  @IsString()
  sku?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  precio?: number
}