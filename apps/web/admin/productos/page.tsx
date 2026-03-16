'use client'

import { FormEvent, useEffect, useState } from 'react'

type Categoria = {
  id: string
  nombre: string
}

type Imagen = {
  id: string
  url: string
}

type Variante = {
  id: string
  nombre: string
  sku: string | null
  precio: number | null
  stock: number
}

type Producto = {
  id: string
  titulo: string
  descripcion: string
  precioBase: number
  moneda: string
  estado: string
  categoria: Categoria | null
  imagenes: Imagen[]
  variantes: Variante[]
}

export default function AdminProductosPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [precioBase, setPrecioBase] = useState('')
  const [moneda, setMoneda] = useState('USD')
  const [imageUrl, setImageUrl] = useState('')
  const [variantName, setVariantName] = useState('')
  const [sku, setSku] = useState('')
  const [variantPrice, setVariantPrice] = useState('')
  const [initialStock, setInitialStock] = useState('')
  const [activar, setActivar] = useState(true)

  async function loadData() {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('Debes iniciar sesión como admin')
      }

      const [categoriesRes, productsRes] = await Promise.all([
        fetch('http://localhost:3000/api/categories'),
        fetch('http://localhost:3000/api/admin/products', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ])

      if (!categoriesRes.ok) {
        throw new Error('No se pudieron cargar las categorías')
      }

      if (!productsRes.ok) {
        throw new Error('No se pudieron cargar los productos')
      }

      const categoriesData = await categoriesRes.json()
      const productsData = await productsRes.json()

      setCategorias(Array.isArray(categoriesData) ? categoriesData : [])
      setProductos(Array.isArray(productsData) ? productsData : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('Debes iniciar sesión como admin')
      }

      const createResponse = await fetch('http://localhost:3000/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo,
          descripcion,
          categoriaId: categoriaId || undefined,
          precioBase: Number(precioBase),
          moneda,
        }),
      })

      if (!createResponse.ok) {
        const data = await createResponse.json().catch(() => null)
        throw new Error(data?.error?.message || data?.message || 'No se pudo crear el producto')
      }

      const producto = await createResponse.json()

      if (imageUrl.trim()) {
        await fetch(`http://localhost:3000/api/admin/products/${producto.id}/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url: imageUrl.trim(),
            orden: 0,
          }),
        })
      }

      let variantId: string | null = null

      if (variantName.trim()) {
        const variantResponse = await fetch(
          `http://localhost:3000/api/admin/products/${producto.id}/variants`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              nombre: variantName.trim(),
              sku: sku.trim() || undefined,
              precio: variantPrice ? Number(variantPrice) : undefined,
            }),
          },
        )

        if (!variantResponse.ok) {
          const data = await variantResponse.json().catch(() => null)
          throw new Error(data?.error?.message || data?.message || 'No se pudo crear la variante')
        }

        const variant = await variantResponse.json()
        variantId = variant.id
      }

      if (variantId && Number(initialStock || 0) > 0) {
        const stockResponse = await fetch(
          `http://localhost:3000/api/admin/products/${producto.id}/variants/${variantId}/stock`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              cantidad: Number(initialStock),
              motivo: 'Carga inicial desde admin',
            }),
          },
        )

        if (!stockResponse.ok) {
          const data = await stockResponse.json().catch(() => null)
          throw new Error(data?.error?.message || data?.message || 'No se pudo cargar el stock')
        }
      }

      if (activar) {
        const statusResponse = await fetch(
          `http://localhost:3000/api/admin/products/${producto.id}/status`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              estado: 'ACTIVO',
            }),
          },
        )

        if (!statusResponse.ok) {
          const data = await statusResponse.json().catch(() => null)
          throw new Error(data?.error?.message || data?.message || 'No se pudo activar el producto')
        }
      }

      setTitulo('')
      setDescripcion('')
      setCategoriaId('')
      setPrecioBase('')
      setMoneda('USD')
      setImageUrl('')
      setVariantName('')
      setSku('')
      setVariantPrice('')
      setInitialStock('')
      setActivar(true)

      setSuccess('Producto creado correctamente')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando producto')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold">Admin productos</h1>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Nuevo producto</h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Título</label>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Ej. Mouse Gamer RGB"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Describe el producto"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Categoría</label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">Sin categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Precio base</label>
                <input
                  type="number"
                  step="0.01"
                  value={precioBase}
                  onChange={(e) => setPrecioBase(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Moneda</label>
                <input
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">URL de imagen</label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="https://..."
              />
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold">Variante inicial</h3>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Nombre de variante</label>
                  <input
                    value={variantName}
                    onChange={(e) => setVariantName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="Ej. Color negro"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">SKU</label>
                  <input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="SKU-001"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Precio variante</label>
                    <input
                      type="number"
                      step="0.01"
                      value={variantPrice}
                      onChange={(e) => setVariantPrice(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Stock inicial</label>
                    <input
                      type="number"
                      value={initialStock}
                      onChange={(e) => setInitialStock(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </div>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={activar}
                onChange={(e) => setActivar(e.target.checked)}
              />
              Activar producto al guardar
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {success ? <p className="text-sm text-green-600">{success}</p> : null}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-white disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Crear producto'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Productos cargados</h2>

          {loading ? (
            <p className="mt-4">Cargando productos...</p>
          ) : productos.length === 0 ? (
            <p className="mt-4 text-slate-600">No hay productos cargados.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {productos.map((producto) => (
                <article
                  key={producto.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{producto.titulo}</h3>
                      <p className="text-sm text-slate-500">
                        {producto.categoria?.nombre ?? 'Sin categoría'}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Estado: {producto.estado}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">
                        {producto.moneda} {Number(producto.precioBase).toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-500">
                        Variantes: {producto.variantes.length}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}