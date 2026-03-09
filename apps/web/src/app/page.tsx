import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-medium text-slate-500">
            Marketplace
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Compra y vende en un solo lugar
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Explora categorías, revisa productos y publica tu catálogo.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/productos"
            className="rounded-xl bg-slate-900 px-5 py-3 text-white"
          >
            Ver productos
          </Link>

          <Link
            href="/categorias"
            className="rounded-xl border border-slate-300 px-5 py-3"
          >
            Ver categorías
          </Link>
        </div>
      </section>
    </main>
  )
}