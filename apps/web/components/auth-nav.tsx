'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthNav() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('accessToken')
    setIsLoggedIn(Boolean(token))
  }, [])

  function handleLogout() {
    localStorage.removeItem('accessToken')
    setIsLoggedIn(false)
    router.push('/')
    router.refresh()
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-24 rounded-xl border border-slate-200" />
        <div className="h-10 w-24 rounded-xl bg-slate-200" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
        >
          Iniciar sesión
        </Link>

        <Link
          href="/registro"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
        >
          Registrarse
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/cuenta"
        className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
      >
        Mi cuenta
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
      >
        Cerrar sesión
      </button>
    </div>
  )
}