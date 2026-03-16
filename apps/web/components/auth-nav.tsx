'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthNav() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    async function loadSession() {
      setMounted(true)
      const token = localStorage.getItem('accessToken')
      setIsLoggedIn(Boolean(token))

      if (!token) {
        setRole(null)
        return
      }

      try {
        const response = await fetch('http://localhost:3000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          setRole(null)
          return
        }

        const data = await response.json()
        setRole(typeof data?.rol === 'string' ? data.rol : null)
      } catch {
        setRole(null)
      }
    }

    loadSession()
  }, [])

  function handleLogout() {
    localStorage.removeItem('accessToken')
    setIsLoggedIn(false)
    setRole(null)
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
    <div className="auth-nav">
      <Link href="/cuenta" className="auth-link auth-link-ghost">
        Mi cuenta
      </Link>

      <Link href="/cuenta/ordenes" className="auth-link auth-link-ghost">
        Mis ordenes
      </Link>

      {role === 'ADMIN' ? (
        <Link href="/admin/pagos" className="auth-link auth-link-ghost">
          Admin
        </Link>
      ) : null}

      <button
        type="button"
        onClick={handleLogout}
        className="auth-link auth-link-solid"
      >
        Cerrar sesión
      </button>
    </div>
  )
}