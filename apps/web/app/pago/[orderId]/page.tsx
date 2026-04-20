'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

type PaymentInfo = {
  orderId: string
  pagoId: string
  estadoOrden: string
  estadoPago: string
  monto: number
  moneda: string
  banco: string
  tipoCuenta: string
  numeroCuenta?: string
  titular: string
  identificacion: string
  instrucciones: string
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    }}>
      <p style={{
        fontSize: '0.72rem',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        color: '#94a3b8',
        margin: 0,
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '0.95rem',
        fontWeight: 600,
        color: '#1e293b',
        margin: 0,
      }}>
        {value}
      </p>
    </div>
  )
}

export default function PagoManualPage() {
  const params = useParams<{ orderId: string }>()
  const orderId = params?.orderId

  const [info, setInfo] = useState<PaymentInfo | null>(null)
  const [referencia, setReferencia] = useState('')
  const [observacion, setObservacion] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    async function loadPaymentInfo() {
      try {
        setLoading(true)
        setError('')

        const token = localStorage.getItem('accessToken')
        if (!token) throw new Error('Debes iniciar sesión')

        // Fix: usar /api en lugar de localhost:3000
        const response = await fetch(`/api/payments/manual/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.message || 'No se pudo cargar el pago')
        }

        setInfo(await response.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando pago')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) loadPaymentInfo()
  }, [orderId])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    try {
      setSending(true)
      setError('')
      setSuccess('')

      const token = localStorage.getItem('accessToken')
      if (!token) throw new Error('Debes iniciar sesión')

      // Fix: usar /api en lugar de localhost:3000
      const response = await fetch(`/api/payments/manual/${orderId}/report`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ referencia, observacion }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'No se pudo reportar el pago')
      }

      const data = await response.json()
      setSuccess(data.message || 'Pago reportado correctamente')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reportando pago')
    } finally {
      setSending(false)
    }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(''), 2000)
    })
  }

  // Loading
  if (loading) {
    return (
      <main className="page">
        <section style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1px solid #e2e8f0',
            padding: '2rem',
            textAlign: 'center',
          }}>
            <p style={{ color: '#64748b' }}>Cargando datos de pago...</p>
          </div>
        </section>
      </main>
    )
  }

  // Error sin info
  if (error && !info) {
    return (
      <main className="page">
        <section style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div style={{
            background: '#fee2e2',
            borderRadius: '1.25rem',
            border: '1px solid #fca5a5',
            padding: '1.5rem',
            color: '#991b1b',
          }}>
            <p style={{ fontWeight: 600, margin: '0 0 1rem' }}>{error}</p>
            <Link href="/cuenta/ordenes" style={{
              display: 'inline-block',
              background: '#ffffff',
              border: '1px solid #fca5a5',
              borderRadius: '999px',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#991b1b',
            }}>
              ← Mis órdenes
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const yaPagado = info?.estadoPago === 'APROBADO'

  return (
    <main className="page">
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/cuenta/ordenes" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
            color: '#64748b',
            marginBottom: '0.75rem',
          }}>
            ← Volver a mis órdenes
          </Link>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Pago manual
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem', fontFamily: 'monospace' }}>
                Orden: {orderId}
              </p>
            </div>

            {info && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{
                  borderRadius: '999px',
                  padding: '0.3rem 0.9rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase' as const,
                  background: info.estadoOrden === 'PAGADA' ? '#dcfce7' : '#fef9c3',
                  color: info.estadoOrden === 'PAGADA' ? '#166534' : '#854d0e',
                  border: `1px solid ${info.estadoOrden === 'PAGADA' ? '#86efac' : '#fde047'}`,
                }}>
                  Orden: {info.estadoOrden}
                </span>
                <span style={{
                  borderRadius: '999px',
                  padding: '0.3rem 0.9rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase' as const,
                  background: info.estadoPago === 'APROBADO' ? '#dcfce7' : info.estadoPago === 'RECHAZADO' ? '#fee2e2' : '#f1f5f9',
                  color: info.estadoPago === 'APROBADO' ? '#166534' : info.estadoPago === 'RECHAZADO' ? '#991b1b' : '#475569',
                  border: `1px solid ${info.estadoPago === 'APROBADO' ? '#86efac' : info.estadoPago === 'RECHAZADO' ? '#fca5a5' : '#cbd5e1'}`,
                }}>
                  Pago: {info.estadoPago}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Layout 2 columnas */}
        {info && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

            {/* Izquierda - Datos bancarios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Monto a pagar */}
              <div style={{
                background: 'linear-gradient(135deg, #1c8a86 0%, #2b3a8c 100%)',
                borderRadius: '1.25rem',
                padding: '1.75rem 2rem',
                color: '#ffffff',
              }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' as const,
                  letterSpacing: '0.12em', opacity: 0.85, margin: '0 0 0.5rem' }}>
                  Monto a transferir
                </p>
                <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>
                  {info.moneda} {Number(info.monto).toFixed(2)}
                </p>
              </div>

              {/* Datos de la cuenta */}
              <div style={{
                background: '#ffffff',
                borderRadius: '1.25rem',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <div style={{
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid #f1f5f9',
                  background: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#374151', margin: 0 }}>
                    Datos para la transferencia
                  </h2>
                </div>

                <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <InfoRow label="Banco" value={info.banco} />
                  <InfoRow label="Tipo de cuenta" value={info.tipoCuenta} />
                  <InfoRow label="Titular" value={info.titular} />
                  <InfoRow label="Identificación" value={info.identificacion} />

                  {/* Número de cuenta con botón copiar */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{
                      fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' as const,
                      letterSpacing: '0.1em', color: '#94a3b8', margin: '0 0 0.35rem',
                    }}>
                      Número de cuenta
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <p style={{
                        fontSize: '1.1rem', fontWeight: 700, color: '#1e293b',
                        fontFamily: 'monospace', margin: 0, letterSpacing: '0.08em',
                      }}>
                        {info.numeroCuenta ?? 'Pendiente'}
                      </p>
                      {info.numeroCuenta && (
                        <button
                          type="button"
                          onClick={() => handleCopy(info.numeroCuenta!, 'cuenta')}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem',
                            padding: '0.3rem 0.75rem',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            background: copied === 'cuenta' ? '#dcfce7' : '#f8fafc',
                            color: copied === 'cuenta' ? '#166534' : '#64748b',
                            cursor: 'pointer',
                            transition: 'all 200ms',
                          }}
                        >
                          {copied === 'cuenta' ? '✓ Copiado' : 'Copiar'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instrucciones */}
              <div style={{
                background: '#fffbeb',
                borderRadius: '1.25rem',
                border: '1px solid #fde68a',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                gap: '0.75rem',
              }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>ℹ️</span>
                <p style={{ fontSize: '0.9rem', color: '#92400e', margin: 0, lineHeight: 1.6 }}>
                  {info.instrucciones}
                </p>
              </div>

            </div>

            {/* Derecha - Formulario reportar pago */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '1.25rem',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <div style={{
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid #f1f5f9',
                  background: '#f8fafc',
                }}>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#374151', margin: 0 }}>
                    Reportar pago
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
                    Completa después de transferir
                  </p>
                </div>

                <div style={{ padding: '1.5rem' }}>
                  {yaPagado ? (
                    <div style={{
                      background: '#dcfce7',
                      borderRadius: '0.75rem',
                      border: '1px solid #86efac',
                      padding: '1rem',
                      textAlign: 'center',
                    }}>
                      <p style={{ fontSize: '1.5rem', margin: '0 0 0.5rem' }}>✅</p>
                      <p style={{ fontWeight: 700, color: '#166534', margin: 0 }}>
                        Pago aprobado
                      </p>
                      <p style={{ fontSize: '0.85rem', color: '#15803d', margin: '0.25rem 0 0' }}>
                        Tu pago fue confirmado por el administrador
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{
                          display: 'block', fontSize: '0.85rem', fontWeight: 600,
                          color: '#374151', marginBottom: '0.4rem',
                        }}>
                          Referencia / Comprobante
                        </label>
                        <input
                          type="text"
                          value={referencia}
                          onChange={(e) => setReferencia(e.target.value)}
                          placeholder="Ej. TRANSFER-2024-001"
                          style={{
                            width: '100%',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.6rem',
                            padding: '0.65rem 0.9rem',
                            fontSize: '0.9rem',
                            background: '#f8fafc',
                            color: '#1e293b',
                            boxSizing: 'border-box' as const,
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block', fontSize: '0.85rem', fontWeight: 600,
                          color: '#374151', marginBottom: '0.4rem',
                        }}>
                          Observación (opcional)
                        </label>
                        <textarea
                          value={observacion}
                          onChange={(e) => setObservacion(e.target.value)}
                          placeholder="Ej. Pago realizado desde banca móvil"
                          rows={3}
                          style={{
                            width: '100%',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.6rem',
                            padding: '0.65rem 0.9rem',
                            fontSize: '0.9rem',
                            background: '#f8fafc',
                            color: '#1e293b',
                            resize: 'vertical' as const,
                            fontFamily: 'inherit',
                            boxSizing: 'border-box' as const,
                            outline: 'none',
                          }}
                        />
                      </div>

                      {error && (
                        <div style={{
                          background: '#fee2e2', borderRadius: '0.6rem',
                          border: '1px solid #fca5a5', padding: '0.75rem',
                          fontSize: '0.85rem', color: '#991b1b',
                        }}>
                          {error}
                        </div>
                      )}

                      {success && (
                        <div style={{
                          background: '#dcfce7', borderRadius: '0.6rem',
                          border: '1px solid #86efac', padding: '0.75rem',
                          fontSize: '0.85rem', color: '#166534', fontWeight: 600,
                        }}>
                          ✓ {success}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={sending}
                        style={{
                          width: '100%',
                          background: sending ? '#94a3b8' : 'linear-gradient(135deg, #1c8a86, #2b3a8c)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '0.75rem',
                          padding: '0.85rem 1rem',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          cursor: sending ? 'not-allowed' : 'pointer',
                          transition: 'all 200ms',
                        }}
                      >
                        {sending ? 'Enviando...' : 'Reportar pago'}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Link a mis órdenes */}
              <Link href="/cuenta/ordenes" style={{
                display: 'block',
                textAlign: 'center',
                background: '#ffffff',
                color: '#374151',
                borderRadius: '0.85rem',
                padding: '0.75rem 1rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                border: '1px solid #e2e8f0',
              }}>
                Ver mis órdenes
              </Link>
            </div>

          </div>
        )}

      </section>
    </main>
  )
}