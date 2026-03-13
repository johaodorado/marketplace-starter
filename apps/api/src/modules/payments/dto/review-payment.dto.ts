import { IsOptional, IsString, MinLength } from 'class-validator'

export class ReviewPaymentDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  observacion?: string
}