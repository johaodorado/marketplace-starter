'use client'

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

type Orden = {
  id: string
  estado: string
  total: number
  moneda: string
  creadoEn: string
  comprador: Comprador
  items: OrdenItem[]
}

type Pago = {
  id: string
  estado: string
  monto: number
  moneda: string
  externalMeta?: {
    metodo?: string | null
    referencia?: string | null
    observacion?: string | null
    reportadoEn?: string | null
  } | null
  orden: Orden
}

export default function AdminPagosPage() {
  const [payments, setPayments] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  async function loadPayments() {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('accessToken')

      if (!token) {
        throw new Error('Debes iniciar sesión')
      }

      const response = await fetch('/api/payments/admin/reported', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error?.message || data?.message || 'No se pudieron cargar los pagos')
      }

      const data = await response.json()
      setPayments(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando pagos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments()
  }, [])

  async function handleApprove(paymentId: string) {
    try {
      setActionLoadingId(paymentId)
      setError('')

      const token = localStorage.getItem('accessToken')

      if (!token) {
        throw new Error('Debes iniciar sesión')
      }

      const response = await fetch(
        `/api/payments/admin/${paymentId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            observacion: 'Pago aprobado desde panel admin',
          }),
        },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error?.message || data?.message || 'No se pudo aprobar el pago')
      }

      await loadPayments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error aprobando pago')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleReject(paymentId: string) {
    try {
      setActionLoadingId(paymentId)
      setError('')

      const token = localStorage.getItem('accessToken')

      if (!token) {
        throw new Error('Debes iniciar sesión')
      }

      const response = await fetch(
        `/api/payments/admin/${paymentId}/reject`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            observacion: 'Pago rechazado desde panel admin',
          }),
        },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error?.message || data?.message || 'No se pudo rechazar el pago')
      }

      await loadPayments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error rechazando pago')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <main className="page">
      <section className="page-title-section">
        <h1>Pagos admin</h1>
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
              <p>Cargando pagos...</p>
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
          ) : payments.length === 0 ? (
            <div style={{
              borderRadius: '1.5rem',
              border: '1px solid var(--color-border)',
              background: '#ffffff',
              padding: '2rem',
              boxShadow: 'var(--sombra-suave)',
              textAlign: 'center'
            }}>
              <p style={{ color: '#667780' }}>No hay pagos reportados pendientes.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {payments.map((payment) => (
                <article
                  key={payment.id}
                  style={{
                    borderRadius: '2rem',
                    border: '1px solid var(--color-border)',
                    background: '#ffffff',
                    padding: '1.5rem',
                    boxShadow: 'var(--sombra-media)'
                  }}
                >
                  <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'lg:1fr 280px' }}>
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'start' }}>
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#667780' }}>Pago</p>
                          <h2 style={{ marginTop: '0.25rem', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)' }}>
                            {payment.id}
                          </h2>
                          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#667780' }}>
                            Orden: {payment.orden.id}
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
                          <p style={{ fontSize: '0.875rem', color: '#667780' }}>Monto</p>
                          <p style={{ marginTop: '0.25rem', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)' }}>
                            {payment.moneda} {Number(payment.monto).toFixed(2)}
                          </p>
                          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#667780' }}>
                            Estado: {payment.estado}
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
                          <p style={{ fontSize: '0.875rem', color: '#667780' }}>Comprador</p>
                          <p style={{ marginTop: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                            {payment.orden.comprador.nombre ?? ''} {payment.orden.comprador.apellido ?? ''}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#667780', wordBreak: 'break-all', marginTop: '0.25rem' }}>
                            {payment.orden.comprador.email}
                          </p>
                        </div>

                        <div style={{
                          borderRadius: '1rem',
                          border: '1px solid var(--color-border)',
                          background: 'var(--color-surface-soft)',
                          padding: '1rem'
                        }}>
                          <p style={{ fontSize: '0.875rem', color: '#667780' }}>Referencia</p>
                          <p style={{ marginTop: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                            {payment.externalMeta?.referencia || 'No registrada'}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#667780', marginTop: '0.25rem' }}>
                            Método: {payment.externalMeta?.metodo || 'No registrado'}
                          </p>
                        </div>

                        <div style={{
                          borderRadius: '1rem',
                          border: '1px solid var(--color-border)',
                          background: 'var(--color-surface-soft)',
                          padding: '1rem',
                          gridColumn: '1 / -1'
                        }}>
                          <p style={{ fontSize: '0.875rem', color: '#667780' }}>Observación del cliente</p>
                          <p style={{ marginTop: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
                            {payment.externalMeta?.observacion || 'Sin observación'}
                          </p>
                        </div>
                      </div>

                      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {payment.orden.items.map((item) => (
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
                    </div>

                    <aside style={{
                      borderRadius: '2rem',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface-soft)',
                      padding: '1.25rem'
                    }}>
                      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text)' }}>
                        Acciones
                      </h3>

                      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                          type="button"
                          onClick={() => handleApprove(payment.id)}
                          disabled={actionLoadingId === payment.id}
                          style={{
                            width: '100%',
                            borderRadius: '999px',
                            paddingLeft: '1rem',
                            paddingRight: '1rem',
                            paddingTop: '0.625rem',
                            paddingBottom: '0.625rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            background: 'var(--color-primary)',
                            border: 'none',
                            cursor: 'pointer',
                            opacity: actionLoadingId === payment.id ? 0.6 : 1,
                            boxShadow: '0 2px 8px rgba(43, 58, 140, 0.2)',
                            transition: 'all 200ms ease'
                          }}
                          onMouseOver={(e) => {
                            if (actionLoadingId !== payment.id) {
                              (e.target as HTMLButtonElement).style.background = 'var(--color-primary-700)';
                              (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(43, 58, 140, 0.3)';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (actionLoadingId !== payment.id) {
                              (e.target as HTMLButtonElement).style.background = 'var(--color-primary)';
                              (e.target as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(43, 58, 140, 0.2)';
                            }
                          }}
                        >
                          {actionLoadingId === payment.id ? 'Procesando...' : 'Aprobar pago'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(payment.id)}
                          disabled={actionLoadingId === payment.id}
                          style={{
                            width: '100%',
                            borderRadius: '999px',
                            paddingLeft: '1rem',
                            paddingRight: '1rem',
                            paddingTop: '0.625rem',
                            paddingBottom: '0.625rem',
                            fontWeight: 700,
                            color: '#dc2626',
                            background: '#ffffff',
                            border: '2px solid #fca5a5',
                            cursor: 'pointer',
                            opacity: actionLoadingId === payment.id ? 0.6 : 1,
                            transition: 'all 200ms ease'
                          }}
                          onMouseOver={(e) => {
                            if (actionLoadingId !== payment.id) {
                              (e.target as HTMLButtonElement).style.background = '#fee2e2';
                              (e.target as HTMLButtonElement).style.borderColor = '#dc2626';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (actionLoadingId !== payment.id) {
                              (e.target as HTMLButtonElement).style.background = '#ffffff';
                              (e.target as HTMLButtonElement).style.borderColor = '#fca5a5';
                            }
                          }}
                        >
                          {actionLoadingId === payment.id ? 'Procesando...' : 'Rechazar pago'}
                        </button>
                      </div>
                    </aside>
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