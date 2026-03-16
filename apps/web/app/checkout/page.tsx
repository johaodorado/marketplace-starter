'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearCart, getCart } from '../../lib/cart'

type FormData = {
  apellido: string
  nombre: string
  correo: string
  telefono: string
  direccion: string
  ciudad: string
  provincia: string
  codigoPostal: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    apellido: '',
    nombre: '',
    correo: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
  })

  const items = getCart()

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  }, [items])

  const impuestos = useMemo(() => {
    return Number((subtotal * 0.08).toFixed(2))
  }, [subtotal])

  const envio = 10.0
  const total = useMemo(() => {
    return Number((subtotal + impuestos + envio).toFixed(2))
  }, [subtotal, impuestos])

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleCreateOrder() {
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const token = localStorage.getItem('accessToken')

      if (!token) {
        throw new Error('Debes iniciar sesión para continuar')
      }

      if (items.length === 0) {
        throw new Error('Tu carrito está vacío')
      }

      // Validar campos del formulario
      if (!formData.nombre || !formData.apellido || !formData.correo || !formData.direccion) {
        throw new Error('Por favor completa todos los campos requeridos')
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
          shippingData: {
            apellido: formData.apellido,
            nombre: formData.nombre,
            correo: formData.correo,
            telefono: formData.telefono,
            direccion: formData.direccion,
            ciudad: formData.ciudad,
            provincia: formData.provincia,
            codigoPostal: formData.codigoPostal,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(
          data?.error?.message || data?.message || 'No se pudo crear la orden'
        )
      }

      const order = await response.json()

      clearCart()
      setSuccess(true)
      
      setTimeout(() => {
        router.push(`/pago/${order.id}`)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la orden')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="page">
        <section className="checkout-empty">
          <h1>Checkout</h1>
          <p className="empty-state">Tu carrito está vacío</p>

          <Link href="/productos" className="btn-product">
            Volver a productos
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="checkout-page-section">
        <h1>Checkout</h1>

        {success && (
          <div className="alert alert-success">
            <p>Orden creada exitosamente. Redirigiendo...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <p>{error}</p>
          </div>
        )}

        <div className="checkout-container">
          <div className="checkout-form-section">
            <h2>Información de Envío</h2>

            <form className="checkout-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleFormChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="apellido">Apellido *</label>
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleFormChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="correo">Correo Electrónico *</label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleFormChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleFormChange}
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="direccion">Dirección *</label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleFormChange}
                  required
                  className="form-input"
                  placeholder="Calle, número, apto"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ciudad">Ciudad</label>
                  <input
                    type="text"
                    id="ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleFormChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="provincia">Provincia</label>
                  <input
                    type="text"
                    id="provincia"
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleFormChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="codigoPostal">Código Postal</label>
                <input
                  type="text"
                  id="codigoPostal"
                  name="codigoPostal"
                  value={formData.codigoPostal}
                  onChange={handleFormChange}
                  className="form-input"
                />
              </div>
            </form>

            <h2 className="mt-8">Resumen de Orden</h2>
            <div className="order-summary-table">
              {items.map((item) => (
                <div key={item.variantId} className="summary-item">
                  <div className="summary-item-info">
                    <p className="product-name">{item.titulo}</p>
                    <p className="product-variant">{item.varianteNombre}</p>
                    <p className="product-qty">Cantidad: {item.cantidad}x</p>
                  </div>
                  <div className="summary-item-price">
                    {item.moneda} {(item.precio * item.cantidad).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="checkout-summary-sidebar">
            <h2 className="summary-title">Total a Pagar</h2>

            <div className="summary-detail">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>{items[0]?.moneda ?? 'USD'} {subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Impuestos (8%)</span>
                <span>{items[0]?.moneda ?? 'USD'} {impuestos.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Envío</span>
                <span>{items[0]?.moneda ?? 'USD'} {envio.toFixed(2)}</span>
              </div>
            </div>

            <div className="summary-line summary-total">
              <span>Total</span>
              <span>{items[0]?.moneda ?? 'USD'} {total.toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={loading}
              className={`btn-continue-payment ${loading ? 'disabled' : ''}`}
            >
              {loading ? 'Procesando...' : 'Continuar al Pago'}
            </button>

            <Link href="/carrito" className="back-to-cart">
              ← Volver al carrito
            </Link>
          </aside>
        </div>
      </section>
    </main>
  )
}