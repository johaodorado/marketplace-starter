import { IsOptional, IsString, MinLength } from 'class-validator'

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  nombre!: string

  @IsOptional()
  @IsString()
  slug?: string
}