import Link from 'next/link'
import { readdir } from 'fs/promises'
import { apiFetch } from '../lib/api'
import HeroRotator from '../components/hero-rotator'

type Producto = {
  id: string
  titulo: string
  imagenes: Array<{ url: string }>
}

export default async function HomePage() {
  const heroImages = await getHeroImages()

  let productos: Producto[] = []

  try {
    productos = await apiFetch<Producto[]>('/products')
  } catch {
    productos = []
  }

  const destacados = productos.slice(0, 3)

  return (
    <main className="page">
      <HeroRotator images={heroImages} alt="Acuario Artquarium" />

      <div className="section-title">Sobre Nosotros</div>
      <section className="about-section">
        <p>
          KAMILNOVA S.A. nacio en 2019 en la ciudad de Guayaquil con el
          compromiso de aportar al desarrollo sostenible. Hoy, nos especializamos
          en la elaboracion y comercializacion de productos acuicolas de alta
          calidad, enfocados en la nutricion y bienestar de especies marinas y
          de agua dulce.
        </p>
        <Link className="btn" href="/nosotros">
          Ver mas
        </Link>
      </section>

      <div className="section-title">Productos</div>
      <section className="products-section">
        <div className="products-grid products-grid--home">
          {destacados.length > 0
            ? destacados.map((producto) => (
                <article key={producto.id} className="product-card">
                  <img
                    src={
                      producto.imagenes[0]?.url ?? '/img/icon/logo-kamilnova.png'
                    }
                    alt={producto.titulo}
                  />
                  <p>{producto.titulo}</p>
                </article>
              ))
            : [
                {
                  nombre: 'Artemia de Alta Eclosion',
                  imagen: '/img/productos/artemia-alta-eclosion.png',
                },
                {
                  nombre: 'Artemia Descapsulada en Conserva',
                  imagen: '/img/productos/artemia-descapsulada-conserva.png',
                },
                {
                  nombre: 'Artemia Descapsulada',
                  imagen: '/img/productos/artemia-descapsulada.png',
                },
              ].map((producto) => (
                <article key={producto.nombre} className="product-card">
                  <img src={producto.imagen} alt={producto.nombre} />
                  <p>{producto.nombre}</p>
                </article>
              ))}
        </div>

        <Link className="btn" href="/productos">
          Ver productos
        </Link>
      </section>
    </main>
  )
}

async function getHeroImages() {
  const fallback = ['/img/inicio/peces_inicio.png']

  try {
    const directoryPath = `${process.cwd()}/public/img/inicio`
    const files = await readdir(directoryPath)
    const allowedExtensions = /\.(png|jpe?g|webp|avif)$/i

    const images = files
      .filter((fileName) => allowedExtensions.test(fileName))
      .sort((a, b) => a.localeCompare(b))
      .map((fileName) => `/img/inicio/${fileName}`)

    return images.length > 0 ? images : fallback
  } catch {
    return fallback
  }
}