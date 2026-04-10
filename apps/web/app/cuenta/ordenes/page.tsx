'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const AUTH_CHANGED_EVENT = 'auth-changed'

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
  const [activeFilter, setActiveFilter] = useState<'TODAS' | 'CREADA' | 'PAGADA' | 'CANCELADA'>('TODAS')

  async function loadOrders() {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('accessToken')

      if (!token) {
        setOrders([])
        throw new Error('Debes iniciar sesión para ver tus órdenes')
      }

      const response = await fetch('/api/orders/me', {
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
      setOrders([])
      setError(err instanceof Error ? err.message : 'Error cargando órdenes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()

    const onAuthChanged = () => {
      void loadOrders()
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === 'accessToken') {
        void loadOrders()
      }
    }

    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged)
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'TODAS') {
      return orders
    }

    return orders.filter((order) => order.estado === activeFilter)
  }, [activeFilter, orders])

  const summary = useMemo(() => {
    const totalOrders = orders.length
    const pendingOrders = orders.filter((order) => order.estado === 'CREADA').length
    const totalValue = orders.reduce((acc, order) => acc + Number(order.total || 0), 0)

    return {
      totalOrders,
      pendingOrders,
      totalValue,
    }
  }, [orders])

  function getStatusLabel(status: string) {
    switch (status) {
      case 'CREADA':
        return 'Pendiente'
      case 'PAGADA':
        return 'Pagada'
      case 'CANCELADA':
        return 'Cancelada'
      default:
        return status
    }
  }

  function getStatusClass(status: string) {
    switch (status) {
      case 'CREADA':
        return 'bg-amber-100 text-amber-800'
      case 'PAGADA':
        return 'bg-emerald-100 text-emerald-800'
      case 'CANCELADA':
        return 'bg-rose-100 text-rose-800'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  function getPaymentLabel(payment: OrdenPago | null) {
    if (!payment) {
      return 'Sin pago'
    }

    switch (payment.estado) {
      case 'APROBADO':
        return 'Pago aprobado'
      case 'PENDIENTE':
        return 'Pago pendiente'
      case 'RECHAZADO':
        return 'Pago rechazado'
      default:
        return payment.estado
    }
  }

  return (
    <main className="page">
      <section className="page-title-section">
        <h1>Mis órdenes</h1>
      </section>

      <section style={{ background: 'var(--gradient-soft)', paddingTop: '3rem', paddingBottom: '4rem' }}>
        <div className="mx-auto max-w-6xl px-6">
          <section
            className="rounded-3xl text-white shadow-lg"
            style={{ background: 'var(--gradient-brand)', margin: '2rem', padding: '3.5rem 4rem' }}
          >
            <p style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.24em', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.75rem', marginTop: '0' }}>
              Tus compras
            </p>
            <h2 style={{ marginTop: '1.5rem', fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
              Historial de órdenes
            </h2>
            <p style={{ marginTop: '1rem', marginBottom: '3rem', maxWidth: '45rem', fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.9)' }}>
              Revisa el estado de tus compras, entra al detalle de cada orden y continúa el pago cuando haga falta.
            </p>

            <div className="mt-8 grid gap-8 sm:grid-cols-3" style={{ marginBottom: '1rem' }}>
              <div style={{
                borderRadius: '1rem',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                padding: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.75rem' }}>Total de órdenes</p>
                <p style={{ fontSize: '1.875rem', fontWeight: 700 }}>{summary.totalOrders}</p>
              </div>

              <div style={{
                borderRadius: '1rem',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                padding: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.75rem' }}>Pendientes</p>
                <p style={{ fontSize: '1.875rem', fontWeight: 700 }}>{summary.pendingOrders}</p>
              </div>

              <div style={{
                borderRadius: '1rem',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                padding: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.75rem' }}>Valor total</p>
                <p style={{ fontSize: '1.875rem', fontWeight: 700 }}>USD {summary.totalValue.toFixed(2)}</p>
              </div>
            </div>
          </section>

          <div style={{ marginTop: '4rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {(['TODAS', 'CREADA', 'PAGADA', 'CANCELADA'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                style={{
                  borderRadius: '999px',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: activeFilter === filter ? 'none' : `2px solid var(--color-border)`,
                  background: activeFilter === filter ? 'var(--color-primary)' : '#ffffff',
                  color: activeFilter === filter ? '#ffffff' : 'var(--color-text)',
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
                onMouseOver={(e) => {
                  if (activeFilter !== filter) {
                    (e.target as HTMLButtonElement).style.background = 'var(--color-background)';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeFilter !== filter) {
                    (e.target as HTMLButtonElement).style.background = '#ffffff';
                  }
                }}
              >
                {filter === 'TODAS' ? 'Todas' : getStatusLabel(filter)}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{
              marginTop: '1.5rem',
              borderRadius: '1.5rem',
              border: '1px solid var(--color-border)',
              background: '#ffffff',
              padding: '1.5rem',
              boxShadow: 'var(--sombra-suave)'
            }}>
              <p>Cargando órdenes...</p>
            </div>
          ) : error ? (
            <div style={{
              marginTop: '1.5rem',
              borderRadius: '1.5rem',
              border: '2px solid #ef5350',
              background: '#ffffff',
              padding: '1.5rem',
              boxShadow: 'var(--sombra-suave)'
            }}>
              <p style={{ fontWeight: 600, color: '#d32f2f' }}>{error}</p>
              <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <Link
                  href="/login"
                  style={{
                    borderRadius: '999px',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    background: 'var(--color-primary)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                >
                  Iniciar sesión
                </Link>

                <Link
                  href="/productos"
                  style={{
                    borderRadius: '999px',
                    border: '2px solid var(--color-border)',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.375rem',
                    paddingBottom: '0.375rem',
                    background: '#ffffff',
                    color: 'var(--color-text)',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                >
                  Ver productos
                </Link>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{
              marginTop: '1.5rem',
              borderRadius: '1.5rem',
              border: '1px solid var(--color-border)',
              background: '#ffffff',
              padding: '2rem',
              boxShadow: 'var(--sombra-suave)',
              textAlign: 'center'
            }}>
              <p style={{ color: '#667780' }}>
                {orders.length === 0 ? 'Aún no tienes órdenes.' : 'No hay órdenes para ese filtro.'}
              </p>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <Link
                  href="/productos"
                  style={{
                    borderRadius: '999px',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    background: 'var(--color-primary)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                >
                  Seguir comprando
                </Link>

                <Link
                  href="/carrito"
                  style={{
                    borderRadius: '999px',
                    border: '2px solid var(--color-border)',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.375rem',
                    paddingBottom: '0.375rem',
                    background: '#ffffff',
                    color: 'var(--color-text)',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                >
                  Ir al carrito
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '2.5rem', display: 'grid', gap: '1.5rem' }}>
              {filteredOrders.map((order) => (
                <article
                  key={order.id}
                  style={{
                    borderRadius: '2rem',
                    border: '1px solid var(--color-border)',
                    background: '#ffffff',
                    padding: '1.5rem',
                    boxShadow: 'var(--sombra-media)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{
                          borderRadius: '999px',
                          paddingLeft: '0.75rem',
                          paddingRight: '0.75rem',
                          paddingTop: '0.25rem',
                          paddingBottom: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          ...(order.estado === 'CREADA' && { background: '#fef08a', color: '#854d0e' }),
                          ...(order.estado === 'PAGADA' && { background: '#dcfce7', color: '#166534' }),
                          ...(order.estado === 'CANCELADA' && { background: '#fee2e2', color: '#991b1b' })
                        }}>
                          {getStatusLabel(order.estado)}
                        </span>

                        <span style={{
                          borderRadius: '999px',
                          paddingLeft: '0.75rem',
                          paddingRight: '0.75rem',
                          paddingTop: '0.25rem',
                          paddingBottom: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: 'var(--color-surface-soft)',
                          color: '#667780'
                        }}>
                          {order.pago ? getPaymentLabel(order.pago) : 'Sin pago'}
                        </span>
                      </div>

                      <h2 style={{ marginTop: '0.75rem', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)' }}>
                        Orden {order.id}
                      </h2>
                      <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#667780' }}>
                        Creada el {new Date(order.creadoEn).toLocaleString()}
                      </p>
                    </div>

                    <div style={{
                      borderRadius: '1.5rem',
                      background: 'var(--color-surface-soft)',
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                      paddingTop: '0.75rem',
                      paddingBottom: '0.75rem',
                      border: '1px solid var(--color-border)'
                    }}>
                      <p style={{ fontSize: '0.875rem', color: '#667780' }}>Total</p>
                      <p style={{ marginTop: '0.25rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
                        {order.moneda} {Number(order.total).toFixed(2)}
                      </p>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#667780' }}>
                        {order.items.length} artículo(s)
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                          paddingBottom: '1rem',
                          fontSize: '0.875rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{item.tituloSnapshot}</p>
                            <p style={{ color: '#667780', marginTop: '0.25rem' }}>
                              Cantidad: {item.cantidad}
                            </p>
                          </div>

                          <p style={{ fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
                            {item.monedaSnapshot} {Number(item.precioUnitarioSnapshot).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <Link
                      href={`/cuenta/ordenes/${order.id}`}
                      style={{
                        borderRadius: '999px',
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                        paddingTop: '0.5rem',
                        paddingBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        background: 'var(--color-primary)',
                        color: '#ffffff',
                        boxShadow: '0 2px 8px rgba(43, 58, 140, 0.2)',
                        cursor: 'pointer',
                        display: 'inline-block'
                      }}
                      onMouseOver={(e) => {
                        (e.target as HTMLElement).style.background = 'var(--color-primary-700)';
                        (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(43, 58, 140, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        (e.target as HTMLElement).style.background = 'var(--color-primary)';
                        (e.target as HTMLElement).style.boxShadow = '0 2px 8px rgba(43, 58, 140, 0.2)';
                      }}
                    >
                      Ver detalle
                    </Link>

                    {order.estado === 'CREADA' ? (
                      <Link
                        href={`/pago/${order.id}`}
                        style={{
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
                          cursor: 'pointer',
                          display: 'inline-block',
                          transition: 'all 200ms ease'
                        }}
                        onMouseOver={(e) => {
                          (e.target as HTMLElement).style.background = 'var(--color-background)';
                          (e.target as HTMLElement).style.borderColor = 'var(--color-secondary)';
                        }}
                        onMouseOut={(e) => {
                          (e.target as HTMLElement).style.background = '#ffffff';
                          (e.target as HTMLElement).style.borderColor = 'var(--color-border)';
                        }}
                      >
                        Ir a pagar
                      </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
        </div>
      </section>
    </main>
  )
}