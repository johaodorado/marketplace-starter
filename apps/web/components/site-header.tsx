
"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import AuthNav from './auth-nav'

export default function SiteHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 24)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/categorias', label: 'Categorias' },
    { href: '/productos', label: 'Productos' },
    { href: '/nosotros', label: 'Sobre Nosotros' },
    { href: '/contactos', label: 'Contacto' },
    { href: '/cuenta', label: 'Mi cuenta' },
  ]

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <button
          type="button"
          className="btn-menu"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-label="Abrir menu"
        >
          <span />
          <span />
          <span />
        </button>

        <Link className="logo" href="/" onClick={() => setMenuOpen(false)}>
          <img
            src={isScrolled ? '/img/logo/Artquarium-logo.png' : '/img/logo/Artquarium-logo-blanco.png'}
            alt="Artquarium"
          />
        </Link>

        <div className={`menu ${menuOpen ? 'open' : ''}`}>
          <ul>
            {links.map((link) => {
              const active = pathname === link.href

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={active ? 'active' : ''}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
            <li>
              <Link href="/carrito" onClick={() => setMenuOpen(false)}>
                Carrito
              </Link>
            </li>
            <li className="mobile-only">
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                Iniciar sesion
              </Link>
            </li>
            <li className="mobile-only">
              <Link href="/registro" onClick={() => setMenuOpen(false)}>
                Registrarse
              </Link>
            </li>
            <li className="mobile-only">
              <Link href="/admin/pagos" onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
            </li>
          </ul>
        </div>

        <div className="header-auth">
          <AuthNav />
        </div>
      </div>
    </header>
  )
}