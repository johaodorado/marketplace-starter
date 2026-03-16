import Link from 'next/link'
import { apiFetch } from '../../lib/api'

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
  let productos: Producto[] = []

  try {
    productos = await apiFetch<Producto[]>('/products')
  } catch {
    productos = []
  }

  return (
    <main className="page">
      <section className="page-title-section">
        <h1>Productos</h1>
      </section>

      <section className="products-catalog">
        <div className="products-grid products-grid--catalog">
          {productos.map((producto: Producto) => (
            <article key={producto.id} className="product-card">
              <div className="product-image">
                <img
                  src={
                    producto.imagenes[0]?.url ?? '/img/icon/logo-kamilnova.png'
                  }
                  alt={producto.titulo}
                />
              </div>

              <p className="product-name">{producto.titulo}</p>

              <Link href={`/productos/${producto.id}`} className="btn-product">
                Ver detalle
              </Link>
            </article>
          ))}
        </div>

        {productos.length === 0 ? (
          <p className="empty-state">
            No se pudieron cargar productos desde la API.
          </p>
        ) : null}
      </section>
    </main>
  )
}