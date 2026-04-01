'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

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

export default function AdminProductoDetallePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const productId = useMemo(() => String(params?.id ?? ''), [params])
const [deletingImageId, setDeletingImageId] = useState('')
  const [producto, setProducto] = useState<Producto | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [precioBase, setPrecioBase] = useState('')
  const [moneda, setMoneda] = useState('USD')
  const [estado, setEstado] = useState('BORRADOR')

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

const [variantName, setVariantName] = useState('')
const [variantSku, setVariantSku] = useState('')
const [variantPrice, setVariantPrice] = useState('')
const [variantStock, setVariantStock] = useState('')
const [savingVariant, setSavingVariant] = useState(false)


  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  async function loadData() {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('Debes iniciar sesión como admin')
      }

      const [categoriesRes, productRes] = await Promise.all([
        fetch('http://localhost:3000/api/categories'),
        fetch(`http://localhost:3000/api/admin/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ])

      if (!categoriesRes.ok) {
        throw new Error('No se pudieron cargar las categorías')
      }

      if (!productRes.ok) {
        throw new Error('No se pudo cargar el producto')
      }

      const categoriesData = await categoriesRes.json()
      const productData = await productRes.json()

      setCategorias(Array.isArray(categoriesData) ? categoriesData : [])
      setProducto(productData)

      setTitulo(productData.titulo ?? '')
      setDescripcion(productData.descripcion ?? '')
      setCategoriaId(productData.categoria?.id ?? '')
      setPrecioBase(String(productData.precioBase ?? ''))
      setMoneda(productData.moneda ?? 'USD')
      setEstado(productData.estado ?? 'BORRADOR')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando producto')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) {
      loadData()
    }
  }, [productId])

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('Debes iniciar sesión como admin')
      }

      const updateResponse = await fetch(`http://localhost:3000/api/admin/products/${productId}`, {
        method: 'PATCH',
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

      if (!updateResponse.ok) {
        const data = await updateResponse.json().catch(() => null)
        throw new Error(data?.error?.message || data?.message || 'No se pudo actualizar el producto')
      }

      const statusResponse = await fetch(
        `http://localhost:3000/api/admin/products/${productId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            estado,
          }),
        },
      )

      if (!statusResponse.ok) {
        const data = await statusResponse.json().catch(() => null)
        throw new Error(data?.error?.message || data?.message || 'No se pudo actualizar el estado')
      }

      setSuccess('Producto actualizado correctamente')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando producto')
    } finally {
      setSaving(false)
    }
  }

  async function handleUploadImages() {
    try {
      if (!selectedFiles.length) {
        throw new Error('Selecciona al menos una imagen')
      }

      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('Debes iniciar sesión como admin')
      }

      setUploadingImages(true)
      setError('')
      setSuccess('')

      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch(`http://localhost:3000/api/admin/products/${productId}/images`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.error?.message || data?.message || 'No se pudo subir una imagen')
        }
      }

      previewUrls.forEach((url) => URL.revokeObjectURL(url))
      setSelectedFiles([])
      setPreviewUrls([])
      setSuccess('Imágenes subidas correctamente')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error subiendo imágenes')
    } finally {
      setUploadingImages(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p>Cargando producto...</p>
      </main>
    )
  }

  if (!producto) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-red-600">No se encontró el producto.</p>
        <Link href="/admin/productos" className="mt-4 inline-block text-sm text-slate-700 underline">
          Volver a productos
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/productos" className="text-sm text-slate-600 underline">
            Volver a productos
          </Link>
          <h1 className="mt-2 text-3xl font-bold">Editar producto</h1>
          <p className="mt-1 text-sm text-slate-500">{producto.titulo}</p>
        </div>

        <button
          type="button"
          onClick={() => router.refresh()}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
        >
          Refrescar
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Datos del producto</h2>

          <form onSubmit={handleSave} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Título</label>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3"
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

            <div className="grid gap-4 sm:grid-cols-3">
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

              <div>
                <label className="mb-2 block text-sm font-medium">Estado</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option value="BORRADOR">BORRADOR</option>
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {success ? <p className="text-sm text-green-600">{success}</p> : null}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-white disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Imágenes</h2>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium">Subir varias imágenes</label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                previewUrls.forEach((url) => URL.revokeObjectURL(url))
                setSelectedFiles(files)
                setPreviewUrls(files.map((file) => URL.createObjectURL(file)))
              }}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

            {previewUrls.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {previewUrls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="overflow-hidden rounded-xl border border-slate-200"
                  >
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-32 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleUploadImages}
              disabled={uploadingImages || selectedFiles.length === 0}
              className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-white disabled:opacity-60"
            >
              {uploadingImages ? 'Subiendo...' : 'Subir imágenes'}
            </button>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold">Imágenes actuales</h3>

            {producto.imagenes.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Este producto no tiene imágenes.</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
               {producto.imagenes.map((imagen, index) => (
  



<div
  key={imagen.id}
  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
>
  <img
    src={imagen.url}
    alt={`Imagen ${index + 1}`}
    className="h-36 w-full object-cover"
  />

  <div className="space-y-2 p-3">
    <p className="text-xs text-slate-500">
      {index === 0 ? 'Imagen principal' : `Imagen ${index + 1}`}
    </p>

    <button
      type="button"
      onClick={() => handleSetPrimaryImage(imagen.id)}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
    >
      Poner principal
    </button>

    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => handleMoveImage(imagen.id, 'up')}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        Subir
      </button>

      <button
        type="button"
        onClick={() => handleMoveImage(imagen.id, 'down')}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        Bajar
      </button>
    </div>

    <button
      type="button"
      onClick={() => handleDeleteImage(imagen.id)}
      disabled={deletingImageId === imagen.id}
      className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-60"
    >
      {deletingImageId === imagen.id ? 'Eliminando...' : 'Eliminar'}
    </button>
  </div>
</div>


))}
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <h2 className="text-xl font-semibold">Variantes</h2>

  <form onSubmit={handleCreateVariant} className="mt-5 rounded-xl border border-slate-200 p-4">
    <h3 className="font-semibold">Nueva variante</h3>

    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Nombre</label>
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
          value={variantSku}
          onChange={(e) => setVariantSku(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          placeholder="SKU-001"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Precio</label>
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
          value={variantStock}
          onChange={(e) => setVariantStock(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>
    </div>

    <button
      type="submit"
      disabled={savingVariant}
      className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-white disabled:opacity-60"
    >
      {savingVariant ? 'Guardando...' : 'Crear variante'}
    </button>
  </form>

  {producto.variantes.length === 0 ? (
    <p className="mt-4 text-slate-500">Este producto no tiene variantes.</p>
  ) : (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
            <th className="py-3 pr-4">Nombre</th>
            <th className="py-3 pr-4">SKU</th>
            <th className="py-3 pr-4">Precio</th>
            <th className="py-3 pr-4">Stock</th>
          </tr>
        </thead>
        <tbody>
          {producto.variantes.map((variante) => (
            <tr key={variante.id} className="border-b border-slate-100 text-sm">
              <td className="py-3 pr-4">{variante.nombre}</td>
              <td className="py-3 pr-4">{variante.sku || 'Sin SKU'}</td>
              <td className="py-3 pr-4">
                {variante.precio != null ? Number(variante.precio).toFixed(2) : 'Sin precio'}
              </td>
              <td className="py-3 pr-4">{variante.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>
    </main>
  )

async function handleCreateVariant(e: FormEvent<HTMLFormElement>) {
  e.preventDefault()

  try {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      throw new Error('Debes iniciar sesión como admin')
    }

    setSavingVariant(true)
    setError('')
    setSuccess('')

    const variantRes = await fetch(
      `http://localhost:3000/api/admin/products/${productId}/variants`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: variantName.trim(),
          sku: variantSku.trim() || undefined,
          precio: variantPrice ? Number(variantPrice) : undefined,
        }),
      },
    )

    if (!variantRes.ok) {
      const data = await variantRes.json().catch(() => null)
      throw new Error(data?.error?.message || data?.message || 'No se pudo crear la variante')
    }

    const variant = await variantRes.json()

    if (Number(variantStock || 0) > 0) {
      const stockRes = await fetch(
        `http://localhost:3000/api/admin/products/${productId}/variants/${variant.id}/stock`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cantidad: Number(variantStock),
            motivo: 'Carga inicial desde edición admin',
          }),
        },
      )

      if (!stockRes.ok) {
        const data = await stockRes.json().catch(() => null)
        throw new Error(data?.error?.message || data?.message || 'No se pudo cargar el stock')
      }
    }

    setVariantName('')
    setVariantSku('')
    setVariantPrice('')
    setVariantStock('')
    setSuccess('Variante creada correctamente')
    await loadData()
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error creando variante')
  } finally {
    setSavingVariant(false)
  }
}

async function handleDeleteImage(imageId: string) {
  try {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      throw new Error('Debes iniciar sesión como admin')
    }

    setDeletingImageId(imageId)
    setError('')
    setSuccess('')

    const res = await fetch(
      `http://localhost:3000/api/admin/products/${productId}/images/${imageId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.error?.message || data?.message || 'No se pudo eliminar la imagen')
    }

    setSuccess('Imagen eliminada correctamente')
    await loadData()
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error eliminando imagen')
  } finally {
    setDeletingImageId('')
  }
}


async function handleMoveImage(imageId: string, direction: 'up' | 'down') {
  try {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      throw new Error('Debes iniciar sesión como admin')
    }

    setError('')
    setSuccess('')

    const res = await fetch(
      `http://localhost:3000/api/admin/products/${productId}/images/${imageId}/${direction === 'up' ? 'move-up' : 'move-down'}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.error?.message || data?.message || 'No se pudo mover la imagen')
    }

    await loadData()
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error moviendo imagen')
  }
}

async function handleSetPrimaryImage(imageId: string) {
  try {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      throw new Error('Debes iniciar sesión como admin')
    }

    setError('')
    setSuccess('')

    const res = await fetch(
      `http://localhost:3000/api/admin/products/${productId}/images/${imageId}/primary`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.error?.message || data?.message || 'No se pudo definir imagen principal')
    }

    setSuccess('Imagen principal actualizada')
    await loadData()
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error actualizando imagen principal')
  }
}


}