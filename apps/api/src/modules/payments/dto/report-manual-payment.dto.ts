import { IsOptional, IsString, MinLength } from 'class-validator'

export class ReportManualPaymentDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  referencia?: string

  @IsOptional()
  @IsString()
  @MinLength(3)
  observacion?: string
}