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

        const response = await fetch('/api/orders/admin/all', {
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
    <main className="page">
      <section className="page-title-section">
        <h1>Órdenes admin</h1>
      </section>

      <section style={{ background: 'var(--gradient-soft)', paddingTop: '2rem', paddingBottom: '3.5rem' }}>
        <div className="mx-auto max-w-6xl px-6">
          {loading ? (
            <div style={{
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
              borderRadius: '1.5rem',
              border: '2px solid #ef5350',
              background: '#ffffff',
              padding: '1.5rem',
              boxShadow: 'var(--sombra-suave)',
              color: '#d32f2f',
              fontWeight: 600
            }}>
              <p>{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={{
              borderRadius: '1.5rem',
              border: '1px solid var(--color-border)',
              background: '#ffffff',
              padding: '2rem',
              boxShadow: 'var(--sombra-suave)',
              textAlign: 'center'
            }}>
              <p style={{ color: '#667780' }}>No hay órdenes registradas.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {orders.map((order) => (
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', alignItems: 'start' }}>
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#667780' }}>Orden</p>
                        <h2 style={{ marginTop: '0.25rem', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)' }}>
                          {order.id}
                        </h2>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#667780' }}>
                          Fecha: {new Date(order.creadoEn).toLocaleString()}
                        </p>
                      </div>

                      <div style={{
                        borderRadius: '1.5rem',
                        background: 'var(--color-surface-soft)',
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                        paddingTop: '0.75rem',
                        paddingBottom: '0.75rem',
                        border: '1px solid var(--color-border)',
                        textAlign: 'right'
                      }}>
                        <p style={{ fontSize: '0.875rem', color: '#667780' }}>Estado de orden</p>
                        <p style={{ marginTop: '0.25rem', fontWeight: 600, color: 'var(--color-text)' }}>
                          {order.estado}
                        </p>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#667780' }}>
                          Pago: {order.pago?.estado ?? 'SIN_PAGO'}
                        </p>
                        <p style={{ marginTop: '0.625rem', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text)' }}>
                          {order.moneda} {Number(order.total).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div style={{
                        borderRadius: '1rem',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-surface-soft)',
                        padding: '1rem'
                      }}>
                        <p style={{ fontSize: '0.875rem', color: '#667780' }}>Comprador</p>
                        <p style={{ marginTop: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                          {order.comprador.nombre ?? ''} {order.comprador.apellido ?? ''}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#667780', wordBreak: 'break-all', marginTop: '0.25rem' }}>
                          {order.comprador.email}
                        </p>
                      </div>

                      <div style={{
                        borderRadius: '1rem',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-surface-soft)',
                        padding: '1rem'
                      }}>
                        <p style={{ fontSize: '0.875rem', color: '#667780' }}>Items</p>
                        <p style={{ marginTop: '0.5rem', fontWeight: 600, color: 'var(--color-text)', fontSize: '1.125rem' }}>
                          {order.items.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                            <p style={{ color: '#667780', marginTop: '0.25rem' }}>Cantidad: {item.cantidad}</p>
                          </div>

                          <p style={{ fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
                            {item.monedaSnapshot} {Number(item.precioUnitarioSnapshot).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <Link
                      href={`/admin/ordenes/${order.id}`}
                      style={{
                        display: 'inline-block',
                        borderRadius: '999px',
                        border: '2px solid var(--color-border)',
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                        paddingTop: '0.375rem',
                        paddingBottom: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        background: '#ffffff',
                        color: 'var(--color-text)'
                      }}
                    >
                      Ver detalle
                    </Link>
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