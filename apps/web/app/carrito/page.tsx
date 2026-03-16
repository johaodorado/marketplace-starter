'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  CartItem,
  getCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
} from '../../lib/cart'

export default function CarritoPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setItems(getCart())
    setMounted(true)
  }, [])

  function handleRemove(variantId: string) {
    removeFromCart(variantId)
    setItems(getCart())
  }

  function handleQuantityChange(variantId: string, cantidad: number) {
    if (cantidad > 0) {
      updateCartItemQuantity(variantId, cantidad)
      setItems(getCart())
    }
  }

  function handleClearCart() {
    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      clearCart()
      setItems([])
    }
  }

  const total = useMemo(() => {
    return items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  }, [items])

  const subtotal = useMemo(() => {
    return total
  }, [total])

  const impuestos = useMemo(() => {
    return Number((subtotal * 0.08).toFixed(2))
  }, [subtotal])

  const totalConImpuestos = useMemo(() => {
    return Number((subtotal + impuestos).toFixed(2))
  }, [subtotal, impuestos])

  if (!mounted) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="mb-6 text-3xl font-bold">Carrito</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-slate-600">Cargando carrito...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="cart-page-section">
        <div className="cart-header">
          <h1>Mi Carrito</h1>
          <p className="cart-item-count">
            {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p className="empty-state">Tu carrito está vacío</p>

            <Link href="/productos" className="btn-product">
              Continuar comprando
            </Link>
          </div>
        ) : (
          <div className="cart-container">
            <div className="cart-items-container">
              {items.map((item) => (
                <article
                  key={item.variantId}
                  className="cart-item-card"
                >
                  <div className="cart-item-image">
                    {item.imagenUrl ? (
                      <img
                        src={item.imagenUrl}
                        alt={item.titulo}
                      />
                    ) : (
                      <div className="image-placeholder">
                        <span>Sin imagen</span>
                      </div>
                    )}
                  </div>

                  <div className="cart-item-details">
                    <h2 className="product-name">{item.titulo}</h2>
                    <p className="product-variant">{item.varianteNombre}</p>
                    <p className="product-price">
                      {item.moneda} {item.precio}
                    </p>
                  </div>

                  <div className="cart-item-controls">
                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(item.variantId, item.cantidad - 1)
                        }
                        className="qty-btn"
                      >
                        −
                      </button>
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
                        className="qty-input"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(item.variantId, item.cantidad + 1)
                        }
                        className="qty-btn"
                      >
                        +
                      </button>
                    </div>

                    <p className="item-subtotal">
                      {item.moneda} {(item.precio * item.cantidad).toFixed(2)}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.variantId)}
                      className="btn-remove"
                    >
                      Quitar
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="cart-summary-sidebar">
              <h2 className="summary-title">Resumen de Orden</h2>

              <div className="summary-lines">
                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>{items[0]?.moneda ?? 'USD'} {subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Impuestos (8%)</span>
                  <span>{items[0]?.moneda ?? 'USD'} {impuestos.toFixed(2)}</span>
                </div>
              </div>

              <div className="summary-line summary-total">
                <span>Total</span>
                <span>{items[0]?.moneda ?? 'USD'} {totalConImpuestos.toFixed(2)}</span>
              </div>

              <Link
                href="/checkout"
                className="btn-checkout"
              >
                Ir a Checkout
              </Link>

              <button
                type="button"
                onClick={handleClearCart}
                className="btn-clear-cart"
              >
                Vaciar Carrito
              </button>

              <Link href="/productos" className="back-to-products">
                ← Continuar comprando
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}