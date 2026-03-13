'use client'

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

  useEffect(() => {
    async function loadPaymentInfo() {
      try {
        setLoading(true)
        setError('')

        const token = localStorage.getItem('accessToken')

        if (!token) {
          throw new Error('Debes iniciar sesión')
        }

        const response = await fetch(
          `http://localhost:3000/api/payments/manual/${orderId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error?.message || data?.message || 'No se pudo cargar el pago')
        }

        const data = await response.json()
        setInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando pago')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      loadPaymentInfo()
    }
  }, [orderId])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    try {
      setSending(true)
      setError('')
      setSuccess('')

      const token = localStorage.getItem('accessToken')

      if (!token) {
        throw new Error('Debes iniciar sesión')
      }

      const response = await fetch(
        `http://localhost:3000/api/payments/manual/${orderId}/report`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            referencia,
            observacion,
          }),
        },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error?.message || data?.message || 'No se pudo reportar el pago')
      }

      const data = await response.json()
      setSuccess(data.message || 'Pago reportado correctamente')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reportando pago')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="mb-6 text-3xl font-bold">Pago manual</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          Cargando datos de pago...
        </div>
      </main>
    )
  }

  if (error && !info) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="mb-6 text-3xl font-bold">Pago manual</h1>
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-red-600">
          {error}
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold">Pago manual</h1>

      {info ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold">Datos para transferir</h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Orden</p>
                <p className="font-medium">{info.orderId}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Monto</p>
                <p className="font-medium">
                  {info.moneda} {info.monto}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Banco</p>
                <p className="font-medium">{info.banco}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Tipo de cuenta</p>
                <p className="font-medium">{info.tipoCuenta}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Número de cuenta</p>
                <p className="font-medium">{info.numeroCuenta ?? 'Pendiente'}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Titular</p>
                <p className="font-medium">{info.titular}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Identificación</p>
                <p className="font-medium">{info.identificacion}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Estado de la orden</p>
                <p className="font-medium">{info.estadoOrden}</p>
              </div>
            </div>

            <p className="mt-6 rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
              {info.instrucciones}
            </p>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold">Reportar pago</h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Referencia
                </label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                  placeholder="Ej. TRANSFER-001"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Observación
                </label>
                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
                  placeholder="Ej. Pago realizado desde banca móvil"
                />
              </div>

              {error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : null}

              {success ? (
                <p className="text-sm text-green-600">{success}</p>
              ) : null}

              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-white disabled:opacity-60"
              >
                {sending ? 'Enviando...' : 'Reportar pago'}
              </button>
            </form>
          </aside>
        </div>
      ) : null}
    </main>
  )
}