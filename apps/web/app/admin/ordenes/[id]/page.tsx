'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type Comprador = {
  id: string
  email: string
  nombre: string | null
  apellido: string | null
  telefono?: string | null
}

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
  comprador: Comprador
  items: OrdenItem[]
  reservas: Reserva[]
  pago: Pago | null
}

function Badge({ text, type }: { text: string; type: 'success' | 'warning' | 'error' | 'neutral' }) {
  const styles = {
    success: { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' },
    warning: { background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' },
    error:   { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
    neutral: { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' },
  }

  return (
    <span style={{
      ...styles[type],
      borderRadius: '999px',
      padding: '0.25rem 0.85rem',
      fontSize: '0.78rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase' as const,
    }}>
      {text}
    </span>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
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
          {title}
        </h2>
      </div>
      <div style={{ padding: '1.5rem' }}>
        {children}
      </div>
    </div>
  )
}

function InfoGrid({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
      {items.map((item) => (
        <div key={item.label}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
            {item.label}
          </p>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}

export default function AdminOrdenDetallePage() {
  const params = useParams<{ id: string }>()
  const orderId = params?.id
  const [order, setOrder] = useState<Orden | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true)
        const token = localStorage.getItem('accessToken')
        if (!token) throw new Error('Debes iniciar sesión')

        const response = await fetch(`/api/orders/admin/all/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.message || 'No se pudo cargar la orden')
        }

        setOrder(await response.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando la orden')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) loadOrder()
  }, [orderId])

  if (loading) {
    return (
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <p style={{ color: '#64748b' }}>Cargando orden...</p>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ background: '#fee2e2', borderRadius: '1rem', padding: '1rem 1.5rem', color: '#991b1b' }}>
          {error || 'Orden no encontrada'}
        </div>
      </main>
    )
  }

  const meta = order.pago?.externalMeta
  const revision = meta?.revision
  const estadoOrdenType = order.estado === 'PAGADA' ? 'success'
    : order.estado === 'CANCELADA' ? 'error'
    : order.estado === 'CREADA' ? 'warning' : 'neutral'
  const estadoPagoType = order.pago?.estado === 'APROBADO' ? 'success'
    : order.pago?.estado === 'RECHAZADO' ? 'error'
    : order.pago?.estado === 'PENDIENTE' ? 'warning' : 'neutral'

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href="/admin/ordenes" style={{
            fontSize: '0.85rem', color: '#64748b', display: 'inline-flex',
            alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem'
          }}>
            ← Volver a órdenes
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Detalle de orden
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem',
            fontFamily: 'monospace' }}>
            {order.id}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge text={order.estado} type={estadoOrdenType} />
          {order.pago && (
            <Badge text={order.pago.estado} type={estadoPagoType} />
          )}
        </div>
      </div>

      {/* Layout 2 columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Columna izquierda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Resumen */}
          <Card title="Resumen">
            <InfoGrid items={[
              { label: 'Fecha', value: new Date(order.creadoEn).toLocaleString() },
              { label: 'Moneda', value: order.moneda },
              { label: 'Subtotal', value: `${order.moneda} ${Number(order.subtotal).toFixed(2)}` },
              { label: 'Total', value: `${order.moneda} ${Number(order.total).toFixed(2)}` },
            ]} />
          </Card>

          {/* Comprador */}
          <Card title="Comprador">
            <InfoGrid items={[
              { label: 'Nombre', value: `${order.comprador.nombre ?? ''} ${order.comprador.apellido ?? ''}`.trim() || 'No registrado' },
              { label: 'Correo', value: order.comprador.email },
              { label: 'Teléfono', value: order.comprador.telefono ?? 'No registrado' },
              { label: 'ID', value: <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{order.comprador.id}</span> },
            ]} />
          </Card>

          {/* Productos */}
          <Card title={`Productos (${order.items.length})`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {order.items.map((item) => (
                <div key={item.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#f8fafc', borderRadius: '0.75rem', padding: '1rem',
                  border: '1px solid #f1f5f9',
                }}>
                  <div>
                    <p style={{ fontWeight: 600, color: '#1e293b', margin: '0 0 0.25rem' }}>
                      {item.tituloSnapshot}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                      SKU: {item.skuSnapshot ?? 'N/A'} · Cantidad: {item.cantidad}
                    </p>
                  </div>
                  <p style={{ fontWeight: 700, color: '#0f172a', margin: 0, whiteSpace: 'nowrap' }}>
                    {item.monedaSnapshot} {Number(item.precioUnitarioSnapshot).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Pago reportado */}
          <Card title="Pago reportado">
            {order.pago ? (
              <>
                <InfoGrid items={[
                  { label: 'Referencia', value: meta?.referencia || 'No registrada' },
                  { label: 'Método', value: meta?.metodo || 'No registrado' },
                  { label: 'Observación cliente', value: meta?.observacion || 'Sin observación' },
                  { label: 'Reportado en', value: meta?.reportadoEn ? new Date(meta.reportadoEn).toLocaleString() : 'No reportado' },
                ]} />

                {revision && (
                  <div style={{
                    marginTop: '1.25rem', paddingTop: '1.25rem',
                    borderTop: '1px solid #f1f5f9',
                  }}>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                      Revisión admin
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {revision.estado && (
                        <Badge
                          text={revision.estado}
                          type={revision.estado === 'APROBADO' ? 'success' : 'error'}
                        />
                      )}
                      {revision.revisadoEn && (
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                          {new Date(revision.revisadoEn).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {revision.observacion && (
                      <p style={{ marginTop: '0.5rem', fontSize: '0.88rem', color: '#475569' }}>
                        {revision.observacion}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p style={{ color: '#94a3b8', margin: 0 }}>Sin pago asociado.</p>
            )}
          </Card>

          {/* Reservas */}
          <Card title={`Reservas (${order.reservas.length})`}>
            {order.reservas.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {order.reservas.map((reserva) => (
                  <div key={reserva.id} style={{
                    background: '#f8fafc', borderRadius: '0.75rem', padding: '1rem',
                    border: `1px solid ${reserva.liberadoEn ? '#bbf7d0' : '#fde68a'}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: '0.5rem',
                  }}>
                    <div>
                      <p style={{ fontSize: '0.78rem', fontFamily: 'monospace',
                        color: '#64748b', margin: '0 0 0.25rem' }}>
                        Variante: {reserva.varianteId}
                      </p>
                      <p style={{ fontSize: '0.88rem', color: '#1e293b', margin: 0 }}>
                        Cantidad: <strong>{reserva.cantidad}</strong> ·{' '}
                        Creada: {new Date(reserva.creadoEn).toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      text={reserva.liberadoEn ? 'Liberada' : 'Activa'}
                      type={reserva.liberadoEn ? 'success' : 'warning'}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#94a3b8', margin: 0 }}>Sin reservas.</p>
            )}
          </Card>

        </div>

        {/* Sidebar derecha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Totales */}
          <div style={{
            background: '#ffffff', borderRadius: '1.25rem',
            border: '1px solid #e2e8f0', overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#374151', margin: 0 }}>
                Totales
              </h2>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Subtotal', value: `${order.moneda} ${Number(order.subtotal).toFixed(2)}` },
                { label: 'Comisión', value: `${order.moneda} ${Number(order.comision).toFixed(2)}` },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between',
                  fontSize: '0.9rem', color: '#64748b' }}>
                  <span>{row.label}</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>{row.value}</span>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                borderTop: '2px solid #f1f5f9', paddingTop: '0.75rem',
                fontSize: '1.05rem', fontWeight: 800, color: '#0f172a',
              }}>
                <span>Total</span>
                <span>{order.moneda} {Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <Link href="/admin/pagos" style={{
            display: 'block', textAlign: 'center',
            background: 'linear-gradient(135deg, #1c8a86, #2b3a8c)',
            color: '#ffffff', borderRadius: '0.85rem',
            padding: '0.85rem 1rem', fontWeight: 700, fontSize: '0.9rem',
          }}>
            Ir a pagos admin
          </Link>

          <Link href="/admin/ordenes" style={{
            display: 'block', textAlign: 'center',
            background: '#ffffff', color: '#374151',
            borderRadius: '0.85rem', padding: '0.75rem 1rem',
            fontWeight: 600, fontSize: '0.9rem',
            border: '1px solid #e2e8f0',
          }}>
            ← Volver a órdenes
          </Link>

        </div>
      </div>
    </main>
  )
}