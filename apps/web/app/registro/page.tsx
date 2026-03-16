'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegistroPage() {
  const router = useRouter()

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isEmailValid = /^\S+@\S+\.\S+$/.test(email)
  const isPasswordValid = password.length >= 8
  const passwordsMatch = password === confirmPassword
  const canSubmit = isEmailValid && isPasswordValid && passwordsMatch && !loading

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

    if (!passwordsMatch) {
      setError('Las contrasenas no coinciden.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          telefono: telefono.trim() || undefined,
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      if (!response.ok) {
        const message = await parseApiError(response, 'No se pudo registrar la cuenta.')
        throw new Error(message)
      }

      const data = await response.json()

      localStorage.setItem('accessToken', data.accessToken)

      router.push('/cuenta')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page-shell">
      <section className="auth-card auth-card-wide">
        <header className="auth-card-header">
          <p className="auth-eyebrow">Comienza ahora</p>
          <h1>Crear cuenta</h1>
          <p>Registra tus datos para comprar, seguir pedidos y gestionar tu perfil.</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-grid">
            <div className="auth-field">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                autoComplete="given-name"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="apellido">Apellido</label>
              <input
                id="apellido"
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Tu apellido"
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="telefono">Telefono (opcional)</label>
            <input
              id="telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="300 000 0000"
              autoComplete="tel"
            />
          </div>

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

          <div className="auth-grid">
            <div className="auth-field">
              <label htmlFor="password">Contrasena</label>
              <div className="auth-password-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimo 8 caracteres"
                  autoComplete="new-password"
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

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirmar contrasena</label>
              <div className="auth-password-wrap">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contrasena"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-toggle"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                >
                  {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch ? (
                <small>Las contrasenas no coinciden.</small>
              ) : null}
            </div>
          </div>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" disabled={!canSubmit} className="auth-submit">
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <footer className="auth-footer">
          <span>Ya tienes cuenta?</span>
          <Link href="/login">Iniciar sesion</Link>
        </footer>
      </section>
    </main>
  )
}