import { apiFetch } from '../../lib/api'

type Categoria = {
  id: string
  nombre: string
  slug: string
  activa: boolean
}

export default async function CategoriasPage() {
  const categorias = await apiFetch<Categoria[]>('/categories')

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold">Categorías</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categorias.map((categoria: Categoria) => (
          <article
            key={categoria.id}
            className="rounded-2xl border border-slate-200 p-5"
          >
            <h2 className="text-xl font-semibold">{categoria.nombre}</h2>
            <p className="mt-2 text-sm text-slate-500">{categoria.slug}</p>
            <p className="mt-2 text-sm text-slate-400">
              {categoria.activa ? 'Activa' : 'Inactiva'}
            </p>
          </article>
        ))}
      </div>
    </main>
  )
}