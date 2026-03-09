import { IsInt, IsOptional, IsString, NotEquals } from 'class-validator'

export class AdjustStockDto {
  @IsInt()
  @NotEquals(0)
  cantidad!: number

  @IsOptional()
  @IsString()
  motivo?: string
}