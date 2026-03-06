import { IsString, MinLength } from 'class-validator'

export class CreateSellerDto {
  @IsString()
  @MinLength(3)
  nombreTienda!: string
}
