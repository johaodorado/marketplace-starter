'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isEmailValid = /^\S+@\S+\.\S+$/.test(email)
  const isPasswordValid = password.length >= 8
  const canSubmit = isEmailValid && isPasswordValid && !loading

  async function parseApiError(response: Response, fallback: string) {
    try {
      const data = await response.json()
      const message = data?.message

      if (Array.isArray(message)) {
        return message.join(' ')
      }

      if (typeof message === 'string' && message.trim().length > 0) {
        return message
      }
    } catch {
      // Ignore parsing error and use fallback message.
    }

    return fallback
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!isEmailValid) {
      setError('Ingresa un correo valido.')
      return
    }

    if (!isPasswordValid) {
      setError('La contrasena debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      if (!response.ok) {
        const message = await parseApiError(response, 'Credenciales invalidas.')
        throw new Error(message)
      }

      const data = await response.json()

      localStorage.setItem('accessToken', data.accessToken)

      router.push('/cuenta')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page-shell">
      <section className="auth-card">
        <header className="auth-card-header">
          <p className="auth-eyebrow">Bienvenido de nuevo</p>
          <h1>Iniciar sesion</h1>
          <p>Accede para ver tu cuenta, tus pedidos y el estado de tus compras.</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              required
            />
            {email.length > 0 && !isEmailValid ? (
              <small>Usa un formato de correo valido.</small>
            ) : null}
          </div>

          <div className="auth-field">
            <label htmlFor="password">Contrasena</label>
            <div className="auth-password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contrasena"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="auth-toggle"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {password.length > 0 && !isPasswordValid ? (
              <small>Minimo 8 caracteres.</small>
            ) : null}
          </div>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" disabled={!canSubmit} className="auth-submit">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <footer className="auth-footer">
          <span>No tienes cuenta?</span>
          <Link href="/registro">Crear cuenta</Link>
        </footer>
      </section>
    </main>
  )
}