import AddToCartButton from '../../../components/add-to-cart-button'
import { apiFetch } from '../../../lib/api'

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

type Producto = {
  id: string
  titulo: string
  descripcion: string
  precioBase: number
  moneda: string
  imagenes: ImagenProducto[]
  variantes: Variante[]
  categoria: Categoria | null
}

export default async function ProductoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const producto = await apiFetch<Producto>(`/products/${id}`)

  const mainImage = producto.imagenes[0]?.url ?? null

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2">
      <div className="space-y-4">
        <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
          {mainImage ? (
            <img
              src={mainImage}
              alt={producto.titulo}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Sin imagen
            </div>
          )}
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

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Variantes</h2>

          <div className="mt-4 space-y-3">
            {producto.variantes.length > 0 ? (
              producto.variantes.map((variante: Variante) => {
                const precioFinal = variante.precio ?? producto.precioBase

                return (
                  <div
                    key={variante.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="font-medium">{variante.nombre}</p>
                    <p className="text-sm text-slate-500">
                      SKU: {variante.sku ?? 'N/A'}
                    </p>
                    <p className="text-sm text-slate-500">
                      Stock: {variante.stock}
                    </p>
                    <p className="text-sm font-semibold">
                      Precio: {producto.moneda} {precioFinal}
                    </p>

                    <AddToCartButton
                      productId={producto.id}
                      variantId={variante.id}
                      titulo={producto.titulo}
                      varianteNombre={variante.nombre}
                      precio={precioFinal}
                      moneda={producto.moneda}
                      imagenUrl={mainImage}
                    />
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-slate-500">
                Este producto no tiene variantes.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}