'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearCart, getCart } from '../../lib/cart'

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const items = getCart()

  const total = useMemo(() => {
    return items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  }, [items])

  async function handleCreateOrder() {
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('accessToken')

      if (!token) {
        throw new Error('Debes iniciar sesión para continuar')
      }

      if (items.length === 0) {
        throw new Error('Tu carrito está vacío')
      }

      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            cantidad: item.cantidad,
          })),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error?.message || data?.message || 'No se pudo crear la orden')
      }

      const order = await response.json()

      clearCart()
      router.push(`/pago/${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la orden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-slate-600">Tu carrito está vacío.</p>

          <Link
            href="/productos"
            className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-white"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="h-24 w-24 overflow-hidden rounded-xl bg-slate-100">
                  {item.imagenUrl ? (
                    <img
                      src={item.imagenUrl}
                      alt={item.titulo}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="flex-1">
                  <h2 className="font-semibold">{item.titulo}</h2>
                  <p className="text-sm text-slate-500">{item.varianteNombre}</p>
                  <p className="mt-1 text-sm font-medium">
                    {item.moneda} {item.precio}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Cantidad: {item.cantidad}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold">Resumen</h2>

            <div className="mt-4 flex items-center justify-between">
              <span>Total</span>
              <span className="text-lg font-bold">USD {total.toFixed(2)}</span>
            </div>

            {error ? (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            ) : null}

            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-white disabled:opacity-60"
            >
              {loading ? 'Creando orden...' : 'Crear orden'}
            </button>
          </aside>
        </div>
      )}
    </main>
  )
}