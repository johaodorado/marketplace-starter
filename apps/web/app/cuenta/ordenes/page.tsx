'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type OrdenItem = {
  id: string
  cantidad: number
  tituloSnapshot: string
  precioUnitarioSnapshot: number
  monedaSnapshot: string
}

type OrdenPago = {
  id: string
  estado: string
}

type Orden = {
  id: string
  estado: string
  total: number
  moneda: string
  creadoEn: string
  items: OrdenItem[]
  pago: OrdenPago | null
}

export default function MisOrdenesPage() {
  const [orders, setOrders] = useState<Orden[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true)
        setError('')

        const token = localStorage.getItem('accessToken')

        if (!token) {
          throw new Error('Debes iniciar sesión para ver tus órdenes')
        }

        const response = await fetch('http://localhost:3000/api/orders/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error?.message || data?.message || 'No se pudieron cargar tus órdenes')
        }

        const data = await response.json()
        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando órdenes')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold">Mis órdenes</h1>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p>Cargando órdenes...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-red-600">
          <p>{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-slate-600">Aún no tienes órdenes.</p>

          <Link
            href="/productos"
            className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-white"
          >
            Ir a productos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Orden</p>
                  <h2 className="font-semibold">{order.id}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Fecha: {new Date(order.creadoEn).toLocaleString()}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm text-slate-500">Estado</p>
                  <p className="font-medium">{order.estado}</p>
                  <p className="mt-1 text-lg font-bold">
                    {order.moneda} {Number(order.total).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-slate-50 px-4 py-3 text-sm"
                  >
                    <p className="font-medium">{item.tituloSnapshot}</p>
                    <p className="text-slate-500">
                      Cantidad: {item.cantidad}
                    </p>
                    <p className="text-slate-500">
                      Precio: {item.monedaSnapshot} {Number(item.precioUnitarioSnapshot).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/cuenta/ordenes/${order.id}`}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
                >
                  Ver detalle
                </Link>

                {order.estado === 'CREADA' ? (
                  <Link
                    href={`/pago/${order.id}`}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
                  >
                    Ir a pagar
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}