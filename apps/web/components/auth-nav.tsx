'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const AUTH_CHANGED_EVENT = 'auth-changed'

export default function AuthNav() {
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    async function loadSession() {
      setMounted(true)
      const token = localStorage.getItem('accessToken')

      if (!token) {
        setIsLoggedIn(false)
        return
      }

      try {
        const response = await fetch('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          setIsLoggedIn(false)
          return
        }

        setIsLoggedIn(true)
      } catch {
        setIsLoggedIn(false)
      }
    }

    loadSession()

    const onAuthChanged = () => {
      void loadSession()
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === 'accessToken') {
        void loadSession()
      }
    }

    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged)
    window.addEventListener('storage', onStorage)

    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onEscape)

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onEscape)
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('accessToken')
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
    setIsLoggedIn(false)
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  if (!mounted) {
    return (
      <div className="auth-nav">
        <div className="auth-skeleton" />
        <div className="auth-skeleton auth-skeleton-solid" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="auth-nav">
        <Link href="/login" className="auth-link auth-link-ghost">
          Iniciar sesión
        </Link>

        <Link href="/registro" className="auth-link auth-link-solid">
          Registrarse
        </Link>
      </div>
    )
  }

  return (
    <div className="auth-nav" ref={menuRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="auth-link auth-link-ghost"
        >
          Mi cuenta
        </button>

        {menuOpen ? (
          <div className="absolute right-0 top-full z-20 mt-3 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-3xl bg-white shadow-2xl"
            style={{ 
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.8)'
            }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              padding: '1.75rem 1.75rem',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative blur background */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <div style={{
                  fontSize: '1.25rem',
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>U</div>
                <div>
                  <p style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '0.25rem', letterSpacing: '0.5px', fontWeight: 600, textTransform: 'uppercase' }}>Mi cuenta</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.3px' }}>Bienvenido</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div style={{ padding: '1rem' }}>
              <Link
                href="/cuenta"
                className="block px-4 py-3 text-sm rounded-2xl transition-all duration-200"
                style={{
                  marginBottom: '0.5rem',
                  color: '#1a1a1a',
                  fontWeight: 500,
                  letterSpacing: '0.3px',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = 'linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(45, 212, 191, 0.1))';
                  (e.target as HTMLElement).style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'transparent';
                  (e.target as HTMLElement).style.transform = 'translateX(0)';
                }}
                onClick={() => setMenuOpen(false)}
              >
                Perfil
              </Link>


              <Link
                href="/cuenta/ordenes"
                className="block px-4 py-3 text-sm rounded-2xl transition-all duration-200"
                style={{
                  marginBottom: '0.5rem',
                  color: '#1a1a1a',
                  fontWeight: 500,
                  letterSpacing: '0.3px',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = 'linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(45, 212, 191, 0.1))';
                  (e.target as HTMLElement).style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'transparent';
                  (e.target as HTMLElement).style.transform = 'translateX(0)';
                }}
                onClick={() => setMenuOpen(false)}
              >
                Mis órdenes
              </Link>

              <Link
                href="/carrito"
                className="block px-4 py-3 text-sm rounded-2xl transition-all duration-200"
                style={{
                  marginBottom: '0.5rem',
                  color: '#1a1a1a',
                  fontWeight: 500,
                  letterSpacing: '0.3px',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = 'linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(45, 212, 191, 0.1))';
                  (e.target as HTMLElement).style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'transparent';
                  (e.target as HTMLElement).style.transform = 'translateX(0)';
                }}
                onClick={() => setMenuOpen(false)}
              >
                Carrito
              </Link>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)' }} />

            {/* Footer */}
            <div style={{ padding: '0.5rem 1rem 1rem' }}>
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="block w-full px-4 py-3 text-base rounded-2xl transition-all duration-200"
                style={{
                  color: '#ffffff',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #d32f2f, #c62828)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  letterSpacing: '0.3px'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.boxShadow = '0 12px 30px rgba(211, 47, 47, 0.35)';
                  (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.boxShadow = 'none';
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}