import { IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string

  @IsOptional()
  @IsString()
  slug?: string
}