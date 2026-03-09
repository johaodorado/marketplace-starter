import { IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator'

export class AddProductImageDto {
  @IsUrl()
  url!: string

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number
}