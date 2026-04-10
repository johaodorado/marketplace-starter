'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const AUTH_CHANGED_EVENT = 'auth-changed'

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
        setLoading(true)
        setError('')
        const token = localStorage.getItem('accessToken')

        if (!token) {
          setUser(null)
          setError('No has iniciado sesión')
          setLoading(false)
          return
        }

        const response = await fetch('/api/users/me', {
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
        setUser(null)
        setError(err instanceof Error ? err.message : 'Error al cargar perfil')
      } finally {
        setLoading(false)
      }
    }

    void loadProfile()

    const onAuthChanged = () => {
      void loadProfile()
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === 'accessToken') {
        void loadProfile()
      }
    }

    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged)
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('accessToken')
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
    setUser(null)
  }

  return (
    <main className="page">
      <section className="page-title-section">
        <h1>Mi cuenta</h1>
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
              <p>Cargando perfil...</p>
            </div>
          ) : error ? (
            <div style={{
              borderRadius: '1.5rem',
              border: '2px solid #ef5350',
              background: '#ffffff',
              padding: '1.5rem',
              boxShadow: 'var(--sombra-suave)'
            }}>
              <p style={{ color: '#d32f2f', fontWeight: 500 }}>{error}</p>
            </div>
          ) : user ? (
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <section style={{
                borderRadius: '2rem',
                border: '1px solid var(--color-border)',
                background: '#ffffff',
                padding: '2rem',
                boxShadow: 'var(--sombra-media)'
              }}>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                  <div>
                    <div style={{
                      display: 'inline-flex',
                      borderRadius: '999px',
                      paddingLeft: '0.75rem',
                      paddingRight: '0.75rem',
                      paddingTop: '0.35rem',
                      paddingBottom: '0.35rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      background: 'var(--gradient-brand)',
                      marginBottom: '0.75rem'
                    }}>
                      Perfil
                    </div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.5rem' }}>
                      Datos personales
                    </h2>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: '#627a84', maxWidth: '90%' }}>
                      Información principal de tu cuenta.
                    </p>
                  </div>

                  <span style={{
                    borderRadius: '999px',
                    paddingLeft: '0.75rem',
                    paddingRight: '0.75rem',
                    paddingTop: '0.35rem',
                    paddingBottom: '0.35rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    background: 'var(--color-primary)'
                  }}>
                    {user.rol}
                  </span>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 mt-6">
                  <div style={{
                    borderRadius: '1rem',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-soft)',
                    padding: '1.1rem',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                  }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#667780' }}>
                      Nombre
                    </p>
                    <p style={{ marginTop: '0.75rem', fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text)' }}>
                      {user.nombre ?? 'No registrado'}
                    </p>
                  </div>

                  <div style={{
                    borderRadius: '1rem',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-soft)',
                    padding: '1.1rem',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                  }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#667780' }}>
                      Apellido
                    </p>
                    <p style={{ marginTop: '0.75rem', fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text)' }}>
                      {user.apellido ?? 'No registrado'}
                    </p>
                  </div>

                  <div style={{
                    borderRadius: '1rem',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-soft)',
                    padding: '1.1rem',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                  }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#667780' }}>
                      Correo
                    </p>
                    <p style={{ marginTop: '0.75rem', fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text)', wordBreak: 'break-all' }}>
                      {user.email}
                    </p>
                  </div>

                  <div style={{
                    borderRadius: '1rem',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-soft)',
                    padding: '1.1rem',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                  }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#667780' }}>
                      Teléfono
                    </p>
                    <p style={{ marginTop: '0.75rem', fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text)' }}>
                      {user.telefono ?? 'No registrado'}
                    </p>
                  </div>
                </div>
              </section>

              <aside className="space-y-6">
                <section style={{
                  borderRadius: '2rem',
                  border: '1px solid var(--color-border)',
                  background: '#ffffff',
                  padding: '1.75rem',
                  boxShadow: 'var(--sombra-media)'
                }}>
                  <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    Accesos rápidos
                  </h3>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: '#667780' }}>
                    Ir a pedidos o revisar carrito.
                  </p>

                  <div className="mt-5 space-y-3">
                    <Link
                      href="/cuenta/ordenes"
                      style={{
                        display: 'block',
                        borderRadius: '999px',
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                        paddingTop: '0.875rem',
                        paddingBottom: '0.875rem',
                        textAlign: 'center',
                        fontWeight: 700,
                        color: '#ffffff',
                        background: 'var(--color-secondary)',
                        boxShadow: '0 2px 8px rgba(28, 138, 134, 0.2)',
                        transition: 'all 200ms ease',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => {
                        (e.target as HTMLElement).style.background = 'var(--color-secondary-700)';
                        (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(28, 138, 134, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        (e.target as HTMLElement).style.background = 'var(--color-secondary)';
                        (e.target as HTMLElement).style.boxShadow = '0 2px 8px rgba(28, 138, 134, 0.2)';
                      }}
                    >
                      Mis órdenes
                    </Link>

                    <Link
                      href="/carrito"
                      style={{
                        display: 'block',
                        borderRadius: '999px',
                        border: '2px solid var(--color-border)',
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                        paddingTop: '0.75rem',
                        paddingBottom: '0.75rem',
                        textAlign: 'center',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        background: '#ffffff',
                        transition: 'all 200ms ease',
                        cursor: 'pointer'
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
                      Carrito
                    </Link>
                  </div>
                </section>

                <section style={{
                  borderRadius: '2rem',
                  border: '1px solid var(--color-border)',
                  background: '#ffffff',
                  padding: '1.75rem',
                  boxShadow: 'var(--sombra-media)'
                }}>
                  <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    Sesión
                  </h3>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: '#667780' }}>
                    Sal de tu cuenta cuando termines.
                  </p>

                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      marginTop: '1.25rem',
                      width: '100%',
                      borderRadius: '999px',
                      border: '2px solid var(--color-border)',
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                      paddingTop: '0.75rem',
                      paddingBottom: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                      background: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 200ms ease'
                    }}
                    onMouseOver={(e) => {
                        (e.target as HTMLElement).style.background = 'var(--color-background)';
                        (e.target as HTMLElement).style.borderColor = '#dc2626';
                        (e.target as HTMLElement).style.color = '#dc2626';
                    }}
                    onMouseOut={(e) => {
                        (e.target as HTMLElement).style.background = '#ffffff';
                        (e.target as HTMLElement).style.borderColor = 'var(--color-border)';
                        (e.target as HTMLElement).style.color = 'var(--color-text)';
                    }}
                  >
                    Cerrar sesión
                  </button>
                </section>
              </aside>

              {user?.rol === 'ADMIN' ? (
                <section style={{
                  borderRadius: '2rem',
                  border: '1px solid var(--color-border)',
                  background: '#ffffff',
                  padding: '1.75rem',
                  boxShadow: 'var(--sombra-media)',
                  gridColumn: '1 / -1'
                }}>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      Administración
                    </h3>
                    <span style={{
                      borderRadius: '999px',
                      paddingLeft: '0.75rem',
                      paddingRight: '0.75rem',
                      paddingTop: '0.35rem',
                      paddingBottom: '0.35rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      background: 'var(--color-secondary)'
                    }}>
                      Panel admin
                    </span>
                  </div>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: '#667780', marginBottom: '1.25rem' }}>
                    Accede a las herramientas de gestión del marketplace.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/admin/pagos"
                      style={{
                        borderRadius: '999px',
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                        paddingTop: '0.625rem',
                        paddingBottom: '0.625rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        background: 'var(--color-primary)',
                        boxShadow: '0 2px 8px rgba(43, 58, 140, 0.2)',
                        transition: 'all 200ms ease',
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
                      Pagos admin
                    </Link>

                    <Link
                      href="/admin/ordenes"
                      style={{
                        borderRadius: '999px',
                        border: '2px solid var(--color-border)',
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                        paddingTop: '0.5rem',
                        paddingBottom: '0.5rem',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        background: '#ffffff',
                        transition: 'all 200ms ease',
                        cursor: 'pointer',
                        display: 'inline-block'
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
                      Órdenes admin
                    </Link>

                    <Link
                      href="/admin/productos"
                      style={{
                        borderRadius: '999px',
                        border: '2px solid var(--color-border)',
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                        paddingTop: '0.5rem',
                        paddingBottom: '0.5rem',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        background: '#ffffff',
                        transition: 'all 200ms ease',
                        cursor: 'pointer',
                        display: 'inline-block'
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
                      Productos admin
                    </Link>
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}