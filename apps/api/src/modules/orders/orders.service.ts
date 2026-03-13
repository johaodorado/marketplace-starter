import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  EstadoProducto,
  EstadoOrden,
  Prisma,
  TipoMovimientoInventario,
} from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateOrderDto } from './dto/create-order.dto'

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(buyerUserId: string, dto: CreateOrderDto) {
    if (!dto.items.length) {
      throw new BadRequestException('La orden debe tener al menos un item')
    }

    const variantIds = dto.items.map((item) => item.variantId)
    const productIds = dto.items.map((item) => item.productId)

    const variants = await this.prisma.varianteProducto.findMany({
      where: {
        id: { in: variantIds },
      },
      include: {
        producto: true,
      },
    })

    if (variants.length !== variantIds.length) {
      throw new NotFoundException('Una o más variantes no existen')
    }

    const variantMap = new Map(variants.map((variant) => [variant.id, variant]))

    const reserves = await this.prisma.reservaStock.findMany({
  where: {
    varianteId: { in: variantIds },
    liberadoEn: null,
  },
})

    const reservedByVariant = new Map<string, number>()

    for (const reserve of reserves) {
  const current = reservedByVariant.get(reserve.varianteId) ?? 0
  reservedByVariant.set(reserve.varianteId, current + reserve.cantidad)
}

    const sellerIds = new Set<string>()
    const currencies = new Set<string>()

    let subtotal = new Prisma.Decimal(0)

    const normalizedItems = dto.items.map((item) => {
      const variant = variantMap.get(item.variantId)

      if (!variant) {
        throw new NotFoundException(`Variante no encontrada: ${item.variantId}`)
      }

      if (variant.productoId !== item.productId) {
        throw new BadRequestException('La variante no pertenece al producto enviado')
      }

      if (variant.producto.estado !== EstadoProducto.ACTIVO) {
        throw new BadRequestException('Solo puedes comprar productos activos')
      }

      sellerIds.add(variant.producto.vendedorId)
      currencies.add(variant.producto.moneda)

      const reserved = reservedByVariant.get(variant.id) ?? 0
      const available = variant.stock - reserved

      if (item.cantidad > available) {
        throw new ForbiddenException(
          `Stock insuficiente para la variante ${variant.nombre}`,
        )
      }

      const unitPrice = variant.precio ?? variant.producto.precioBase
      const lineTotal = unitPrice.mul(item.cantidad)
      subtotal = subtotal.plus(lineTotal)

      return {
        productId: item.productId,
        variantId: item.variantId,
        cantidad: item.cantidad,
        tituloSnapshot: variant.producto.titulo,
        skuSnapshot: variant.sku,
        precioUnitarioSnapshot: unitPrice,
        monedaSnapshot: variant.producto.moneda,
        sellerId: variant.producto.vendedorId,
      }
    })

    if (sellerIds.size !== 1) {
      throw new BadRequestException('La orden solo puede contener items de un vendedor')
    }

    if (currencies.size !== 1) {
      throw new BadRequestException('La orden solo puede contener una moneda')
    }

    const sellerId = normalizedItems[0].sellerId
    const currency = normalizedItems[0].monedaSnapshot
    const comision = new Prisma.Decimal(0)
    const total = subtotal.plus(comision)

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.orden.create({
        data: {
          compradorId: buyerUserId,
          vendedorId: sellerId,
          estado: EstadoOrden.CREADA,
          subtotal,
          comision,
          total,
          moneda: currency,
        },
      })

      for (const item of normalizedItems) {
        await tx.itemOrden.create({
          data: {
            ordenId: order.id,
            productoId: item.productId,
            varianteId: item.variantId,
            cantidad: item.cantidad,
            tituloSnapshot: item.tituloSnapshot,
            skuSnapshot: item.skuSnapshot,
            precioUnitarioSnapshot: item.precioUnitarioSnapshot,
            monedaSnapshot: item.monedaSnapshot,
          },
        })

        await tx.reservaStock.create({
          data: {
            ordenId: order.id,
            varianteId: item.variantId,
            cantidad: item.cantidad,
          },
        })

        await tx.inventarioMovimiento.create({
          data: {
            varianteId: item.variantId,
            tipo: TipoMovimientoInventario.RESERVA,
            cantidad: item.cantidad,
            motivo: `Reserva por orden ${order.id}`,
          },
        })
      }

      return tx.orden.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              producto: true,
              variante: true,
            },
          },
          reservas: true,
        },
      })
    })
  }

  async listMine(buyerUserId: string) {
    return this.prisma.orden.findMany({
      where: {
        compradorId: buyerUserId,
      },
      orderBy: {
        creadoEn: 'desc',
      },
      include: {
        items: {
          include: {
            producto: true,
            variante: true,
          },
        },
        pago: true,
      },
    })
  }

  async getMineById(buyerUserId: string, orderId: string) {
    const order = await this.prisma.orden.findFirst({
      where: {
        id: orderId,
        compradorId: buyerUserId,
      },
      include: {
        items: {
          include: {
            producto: true,
            variante: true,
          },
        },
        pago: true,
        reservas: true,
      },
    })

    if (!order) {
      throw new NotFoundException('Orden no encontrada')
    }

    return order
  }
}