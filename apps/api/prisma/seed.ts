import { PrismaClient, RolUsuario, EstadoProducto, EstadoVendedor } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import * as fs from 'node:fs'
import * as path from 'node:path'

const prisma = new PrismaClient()

type PaletaProduct = {
  slug: string
  nombre: string
  imagen: string
  descripcion: string
  precios: Array<{ cantidad: string; precio: number }>
  instrucciones: string[]
  almacenamiento: string
  nota: string
}

function loadPaletaProducts(): PaletaProduct[] {
  const filePath = path.join(__dirname, 'paleta-products.json')
  const raw = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(raw) as PaletaProduct[]
}

async function ensureAdmin() {
  const email = 'admin@marketplace.local'
  const passwordHash = await bcrypt.hash('Admin12345', 10)

  const admin = await prisma.usuario.upsert({
    where: { email },
    update: {
      passwordHash,
      rol: RolUsuario.ADMIN,
      nombre: 'Admin',
      apellido: 'Marketplace',
    },
    create: {
      email,
      passwordHash,
      rol: RolUsuario.ADMIN,
      nombre: 'Admin',
      apellido: 'Marketplace',
    },
  })

  return admin
}

async function seedCatalog() {
  const admin = await ensureAdmin()

  const seller = await prisma.vendedor.upsert({
    where: { usuarioId: admin.id },
    update: {
      nombreTienda: 'Artquarium',
      estado: EstadoVendedor.APROBADO,
    },
    create: {
      usuarioId: admin.id,
      nombreTienda: 'Artquarium',
      estado: EstadoVendedor.APROBADO,
    },
  })

  const category = await prisma.categoria.upsert({
    where: { slug: 'catalogo-artquarium-paleta' },
    update: {
      nombre: 'Catalogo Artquarium',
      descripcion: 'Productos sincronizados desde Kamilnova/paleta',
      activa: true,
    },
    create: {
      nombre: 'Catalogo Artquarium',
      slug: 'catalogo-artquarium-paleta',
      descripcion: 'Productos sincronizados desde Kamilnova/paleta',
      activa: true,
    },
  })

  const products = loadPaletaProducts()

  for (const item of products) {
    const firstPrice = item.precios[0]?.precio ?? 1

    const existing = await prisma.producto.findFirst({
      where: {
        externalSystem: 'KAMILNOVA_PALETA',
        externalId: item.slug,
      },
      select: { id: true },
    })

    const product = existing
      ? await prisma.producto.update({
          where: { id: existing.id },
          data: {
            vendedorId: seller.id,
            categoriaId: category.id,
            titulo: item.nombre,
            descripcion: item.descripcion,
            estado: EstadoProducto.ACTIVO,
            precioBase: firstPrice,
            moneda: 'USD',
            externalSystem: 'KAMILNOVA_PALETA',
            externalId: item.slug,
            externalMeta: {
              instrucciones: item.instrucciones,
              almacenamiento: item.almacenamiento,
              nota: item.nota,
              sourceRepo: 'Caluloper/Kamilnova',
              sourceBranch: 'paleta',
            },
          },
        })
      : await prisma.producto.create({
          data: {
            vendedorId: seller.id,
            categoriaId: category.id,
            titulo: item.nombre,
            descripcion: item.descripcion,
            estado: EstadoProducto.ACTIVO,
            precioBase: firstPrice,
            moneda: 'USD',
            externalSystem: 'KAMILNOVA_PALETA',
            externalId: item.slug,
            externalMeta: {
              instrucciones: item.instrucciones,
              almacenamiento: item.almacenamiento,
              nota: item.nota,
              sourceRepo: 'Caluloper/Kamilnova',
              sourceBranch: 'paleta',
            },
          },
        })

    await prisma.imagenProducto.deleteMany({ where: { productoId: product.id } })
    await prisma.varianteProducto.deleteMany({ where: { productoId: product.id } })

    const imageUrl = `/${item.imagen.replace(/^\/+/, '')}`
    await prisma.imagenProducto.create({
      data: {
        productoId: product.id,
        url: imageUrl,
        orden: 0,
      },
    })

    const variants = item.precios.length > 0
      ? item.precios
      : [{ cantidad: 'Presentacion unica', precio: firstPrice }]

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i]
      await prisma.varianteProducto.create({
        data: {
          productoId: product.id,
          nombre: variant.cantidad,
          sku: `${item.slug}-${i + 1}`,
          precio: variant.precio,
          stock: 100,
        },
      })
    }
  }

  console.log(`Catalogo paleta sincronizado: ${products.length} productos`) 
}

async function main() {
  await seedCatalog()
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
