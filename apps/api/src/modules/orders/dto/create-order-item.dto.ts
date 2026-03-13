import { IsInt, IsUUID, Min } from 'class-validator'

export class CreateOrderItemDto {
  @IsUUID()
  productId!: string

  @IsUUID()
  variantId!: string

  @IsInt()
  @Min(1)
  cantidad!: number
}