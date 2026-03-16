'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type Comprador = {
  id: string
  email: string
  nombre: string | null
  apellido: string | null
}

type OrdenItem = {
  id: string
  tituloSnapshot: string
  cantidad: number
  precioUnitarioSnapshot: number
  monedaSnapshot: string
}

type Pago = {
  id: string
  estado: string
}

type Orden = {
  id: string
  estado: string
  total: number
  moneda: string
  creadoEn: string
  comprador: Comprador
  items: OrdenItem[]
  pago: Pago | null
}

export default function AdminOrdenesPage() {
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
          throw new Error('Debes iniciar sesión')
        }

        const response = await fetch('http://localhost:3000/api/orders/admin/all', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error?.message || data?.message || 'No se pudieron cargar las órdenes')
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
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold">Órdenes de la tienda</h1>

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
          <p className="text-slate-600">No hay órdenes registradas.</p>
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
                  <p className="text-sm text-slate-500">Estado de la orden</p>
                  <p className="font-medium">{order.estado}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Pago: {order.pago?.estado ?? 'SIN_PAGO'}
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {order.moneda} {Number(order.total).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Comprador</p>
                  <p className="font-medium">
                    {order.comprador.nombre ?? ''} {order.comprador.apellido ?? ''}
                  </p>
                  <p className="text-sm text-slate-500">{order.comprador.email}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Items</p>
                  <p className="font-medium">{order.items.length}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-slate-50 px-4 py-3 text-sm"
                  >
                    <p className="font-medium">{item.tituloSnapshot}</p>
                    <p className="text-slate-500">Cantidad: {item.cantidad}</p>
                    <p className="text-slate-500">
                      Precio: {item.monedaSnapshot} {Number(item.precioUnitarioSnapshot).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <Link
                  href={`/admin/ordenes/${order.id}`}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
                >
                  Ver detalle
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}