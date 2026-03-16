'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type Usuario = {
  id: string
  email: string
  nombre: string | null
  apellido: string | null
  telefono: string | null
  rol: string
}

export default function CuentaPage() {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem('accessToken')

        if (!token) {
          setError('No has iniciado sesión')
          setLoading(false)
          return
        }

        const response = await fetch('http://localhost:3000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('No se pudo cargar tu perfil')
        }

        const data = await response.json()
        setUser(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar perfil')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold">Mi cuenta</h1>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p>Cargando perfil...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <p className="text-red-600">{error}</p>
        </div>
      ) : user ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Nombre</p>
                <p className="font-medium">{user.nombre ?? 'No registrado'}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Apellido</p>
                <p className="font-medium">{user.apellido ?? 'No registrado'}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Correo</p>
                <p className="font-medium">{user.email}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Teléfono</p>
                <p className="font-medium">{user.telefono ?? 'No registrado'}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Rol</p>
                <p className="font-medium">{user.rol}</p>
              </div>
            </div>
          </div>

          <section className="account-shortcut-card">
            <h2>Órdenes</h2>
            <p>Revisa el estado de tus compras y completa pagos pendientes.</p>
            <div className="account-shortcut-actions">
              <Link href="/cuenta/ordenes" className="account-link-btn">
                Ver mis órdenes
              </Link>
            </div>
          </section>

          {user.rol === 'ADMIN' ? (
            <section className="account-shortcut-card">
              <h2>Administración</h2>
              <p>Gestiona pagos y monitorea las órdenes del marketplace.</p>
              <div className="account-shortcut-actions">
                <Link href="/admin/pagos" className="account-link-btn">
                  Pagos admin
                </Link>
                <Link href="/admin/ordenes" className="account-link-btn account-link-btn-soft">
                  Ordenes admin
                </Link>
              </div>
            </section>
          ) : null}
          </div>
      ) : null}
    </main>
  )
}