'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  CartItem,
  getCart,
  removeFromCart,
  updateCartItemQuantity,
} from '../../lib/cart'

export default function CarritoPage() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    setItems(getCart())
  }, [])

  function handleRemove(variantId: string) {
    removeFromCart(variantId)
    setItems(getCart())
  }

  function handleQuantityChange(variantId: string, cantidad: number) {
    updateCartItemQuantity(variantId, cantidad)
    setItems(getCart())
  }

  const total = useMemo(() => {
    return items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  }, [items])

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold">Carrito</h1>

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

                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={item.cantidad}
                      onChange={(e) =>
                        handleQuantityChange(
                          item.variantId,
                          Number(e.target.value || 1),
                        )
                      }
                      className="w-20 rounded-xl border border-slate-300 px-3 py-2"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemove(item.variantId)}
                      className="text-sm text-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
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

            <Link
              href="/checkout"
              className="mt-6 block rounded-xl bg-slate-900 px-4 py-3 text-center text-white"
            >
              Continuar al checkout
            </Link>
          </aside>
        </div>
      )}
    </main>
  )
}