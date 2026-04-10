'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

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
  items: OrdenItem[]
  reservas: Reserva[]
  pago: Pago | null
}

export default function OrdenDetallePage() {
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
          throw new Error('Debes iniciar sesión para ver la orden')
        }

        const response = await fetch(
          `/api/orders/me/${orderId}`,
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
      <main className="page">
        <section className="page-title-section">
          <h1>Detalle de orden</h1>
        </section>
        <section style={{ background: 'var(--gradient-soft)', paddingTop: '2rem', paddingBottom: '3.5rem' }}>
          <div className="mx-auto max-w-6xl px-6">
            <div style={{
              borderRadius: '1.5rem',
              border: '1px solid var(--color-border)',
              background: '#ffffff',
              padding: '1.5rem',
              boxShadow: 'var(--sombra-suave)'
            }}>
              <p>Cargando orden...</p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="page">
        <section className="page-title-section">
          <h1>Detalle de orden</h1>
        </section>
        <section style={{ background: 'var(--gradient-soft)', paddingTop: '2rem', paddingBottom: '3.5rem' }}>
          <div className="mx-auto max-w-6xl px-6">
            <div style={{
              borderRadius: '1.5rem',
              border: '2px solid #ef5350',
              background: '#ffffff',
              padding: '1.5rem',
              boxShadow: 'var(--sombra-suave)'
            }}>
              <p style={{ color: '#d32f2f', fontWeight: 600 }}>{error || 'No se encontró la orden'}</p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const referencia = order.pago?.externalMeta?.referencia
  const observacion = order.pago?.externalMeta?.observacion
  const reportadoEn = order.pago?.externalMeta?.reportadoEn
  const revision = order.pago?.externalMeta?.revision

  return (
    <main className="page">
      <section className="page-title-section">
        <h1>Detalle de orden</h1>
      </section>

      <section style={{ background: 'var(--gradient-soft)', paddingTop: '2rem', paddingBottom: '3.5rem' }}>
        <div className="mx-auto max-w-6xl px-6">
          <Link
            href="/cuenta/ordenes"
            style={{
              display: 'inline-flex',
              borderRadius: '999px',
              border: '2px solid var(--color-border)',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              paddingTop: '0.375rem',
              paddingBottom: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              background: '#ffffff',
              color: 'var(--color-text)',
              marginBottom: '1.5rem'
            }}
          >
            ← Volver a mis órdenes
          </Link>

          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'lg:1fr 360px' }}>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{
                borderRadius: '2rem',
                border: '1px solid var(--color-border)',
                background: '#ffffff',
                padding: '1.5rem',
                boxShadow: 'var(--sombra-media)'
              }}>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#667780', marginBottom: '0.5rem' }}>
                      Orden ID
                    </p>
                    <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)', wordBreak: 'break-all' }}>
                      {order.id}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#667780', marginTop: '0.5rem' }}>
                      Creada el {new Date(order.creadoEn).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div style={{
                    borderRadius: '1rem',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-soft)',
                    padding: '1rem'
                  }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#667780' }}>
                      Estado de orden
                    </p>
                    <p style={{ marginTop: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                      {order.estado}
                    </p>
                  </div>

                  <div style={{
                    borderRadius: '1rem',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-soft)',
                    padding: '1rem'
                  }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#667780' }}>
                      Estado del pago
                    </p>
                    <p style={{ marginTop: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                      {order.pago?.estado ?? 'SIN PAGO'}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                borderRadius: '2rem',
                border: '1px solid var(--color-border)',
                background: '#ffffff',
                padding: '1.5rem',
                boxShadow: 'var(--sombra-media)'
              }}>
                <h2 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  Productos
                </h2>

                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        borderRadius: '1rem',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-surface-soft)',
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                        paddingTop: '1rem',
                        paddingBottom: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'start' }}>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{item.tituloSnapshot}</p>
                          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#667780' }}>
                            SKU: {item.skuSnapshot ?? 'N/A'} | Cantidad: {item.cantidad}
                          </p>
                        </div>

                        <div style={{
                          borderRadius: '999px',
                          background: '#ffffff',
                          paddingLeft: '0.75rem',
                          paddingRight: '0.75rem',
                          paddingTop: '0.25rem',
                          paddingBottom: '0.25rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--color-text)',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.monedaSnapshot} {Number(item.precioUnitarioSnapshot).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                borderRadius: '2rem',
                border: '1px solid var(--color-border)',
                background: '#ffffff',
                padding: '1.5rem',
                boxShadow: 'var(--sombra-media)'
              }}>
                <h2 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  Pago reportado
                </h2>

                {order.pago ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#667780' }}>Referencia</p>
                      <p style={{ marginTop: '0.25rem', fontWeight: 600, color: 'var(--color-text)' }}>
                        {referencia || 'No registrada'}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#667780' }}>Método</p>
                      <p style={{ marginTop: '0.25rem', fontWeight: 600, color: 'var(--color-text)' }}>
                        {order.pago.externalMeta?.metodo || 'No registrado'}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#667780' }}>Observación</p>
                      <p style={{ marginTop: '0.25rem', fontWeight: 600, color: 'var(--color-text)' }}>
                        {observacion || 'Sin observación'}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#667780' }}>Reportado en</p>
                      <p style={{ marginTop: '0.25rem', fontWeight: 600, color: 'var(--color-text)' }}>
                        {reportadoEn ? new Date(reportadoEn).toLocaleString() : 'No reportado'}
                      </p>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <p style={{ fontSize: '0.875rem', color: '#667780' }}>Revisión admin</p>
                      <p style={{ marginTop: '0.25rem', fontWeight: 600, color: 'var(--color-text)' }}>
                        {revision?.estado || 'Pendiente de revisión'}
                      </p>

                      {revision?.observacion ? (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#667780' }}>
                          {revision.observacion}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <p style={{ marginTop: '1rem', color: '#667780' }}>Todavía no existe un pago asociado.</p>
                )}
              </div>
            </section>

            <aside style={{
              height: 'fit-content',
              borderRadius: '2rem',
              border: '1px solid var(--color-border)',
              background: '#ffffff',
              padding: '1.5rem',
              boxShadow: 'var(--sombra-media)'
            }}>
              <h2 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Totales
              </h2>

              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: '1rem',
                  background: 'var(--color-surface-soft)',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem'
                }}>
                  <span style={{ color: '#667780' }}>Subtotal</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                    {order.moneda} {Number(order.subtotal).toFixed(2)}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: '1rem',
                  background: 'var(--color-surface-soft)',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem'
                }}>
                  <span style={{ color: '#667780' }}>Comisión</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                    {order.moneda} {Number(order.comision).toFixed(2)}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: '1rem',
                  background: 'var(--gradient-brand)',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#ffffff'
                }}>
                  <span>Total</span>
                  <span>
                    {order.moneda} {Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {order.estado === 'CREADA' ? (
                <Link
                  href={`/pago/${order.id}`}
                  style={{
                    marginTop: '1rem',
                    display: 'block',
                    borderRadius: '999px',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.625rem',
                    paddingBottom: '0.625rem',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: '#ffffff',
                    background: 'var(--color-primary)',
                    boxShadow: '0 2px 8px rgba(43, 58, 140, 0.2)',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLElement).style.background = 'var(--color-primary-700)'
                    (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(43, 58, 140, 0.3)'
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLElement).style.background = 'var(--color-primary)'
                    (e.target as HTMLElement).style.boxShadow = '0 2px 8px rgba(43, 58, 140, 0.2)'
                  }}
                >
                  Ir a pagar
                </Link>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}