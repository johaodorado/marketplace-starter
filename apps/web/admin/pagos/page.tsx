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
  createdAt?: string
  creadoEn?: string
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

      const response = await fetch('http://localhost:3000/api/payments/admin/reported', {
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
        `http://localhost:3000/api/payments/admin/${paymentId}/approve`,
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
        `http://localhost:3000/api/payments/admin/${paymentId}/reject`,
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
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold">Pagos reportados</h1>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p>Cargando pagos...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-red-600">
          <p>{error}</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-slate-600">No hay pagos reportados pendientes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <article
              key={payment.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">Pago</p>
                      <h2 className="font-semibold">{payment.id}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Orden: {payment.orden.id}
                      </p>
                    </div>

                    <div className="text-left lg:text-right">
                      <p className="text-sm text-slate-500">Monto</p>
                      <p className="text-lg font-bold">
                        {payment.moneda} {Number(payment.monto).toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-500">
                        Estado: {payment.estado}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-slate-500">Comprador</p>
                      <p className="font-medium">
                        {payment.orden.comprador.nombre ?? ''} {payment.orden.comprador.apellido ?? ''}
                      </p>
                      <p className="text-sm text-slate-500">
                        {payment.orden.comprador.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Referencia</p>
                      <p className="font-medium">
                        {payment.externalMeta?.referencia || 'No registrada'}
                      </p>
                      <p className="text-sm text-slate-500">
                        Método: {payment.externalMeta?.metodo || 'No registrado'}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-sm text-slate-500">Observación del cliente</p>
                      <p className="font-medium">
                        {payment.externalMeta?.observacion || 'Sin observación'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    {payment.orden.items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl bg-slate-50 px-4 py-3 text-sm"
                      >
                        <p className="font-medium">{item.tituloSnapshot}</p>
                        <p className="text-slate-500">Cantidad: {item.cantidad}</p>
                        <p className="text-slate-500">
                          Precio: {item.monedaSnapshot} {Number(item.precioUnitarioSnapshot).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-lg font-semibold">Acciones</h3>

                  <div className="mt-4 space-y-3">
                    <button
                      type="button"
                      onClick={() => handleApprove(payment.id)}
                      disabled={actionLoadingId === payment.id}
                      className="w-full rounded-xl bg-slate-900 px-4 py-3 text-white disabled:opacity-60"
                    >
                      {actionLoadingId === payment.id ? 'Procesando...' : 'Aprobar pago'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReject(payment.id)}
                      disabled={actionLoadingId === payment.id}
                      className="w-full rounded-xl border border-red-300 px-4 py-3 text-red-600 disabled:opacity-60"
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
    </main>
  )
}