'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type Comprador = {
  id: string
  email: string
  nombre: string | null
  apellido: string | null
  telefono?: string | null
}

type OrdenItem = {
  id: string
  cantidad: number
  tituloSnapshot: string
  skuSnapshot: string | null
  precioUnitarioSnapshot: number
  monedaSnapshot: string
}

type Reserva = {
  id: string
  cantidad: number
  varianteId: string
  ordenId: string
  creadoEn: string
  liberadoEn: string | null
}

type Pago = {
  id: string
  estado: string
  monto: number
  moneda: string
  externalMeta?: {
    referencia?: string | null
    observacion?: string | null
    reportadoEn?: string | null
    metodo?: string | null
    revision?: {
      estado?: string | null
      observacion?: string | null
      revisadoEn?: string | null
    }
  } | null
}

type Orden = {
  id: string
  estado: string
  subtotal: number
  comision: number
  total: number
  moneda: string
  creadoEn: string
  comprador: Comprador
  items: OrdenItem[]
  reservas: Reserva[]
  pago: Pago | null
}

export default function AdminOrdenDetallePage() {
  const params = useParams<{ id: string }>()
  const orderId = params?.id

  const [order, setOrder] = useState<Orden | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true)
        setError('')

        const token = localStorage.getItem('accessToken')

        if (!token) {
          throw new Error('Debes iniciar sesión')
        }

        const response = await fetch(
          `http://localhost:3000/api/orders/admin/all/${orderId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error?.message || data?.message || 'No se pudo cargar la orden')
        }

        const data = await response.json()
        setOrder(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando la orden')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="mb-6 text-3xl font-bold">Detalle de orden admin</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p>Cargando orden...</p>
        </div>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="mb-6 text-3xl font-bold">Detalle de orden admin</h1>
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-red-600">
          <p>{error || 'No se encontró la orden'}</p>
        </div>
      </main>
    )
  }

  const referencia = order.pago?.externalMeta?.referencia
  const observacion = order.pago?.externalMeta?.observacion
  const reportadoEn = order.pago?.externalMeta?.reportadoEn
  const metodo = order.pago?.externalMeta?.metodo
  const revision = order.pago?.externalMeta?.revision

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Detalle de orden admin</h1>
          <p className="mt-1 text-sm text-slate-500">{order.id}</p>
        </div>

        <Link
          href="/admin/ordenes"
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
        >
          Volver a órdenes
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Resumen</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Estado de la orden</p>
                <p className="font-medium">{order.estado}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Estado del pago</p>
                <p className="font-medium">{order.pago?.estado ?? 'SIN_PAGO'}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Fecha</p>
                <p className="font-medium">
                  {new Date(order.creadoEn).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Total</p>
                <p className="font-medium">
                  {order.moneda} {Number(order.total).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Comprador</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Nombre</p>
                <p className="font-medium">
                  {order.comprador.nombre ?? ''} {order.comprador.apellido ?? ''}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Correo</p>
                <p className="font-medium">{order.comprador.email}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Teléfono</p>
                <p className="font-medium">{order.comprador.telefono ?? 'No registrado'}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">ID comprador</p>
                <p className="font-medium">{order.comprador.id}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Productos</h2>

            <div className="mt-4 space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-slate-50 px-4 py-4"
                >
                  <p className="font-medium">{item.tituloSnapshot}</p>

                  <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                    <p>Cantidad: {item.cantidad}</p>
                    <p>SKU: {item.skuSnapshot ?? 'N/A'}</p>
                    <p>
                      Precio: {item.monedaSnapshot} {Number(item.precioUnitarioSnapshot).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Pago reportado</h2>

            {order.pago ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Referencia</p>
                  <p className="font-medium">{referencia || 'No registrada'}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Método</p>
                  <p className="font-medium">{metodo || 'No registrado'}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Observación cliente</p>
                  <p className="font-medium">{observacion || 'Sin observación'}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Reportado en</p>
                  <p className="font-medium">
                    {reportadoEn ? new Date(reportadoEn).toLocaleString() : 'No reportado'}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-sm text-slate-500">Revisión admin</p>
                  <p className="font-medium">
                    {revision?.estado || 'Pendiente de revisión'}
                  </p>

                  {revision?.observacion ? (
                    <p className="mt-2 text-sm text-slate-600">
                      {revision.observacion}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-slate-600">Todavía no existe un pago asociado.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Reservas</h2>

            {order.reservas.length > 0 ? (
              <div className="mt-4 space-y-3">
                {order.reservas.map((reserva) => (
                  <div
                    key={reserva.id}
                    className="rounded-xl bg-slate-50 px-4 py-4 text-sm"
                  >
                    <p className="font-medium">Reserva {reserva.id}</p>
                    <p className="text-slate-600">Variante: {reserva.varianteId}</p>
                    <p className="text-slate-600">Cantidad: {reserva.cantidad}</p>
                    <p className="text-slate-600">
                      Creada: {new Date(reserva.creadoEn).toLocaleString()}
                    </p>
                    <p className="text-slate-600">
                      Liberada: {reserva.liberadoEn ? new Date(reserva.liberadoEn).toLocaleString() : 'No'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-slate-600">No hay reservas registradas.</p>
            )}
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Totales</h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>
                {order.moneda} {Number(order.subtotal).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Comisión</span>
              <span>
                {order.moneda} {Number(order.comision).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-base font-bold">
              <span>Total</span>
              <span>
                {order.moneda} {Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>

          <Link
            href="/admin/pagos"
            className="mt-6 block rounded-xl bg-slate-900 px-4 py-3 text-center text-white"
          >
            Ir a pagos admin
          </Link>
        </aside>
      </div>
    </main>
  )
}