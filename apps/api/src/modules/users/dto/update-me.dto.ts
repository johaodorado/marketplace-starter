import { IsOptional, IsString } from 'class-validator'

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  nombre?: string

  @IsOptional()
  @IsString()
  apellido?: string

  @IsOptional()
  @IsString()
  telefono?: string
}
