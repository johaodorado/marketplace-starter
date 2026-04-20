'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const AUTH_CHANGED_EVENT = 'auth-changed'

type Usuario = {
  id: string
  email: string
  nombre: string | null
  apellido: string | null
  telefono: string | null
  rol: string
}

function DataCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      borderRadius: '0.85rem', border: '1px solid #e2e8f0',
      background: '#f8fafc', padding: '0.9rem 1.1rem',
    }}>
      <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const,
        letterSpacing: '0.1em', color: '#94a3b8', margin: '0 0 0.3rem' }}>
        {label}
      </p>
      <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', margin: 0, wordBreak: 'break-all' as const }}>
        {value || 'No registrado'}
      </p>
    </div>
  )
}

const adminLinks = [
  { href: '/admin/pagos',     label: 'Pagos',     icon: '💳', desc: 'Revisar y aprobar pagos' },
  { href: '/admin/ordenes',   label: 'Órdenes',   icon: '📦', desc: 'Ver todas las órdenes' },
  { href: '/admin/productos', label: 'Productos', icon: '🛍️', desc: 'Gestionar catálogo' },
]

const quickLinks = [
  { href: '/cuenta/ordenes', label: 'Mis órdenes',   icon: '📋', primary: true },
  { href: '/carrito',        label: 'Mi carrito',    icon: '🛒', primary: false },
  { href: '/productos',      label: 'Ver productos', icon: '🔍', primary: false },
]

export default function CuentaPage() {
  const router = useRouter()
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        setError('')
        const token = localStorage.getItem('accessToken')
        if (!token) { setUser(null); setError('No has iniciado sesión'); return }
        const res = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('No se pudo cargar tu perfil')
        setUser(await res.json())
      } catch (err) {
        setUser(null)
        setError(err instanceof Error ? err.message : 'Error al cargar perfil')
      } finally {
        setLoading(false)
      }
    }
    void loadProfile()
    const onAuthChanged = () => void loadProfile()
    const onStorage = (e: StorageEvent) => { if (e.key === 'accessToken') void loadProfile() }
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
    router.push('/')
  }

  return (
    <main style={{ paddingTop: 'var(--header-height)', minHeight: '100vh', background: 'var(--gradient-soft)' }}>

      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1c8a86 0%, #2b3a8c 60%, #5a3fa3 100%)',
        padding: '1.75rem 1.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px',
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
              <div>
                <div style={{ width: '140px', height: '12px', borderRadius: '999px', background: 'rgba(255,255,255,0.2)', marginBottom: '0.4rem' }} />
                <div style={{ width: '90px', height: '10px', borderRadius: '999px', background: 'rgba(255,255,255,0.12)' }} />
              </div>
            </div>
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', flexWrap: 'wrap' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', flexShrink: 0,
              }}>
                {(user.nombre?.[0] ?? user.email[0]).toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                  <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {user.nombre ? `${user.nombre} ${user.apellido ?? ''}`.trim() : 'Mi cuenta'}
                  </h1>
                  <span style={{
                    background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
                    color: '#ffffff', borderRadius: '999px', padding: '0.15rem 0.6rem',
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase' as const,
                  }}>
                    {user.rol}
                  </span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.85rem' }}>
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>Mi cuenta</h1>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.75rem 1.5rem 4rem' }}>

        {/* Error */}
        {!loading && error && (
          <div style={{
            background: '#ffffff', borderRadius: '1.25rem', border: '1px solid #fca5a5',
            padding: '1.5rem', marginBottom: '1.5rem',
          }}>
            <p style={{ color: '#dc2626', fontWeight: 600, margin: '0 0 1rem' }}>{error}</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/login" style={{
                background: 'var(--color-primary)', color: '#ffffff',
                borderRadius: '999px', padding: '0.55rem 1.25rem', fontWeight: 700, fontSize: '0.875rem',
              }}>
                Iniciar sesión
              </Link>
              <Link href="/registro" style={{
                background: '#ffffff', color: 'var(--color-text)', border: '1px solid #e2e8f0',
                borderRadius: '999px', padding: '0.5rem 1.25rem', fontWeight: 700, fontSize: '0.875rem',
              }}>
                Crear cuenta
              </Link>
            </div>
          </div>
        )}

        {user && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 270px', gap: '1.25rem', alignItems: 'start' }}>

            {/* Izquierda */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Datos personales */}
              <div style={{ background: '#ffffff', borderRadius: '1.25rem', border: '1px solid #e2e8f0',
                padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' as const,
                  letterSpacing: '0.1em', color: '#94a3b8', margin: '0 0 0.25rem' }}>
                  Perfil
                </p>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem' }}>
                  Datos personales
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1.1rem' }}>
                  Información principal de tu cuenta
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
                  <DataCard label="Nombre"   value={user.nombre ?? ''} />
                  <DataCard label="Apellido" value={user.apellido ?? ''} />
                  <DataCard label="Correo"   value={user.email} />
                  <DataCard label="Teléfono" value={user.telefono ?? ''} />
                </div>
              </div>

              {/* Panel admin */}
              {user.rol === 'ADMIN' && (
                <div style={{ background: '#ffffff', borderRadius: '1.25rem', border: '1px solid #e2e8f0',
                  padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' as const,
                        letterSpacing: '0.1em', color: '#94a3b8', margin: '0 0 0.25rem' }}>
                        Administración
                      </p>
                      <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Panel de gestión
                      </h2>
                    </div>
                    <span style={{
                      background: 'linear-gradient(135deg, #1c8a86, #2b3a8c)', color: '#ffffff',
                      borderRadius: '999px', padding: '0.2rem 0.8rem', fontSize: '0.65rem',
                      fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                    }}>
                      Admin
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.7rem' }}>
                    {adminLinks.map((link) => (
                      <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                        <div style={{ borderRadius: '1rem', border: '1px solid #e2e8f0', background: '#f8fafc',
                          padding: '1rem', transition: 'all 200ms', cursor: 'pointer' }}
                          onMouseOver={(e) => {
                            const el = e.currentTarget as HTMLElement
                            el.style.borderColor = '#1c8a86'; el.style.background = '#f0fdf9'
                            el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 4px 12px rgba(28,138,134,0.15)'
                          }}
                          onMouseOut={(e) => {
                            const el = e.currentTarget as HTMLElement
                            el.style.borderColor = '#e2e8f0'; el.style.background = '#f8fafc'
                            el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'
                          }}>
                          <p style={{ fontSize: '1.25rem', margin: '0 0 0.4rem' }}>{link.icon}</p>
                          <p style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 0.1rem', fontSize: '0.85rem' }}>
                            {link.label}
                          </p>
                          <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>{link.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar derecha */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Accesos rápidos */}
              <div style={{ background: '#ffffff', borderRadius: '1.25rem', border: '1px solid #e2e8f0',
                padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem' }}>
                  Accesos rápidos
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1rem' }}>
                  Navega rápido a lo que necesitas
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {quickLinks.map((link) => (
                    <Link key={link.href} href={link.href} style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      borderRadius: '0.85rem', padding: '0.75rem 0.9rem',
                      fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', transition: 'all 200ms',
                      background: link.primary ? 'linear-gradient(135deg, #1c8a86, #2b3a8c)' : '#f8fafc',
                      color: link.primary ? '#ffffff' : '#374151',
                      border: link.primary ? 'none' : '1px solid #e2e8f0',
                      boxShadow: link.primary ? '0 2px 8px rgba(28,138,134,0.25)' : 'none',
                    }}
                    onMouseOver={(e) => {
                      const el = e.currentTarget as HTMLElement
                      link.primary ? (el.style.boxShadow = '0 4px 14px rgba(28,138,134,0.35)')
                        : (el.style.background = '#f1f5f9')
                    }}
                    onMouseOut={(e) => {
                      const el = e.currentTarget as HTMLElement
                      link.primary ? (el.style.boxShadow = '0 2px 8px rgba(28,138,134,0.25)')
                        : (el.style.background = '#f8fafc')
                    }}>
                      <span style={{ fontSize: '0.95rem' }}>{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sesión */}
              <div style={{ background: '#ffffff', borderRadius: '1.25rem', border: '1px solid #e2e8f0',
                padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem' }}>
                  Sesión activa
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1rem' }}>
                  Cierra tu sesión cuando termines
                </p>
                <button type="button" onClick={handleLogout} style={{
                  width: '100%', border: '2px solid #fca5a5', borderRadius: '0.85rem',
                  padding: '0.72rem', fontWeight: 700, fontSize: '0.875rem',
                  color: '#dc2626', background: '#fff5f5', cursor: 'pointer', transition: 'all 200ms',
                }}
                onMouseOver={(e) => { const el = e.target as HTMLElement; el.style.background = '#fee2e2'; el.style.borderColor = '#ef4444' }}
                onMouseOut={(e) => { const el = e.target as HTMLElement; el.style.background = '#fff5f5'; el.style.borderColor = '#fca5a5' }}>
                  Cerrar sesión
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  )
}