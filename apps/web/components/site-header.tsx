
import Link from 'next/link'
import AuthNav from './auth-nav'

export default function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold">
          Marketplace
        </Link>

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-slate-700 hover:text-slate-950">
              Inicio
            </Link>

            <Link
              href="/categorias"
              className="text-slate-700 hover:text-slate-950"
            >
              Categorías
            </Link>

            <Link
              href="/productos"
              className="text-slate-700 hover:text-slate-950"
            >
              Productos
            </Link>

            <Link
              href="/carrito"
              className="text-slate-700 hover:text-slate-950"
            >
              Carrito
            </Link>
          </nav>

          <AuthNav />
        </div>
      </div>
    </header>
  )
}