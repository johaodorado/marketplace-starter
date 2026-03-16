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
  externalMeta?: {
    instrucciones?: string[]
    almacenamiento?: string
    nota?: string
  } | null
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
    <main className="page product-detail-page">
      <section className="product-detail-container">
        <header className="product-header">
          <div className="product-image-container">
            {mainImage ? (
              <img src={mainImage} alt={producto.titulo} />
            ) : (
              <img src="/img/icon/logo-kamilnova.png" alt={producto.titulo} />
            )}
          </div>

          <div className="product-info">
            <p className="product-category">
              {producto.categoria?.nombre ?? 'Sin categoria'}
            </p>
            <h1 className="product-title">{producto.titulo}</h1>
            <p className="product-description">{producto.descripcion}</p>
            <div className="product-prices">
              <span className="price-badge">
                {producto.moneda} {producto.precioBase}
              </span>
            </div>
          </div>
        </header>

        <section className="product-details">
          <div className="product-section">
            <span className="section-badge">Variantes</span>
            <div className="variants-list">
              {producto.variantes.length > 0 ? (
                producto.variantes.map((variante: Variante) => {
                  const precioFinal = variante.precio ?? producto.precioBase

                  return (
                    <article key={variante.id} className="variant-card">
                      <p className="variant-title">{variante.nombre}</p>
                      <p className="variant-meta">
                        SKU: {variante.sku ?? 'N/A'}
                      </p>
                      <p className="variant-meta">
                        Stock: {variante.stock}
                      </p>
                      <p className="variant-price">
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
                    </article>
                  )
                })
              ) : (
                <p className="section-text">
                  Este producto no tiene variantes.
                </p>
              )}
            </div>
          </div>

          {producto.externalMeta?.instrucciones?.length ? (
            <div className="product-section">
              <span className="section-badge">Instrucciones</span>
              <ol className="section-list">
                {producto.externalMeta.instrucciones.map((paso, index) => (
                  <li key={`${producto.id}-paso-${index}`}>{paso}</li>
                ))}
              </ol>
            </div>
          ) : null}

          {producto.externalMeta?.almacenamiento ? (
            <div className="product-section">
              <span className="section-badge">Almacenamiento</span>
              <p className="section-text">{producto.externalMeta.almacenamiento}</p>
            </div>
          ) : null}

          {producto.externalMeta?.nota ? (
            <div className="product-section">
              <span className="section-badge">Nota</span>
              <p className="section-text">{producto.externalMeta.nota}</p>
            </div>
          ) : null}
        </section>

        <div className="back-link">
          <a href="/productos">Volver a productos</a>
        </div>
      </section>
    </main>
  )
}