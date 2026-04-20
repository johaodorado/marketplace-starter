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

type Filtro = 'TODAS' | 'CREADA' | 'PAGADA' | 'CANCELADA'

function estadoOrdenStyle(estado: string) {
  switch (estado) {
    case 'PAGADA':    return { bg: '#dcfce7', color: '#166534', border: '#86efac', label: 'Pagada' }
    case 'CREADA':    return { bg: '#fef9c3', color: '#854d0e', border: '#fde047', label: 'Pendiente' }
    case 'CANCELADA': return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', label: 'Cancelada' }
    case 'ENVIADA':   return { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd', label: 'Enviada' }
    case 'ENTREGADA': return { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7', label: 'Entregada' }
    default:          return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: estado }
  }
}

function estadoPagoStyle(estado: string) {
  switch (estado) {
    case 'APROBADO':   return { bg: '#dcfce7', color: '#166534', label: 'Pago aprobado' }
    case 'PENDIENTE':  return { bg: '#fef9c3', color: '#854d0e', label: 'Pago pendiente' }
    case 'RECHAZADO':  return { bg: '#fee2e2', color: '#991b1b', label: 'Pago rechazado' }
    default:           return { bg: '#f1f5f9', color: '#475569', label: estado }
  }
}

function Badge({ text, bg, color }: { text: string; bg: string; color: string }) {
  return (
    <span style={{
      borderRadius: '999px', padding: '0.2rem 0.75rem',
      fontSize: '0.72rem', fontWeight: 700,
      background: bg, color,
    }}>
      {text}
    </span>
  )
}

export default function MisOrdenesPage() {
  const [orders, setOrders] = useState<Orden[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState<Filtro>('TODAS')

  async function loadOrders() {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('accessToken')
      if (!token) { setOrders([]); throw new Error('Debes iniciar sesión para ver tus órdenes') }

      const res = await fetch('/api/orders/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || 'No se pudieron cargar tus órdenes')
      }
      const data = await res.json()
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
    const onAuthChanged = () => void loadOrders()
    const onStorage = (e: StorageEvent) => { if (e.key === 'accessToken') void loadOrders() }
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'TODAS') return orders
    return orders.filter((o) => o.estado === activeFilter)
  }, [activeFilter, orders])

  const summary = useMemo(() => ({
    total: orders.length,
    pendientes: orders.filter((o) => o.estado === 'CREADA').length,
    valor: orders.reduce((acc, o) => acc + Number(o.total || 0), 0),
  }), [orders])

  const filtros: { key: Filtro; label: string }[] = [
    { key: 'TODAS',    label: 'Todas' },
    { key: 'CREADA',   label: 'Pendientes' },
    { key: 'PAGADA',   label: 'Pagadas' },
    { key: 'CANCELADA', label: 'Canceladas' },
  ]

  return (
    <main style={{ paddingTop: 'var(--header-height)', minHeight: '100vh', background: '#f1f5f9' }}>

      {/* ── Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1c8a86 0%, #2b3a8c 55%, #5a3fa3 100%)',
        padding: '2.5rem 1.5rem 3rem',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' as const,
            letterSpacing: '0.2em', color: 'rgba(255,255,255,0.75)', margin: '0 0 0.5rem' }}>
            Tus compras
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem' }}>
            Historial de órdenes
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0 0 2rem', fontSize: '0.9rem', maxWidth: '480px' }}>
            Revisa el estado de tus compras y continúa el pago cuando haga falta.
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { label: 'Total de órdenes', value: String(summary.total) },
              { label: 'Pendientes',        value: String(summary.pendientes) },
              { label: 'Valor total',       value: `USD ${summary.valor.toFixed(2)}` },
            ].map((stat) => (
              <div key={stat.label} style={{
                borderRadius: '1rem', background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)', padding: '1.25rem 1.5rem',
              }}>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', margin: '0 0 0.4rem' }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {filtros.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
              style={{
                borderRadius: '999px', padding: '0.5rem 1.1rem',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 200ms', border: 'none',
                background: activeFilter === f.key
                  ? 'linear-gradient(135deg, #1c8a86, #2b3a8c)'
                  : '#ffffff',
                color: activeFilter === f.key ? '#ffffff' : '#374151',
                boxShadow: activeFilter === f.key
                  ? '0 2px 8px rgba(28,138,134,0.3)'
                  : '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              {f.label}
              {f.key === 'TODAS' && orders.length > 0 && (
                <span style={{
                  marginLeft: '0.4rem', background: activeFilter === f.key
                    ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color: activeFilter === f.key ? '#ffffff' : '#64748b',
                  borderRadius: '999px', padding: '0.05rem 0.45rem',
                  fontSize: '0.7rem', fontWeight: 700,
                }}>
                  {orders.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ background: '#ffffff', borderRadius: '1.25rem', border: '1px solid #e2e8f0',
            padding: '3rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <p style={{ color: '#64748b' }}>Cargando órdenes...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ background: '#ffffff', borderRadius: '1.25rem', border: '1px solid #fca5a5',
            padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <p style={{ color: '#dc2626', fontWeight: 600, margin: '0 0 1rem' }}>{error}</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/login" style={{
                background: 'var(--color-primary)', color: '#ffffff',
                borderRadius: '999px', padding: '0.55rem 1.25rem', fontWeight: 700, fontSize: '0.875rem',
              }}>
                Iniciar sesión
              </Link>
              <Link href="/productos" style={{
                background: '#ffffff', color: '#374151', border: '1px solid #e2e8f0',
                borderRadius: '999px', padding: '0.5rem 1.25rem', fontWeight: 700, fontSize: '0.875rem',
              }}>
                Ver productos
              </Link>
            </div>
          </div>
        )}

        {/* Sin órdenes */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div style={{ background: '#ffffff', borderRadius: '1.25rem', border: '1px solid #e2e8f0',
            padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: '2.5rem', margin: '0 0 1rem' }}>📭</p>
            <p style={{ color: '#64748b', margin: '0 0 1.5rem' }}>
              {orders.length === 0 ? 'Aún no tienes órdenes.' : 'No hay órdenes para ese filtro.'}
            </p>
            <Link href="/productos" style={{
              display: 'inline-block', background: 'linear-gradient(135deg, #1c8a86, #2b3a8c)',
              color: '#ffffff', borderRadius: '999px', padding: '0.65rem 1.5rem',
              fontWeight: 700, fontSize: '0.875rem',
            }}>
              Ir a productos
            </Link>
          </div>
        )}

        {/* Lista de órdenes */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredOrders.map((order) => {
              const oes = estadoOrdenStyle(order.estado)
              const pes = order.pago ? estadoPagoStyle(order.pago.estado) : null

              return (
                <article key={order.id} style={{
                  background: '#ffffff', borderRadius: '1.25rem',
                  border: '1px solid #e2e8f0', overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}>
                  {/* Header de la card */}
                  <div style={{
                    padding: '1.1rem 1.5rem', borderBottom: '1px solid #f8fafc',
                    background: '#fafafa',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                        <Badge text={oes.label} bg={oes.bg} color={oes.color} />
                        {pes && <Badge text={pes.label} bg={pes.bg} color={pes.color} />}
                      </div>
                      <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8', margin: 0 }}>
                        {order.id}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {order.moneda} {Number(order.total).toFixed(2)}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.1rem 0 0' }}>
                        {new Date(order.creadoEn).toLocaleDateString('es-EC', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {order.items.map((item) => (
                        <div key={item.id} style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', gap: '1rem',
                          background: '#f8fafc', borderRadius: '0.75rem',
                          padding: '0.7rem 1rem', border: '1px solid #f1f5f9',
                        }}>
                          <div>
                            <p style={{ fontWeight: 600, color: '#1e293b', margin: '0 0 0.15rem', fontSize: '0.9rem' }}>
                              {item.tituloSnapshot}
                            </p>
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                              Cantidad: {item.cantidad}
                            </p>
                          </div>
                          <p style={{ fontWeight: 700, color: '#0f172a', margin: 0, whiteSpace: 'nowrap' as const, fontSize: '0.9rem' }}>
                            {item.monedaSnapshot} {Number(item.precioUnitarioSnapshot).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer con acciones */}
                  <div style={{
                    padding: '0.9rem 1.5rem', borderTop: '1px solid #f8fafc',
                    background: '#fafafa', display: 'flex', gap: '0.6rem', flexWrap: 'wrap',
                  }}>
                    <Link href={`/cuenta/ordenes/${order.id}`} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      background: 'linear-gradient(135deg, #1c8a86, #2b3a8c)',
                      color: '#ffffff', borderRadius: '999px',
                      padding: '0.5rem 1.1rem', fontWeight: 700, fontSize: '0.82rem',
                      boxShadow: '0 2px 6px rgba(28,138,134,0.25)',
                    }}>
                      Ver detalle →
                    </Link>

                    {order.estado === 'CREADA' && (
                      <Link href={`/pago/${order.id}`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        background: '#ffffff', color: '#374151',
                        border: '1px solid #e2e8f0', borderRadius: '999px',
                        padding: '0.5rem 1.1rem', fontWeight: 700, fontSize: '0.82rem',
                      }}>
                        💳 Ir a pagar
                      </Link>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}