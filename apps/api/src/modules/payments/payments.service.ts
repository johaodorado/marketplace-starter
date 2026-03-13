import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { EstadoOrden, EstadoPago } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getManualPaymentInfo(buyerUserId: string, orderId: string) {
    const order = await this.prisma.orden.findFirst({
      where: {
        id: orderId,
        compradorId: buyerUserId,
      },
      include: {
        pago: true,
      },
    })

    if (!order) {
      throw new NotFoundException('Orden no encontrada')
    }

    let pago = order.pago

    if (!pago) {
      pago = await this.prisma.pago.create({
        data: {
          ordenId: order.id,
          estado: EstadoPago.PENDIENTE,
          monto: order.total,
          moneda: order.moneda,
        },
      })
    }

    return {
      orderId: order.id,
      pagoId: pago.id,
      estadoOrden: order.estado,
      estadoPago: pago.estado,
      monto: order.total,
      moneda: order.moneda,
      banco: 'Banco Pichincha',
      tipoCuenta: 'Ahorros',
      numeroCuenta: '1234567890',
      titular: 'Tu Empresa o Tu Nombre',
      identificacion: '0999999999001',
      instrucciones:
        'Realiza la transferencia o deposito y luego reporta tu pago en esta orden.',
    }
  }

  async reportManualPayment(
    buyerUserId: string,
    orderId: string,
    payload: {
      referencia?: string
      observacion?: string
    },
  ) {
    const order = await this.prisma.orden.findFirst({
      where: {
        id: orderId,
        compradorId: buyerUserId,
      },
      include: {
        pago: true,
      },
    })

    if (!order) {
      throw new NotFoundException('Orden no encontrada')
    }

    if (order.estado !== EstadoOrden.CREADA) {
      throw new BadRequestException('La orden ya no acepta reporte de pago')
    }

    let pago = order.pago

    const meta = {
      referencia: payload.referencia ?? null,
      observacion: payload.observacion ?? null,
      reportadoEn: new Date().toISOString(),
      metodo: 'TRANSFERENCIA',
    }

    if (!pago) {
      pago = await this.prisma.pago.create({
        data: {
          ordenId: order.id,
          estado: EstadoPago.PENDIENTE,
          monto: order.total,
          moneda: order.moneda,
          externalMeta: meta,
        },
      })
    } else {
      pago = await this.prisma.pago.update({
        where: {
          id: pago.id,
        },
        data: {
          estado: EstadoPago.PENDIENTE,
          externalMeta: meta,
        },
      })
    }

    return {
      ok: true,
      message: 'Pago reportado correctamente. Queda pendiente de revision.',
      orderId: order.id,
      pagoId: pago.id,
      estadoPago: pago.estado,
    }
  }

  async getMyPayment(buyerUserId: string, orderId: string) {
    const order = await this.prisma.orden.findFirst({
      where: {
        id: orderId,
        compradorId: buyerUserId,
      },
      include: {
        pago: true,
      },
    })

    if (!order) {
      throw new NotFoundException('Orden no encontrada')
    }

    return order.pago
  }

  async listReportedPayments() {
    const pagos = await this.prisma.pago.findMany({
      where: {
        estado: EstadoPago.PENDIENTE,
      },
      orderBy: {
        creadoEn: 'desc',
      },
      include: {
        orden: {
          include: {
            comprador: true,
            items: true,
          },
        },
      },
    })

    return pagos.filter((pago) => {
      const meta = pago.externalMeta as Record<string, unknown> | null
      return Boolean(meta?.reportadoEn)
    })
  }

  async approvePayment(paymentId: string, observacion?: string) {
    const pago = await this.prisma.pago.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        orden: true,
      },
    })

    if (!pago) {
      throw new NotFoundException('Pago no encontrado')
    }

    const metaActual = (pago.externalMeta as Record<string, unknown> | null) ?? {}

    return this.prisma.$transaction(async (tx) => {
      const updatedPago = await tx.pago.update({
        where: {
          id: paymentId,
        },
        data: {
          estado: EstadoPago.APROBADO,
          externalMeta: {
            ...metaActual,
            revision: {
              estado: 'APROBADO',
              observacion: observacion ?? null,
              revisadoEn: new Date().toISOString(),
            },
          },
        },
      })

      await tx.orden.update({
        where: {
          id: pago.ordenId,
        },
        data: {
          estado: EstadoOrden.PAGADA,
        },
      })

      return updatedPago
    })
  }

  async rejectPayment(paymentId: string, observacion?: string) {
    const pago = await this.prisma.pago.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        orden: true,
      },
    })

    if (!pago) {
      throw new NotFoundException('Pago no encontrado')
    }

    const metaActual = (pago.externalMeta as Record<string, unknown> | null) ?? {}

    return this.prisma.$transaction(async (tx) => {
      const updatedPago = await tx.pago.update({
        where: {
          id: paymentId,
        },
        data: {
          estado: EstadoPago.RECHAZADO,
          externalMeta: {
            ...metaActual,
            revision: {
              estado: 'RECHAZADO',
              observacion: observacion ?? null,
              revisadoEn: new Date().toISOString(),
            },
          },
        },
      })

      await tx.orden.update({
        where: {
          id: pago.ordenId,
        },
        data: {
          estado: EstadoOrden.CREADA,
        },
      })

      return updatedPago
    })
  }
}