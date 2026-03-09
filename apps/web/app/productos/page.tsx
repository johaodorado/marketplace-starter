import Link from 'next/link'
import { apiFetch } from 'lib/api'

type ImagenProducto = {
  id: string
  url: string
  orden: number
}

type Categoria = {
  id: string
  nombre: string
  slug: string
}

type Vendedor = {
  id: string
  nombreTienda: string
  estado: string
}

type Producto = {
  id: string
  titulo: string
  descripcion: string
  precioBase: number
  moneda: string
  imagenes: ImagenProducto[]
  categoria: Categoria | null
  vendedor: Vendedor
}

export default async function ProductosPage() {
  const productos = await apiFetch<Producto[]>('/products')

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold">Productos</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {productos.map((producto) => (
          <article
            key={producto.id}
            className="overflow-hidden rounded-2xl border border-slate-200"
          >
            <div className="aspect-[4/3] bg-slate-100">
              {producto.imagenes[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={producto.imagenes[0].url}
                  alt={producto.titulo}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>

            <div className="p-5">
              <p className="text-sm text-slate-500">
                {producto.categoria?.nombre ?? 'Sin categoría'}
              </p>

              <h2 className="mt-1 text-xl font-semibold">{producto.titulo}</h2>

              <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                {producto.descripcion}
              </p>

              <p className="mt-4 text-lg font-bold">
                {producto.moneda} {producto.precioBase}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Vendedor: {producto.vendedor.nombreTienda}
              </p>

              <Link
                href={`/productos/${producto.id}`}
                className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-white"
              >
                Ver detalle
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}