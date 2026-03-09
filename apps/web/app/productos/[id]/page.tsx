import { apiFetch } from 'lib/api'

type ImagenProducto = {
  id: string
  url: string
  orden: number
}

type Variante = {
  id: string
  nombre: string
  sku: string | null
  precio: number | null
  stock: number
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
  variantes: Variante[]
  categoria: Categoria | null
  vendedor: Vendedor
}

export default async function ProductoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const producto = await apiFetch<Producto>(`/products/${id}`)

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2">
      <div className="space-y-4">
        <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
          {producto.imagenes[0]?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={producto.imagenes[0].url}
              alt={producto.titulo}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
      </div>

      <div>
        <p className="text-sm text-slate-500">
          {producto.categoria?.nombre ?? 'Sin categoría'}
        </p>

        <h1 className="mt-2 text-3xl font-bold">{producto.titulo}</h1>

        <p className="mt-4 text-slate-600">{producto.descripcion}</p>

        <p className="mt-6 text-2xl font-bold">
          {producto.moneda} {producto.precioBase}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Vendedor: {producto.vendedor.nombreTienda}
        </p>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Variantes</h2>

          <div className="mt-4 space-y-3">
            {producto.variantes.map((variante) => (
              <div
                key={variante.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <p className="font-medium">{variante.nombre}</p>
                <p className="text-sm text-slate-500">SKU: {variante.sku ?? 'N/A'}</p>
                <p className="text-sm text-slate-500">Stock: {variante.stock}</p>
                <p className="text-sm font-semibold">
                  Precio: {producto.moneda} {variante.precio ?? producto.precioBase}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}