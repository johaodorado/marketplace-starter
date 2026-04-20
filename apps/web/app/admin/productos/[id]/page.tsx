'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Categoria = { id: string; nombre: string }
type Imagen = { id: string; url: string; orden: number }
type Variante = { id: string; nombre: string; sku: string | null; precio: number | null; stock: number }
type Producto = {
  id: string; titulo: string; descripcion: string
  precioBase: number; moneda: string; estado: string
  categoria: Categoria | null; imagenes: Imagen[]; variantes: Variante[]
}

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #e2e8f0', borderRadius: '0.6rem',
  padding: '0.65rem 0.9rem', fontSize: '0.9rem', background: '#f8fafc',
  color: '#1e293b', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.82rem', fontWeight: 600,
  color: '#374151', marginBottom: '0.35rem',
}

function SectionCard({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode
}) {
  return (
    <div style={{
      background: '#ffffff', borderRadius: '1.25rem',
      border: '1px solid #e2e8f0', overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#374151', margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>{subtitle}</p>}
      </div>
      <div style={{ padding: '1.5rem' }}>{children}</div>
    </div>
  )
}

export default function AdminProductoDetallePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const productId = useMemo(() => String(params?.id ?? ''), [params])

  const [producto, setProducto] = useState<Producto | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Datos del formulario
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [precioBase, setPrecioBase] = useState('')
  const [moneda, setMoneda] = useState('USD')
  const [estado, setEstado] = useState('BORRADOR')

  // Imágenes
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [deletingImageId, setDeletingImageId] = useState('')

  // Variantes
  const [variantName, setVariantName] = useState('')
  const [variantSku, setVariantSku] = useState('')
  const [variantPrice, setVariantPrice] = useState('')
  const [variantStock, setVariantStock] = useState('')
  const [savingVariant, setSavingVariant] = useState(false)
  const [adjustingStockVariantId, setAdjustingStockVariantId] = useState('')
  const [stockAdjustByVariant, setStockAdjustByVariant] = useState<Record<string, string>>({})

  useEffect(() => {
    return () => { previewUrls.forEach((url) => URL.revokeObjectURL(url)) }
  }, [previewUrls])

  async function loadData() {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('accessToken')
      if (!token) throw new Error('Debes iniciar sesión como admin')

      const [catRes, prodRes] = await Promise.all([
        fetch('/api/categories'),
        fetch(`/api/admin/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!catRes.ok) throw new Error('No se pudieron cargar las categorías')
      if (!prodRes.ok) throw new Error('No se pudo cargar el producto')

      const catData = await catRes.json()
      const prodData = await prodRes.json()

      setCategorias(Array.isArray(catData) ? catData : [])
      setProducto(prodData)
      setTitulo(prodData.titulo ?? '')
      setDescripcion(prodData.descripcion ?? '')
      setCategoriaId(prodData.categoria?.id ?? '')
      setPrecioBase(String(prodData.precioBase ?? ''))
      setMoneda(prodData.moneda ?? 'USD')
      setEstado(prodData.estado ?? 'BORRADOR')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando producto')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (productId) loadData() }, [productId])

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      const token = localStorage.getItem('accessToken')
      if (!token) throw new Error('Debes iniciar sesión')

      const [updateRes, statusRes] = await Promise.all([
        fetch(`/api/admin/products/${productId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            titulo, descripcion,
            categoriaId: categoriaId || undefined,
            precioBase: Number(precioBase), moneda,
          }),
        }),
        fetch(`/api/admin/products/${productId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ estado }),
        }),
      ])

      if (!updateRes.ok) {
        const d = await updateRes.json().catch(() => null)
        throw new Error(d?.message || 'No se pudo actualizar el producto')
      }
      if (!statusRes.ok) {
        const d = await statusRes.json().catch(() => null)
        throw new Error(d?.message || 'No se pudo actualizar el estado')
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
    if (!selectedFiles.length) return
    try {
      setUploadingImages(true)
      setError('')
      setSuccess('')
      const token = localStorage.getItem('accessToken')
      if (!token) throw new Error('Debes iniciar sesión')

      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch(`/api/admin/products/${productId}/images`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        if (!res.ok) {
          const d = await res.json().catch(() => null)
          throw new Error(d?.message || 'No se pudo subir una imagen')
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

  async function handleDeleteImage(imageId: string) {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) throw new Error('Debes iniciar sesión')
      setDeletingImageId(imageId)
      const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const d = await res.json().catch(() => null)
        throw new Error(d?.message || 'No se pudo eliminar la imagen')
      }
      setSuccess('Imagen eliminada')
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
      if (!token) throw new Error('Debes iniciar sesión')
      await fetch(`/api/admin/products/${productId}/images/${imageId}/${direction === 'up' ? 'move-up' : 'move-down'}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error moviendo imagen')
    }
  }

  async function handleSetPrimaryImage(imageId: string) {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) throw new Error('Debes iniciar sesión')
      await fetch(`/api/admin/products/${productId}/images/${imageId}/primary`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      setSuccess('Imagen principal actualizada')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando imagen principal')
    }
  }

  async function handleCreateVariant(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      setSavingVariant(true)
      setError('')
      setSuccess('')
      const token = localStorage.getItem('accessToken')
      if (!token) throw new Error('Debes iniciar sesión')

      const varRes = await fetch(`/api/admin/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nombre: variantName.trim(),
          sku: variantSku.trim() || undefined,
          precio: variantPrice ? Number(variantPrice) : undefined,
        }),
      })
      if (!varRes.ok) {
        const d = await varRes.json().catch(() => null)
        throw new Error(d?.message || 'No se pudo crear la variante')
      }
      const variant = await varRes.json()

      if (Number(variantStock || 0) > 0) {
        const stockRes = await fetch(`/api/admin/products/${productId}/variants/${variant.id}/stock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ cantidad: Number(variantStock), motivo: 'Carga inicial desde admin' }),
        })
        if (!stockRes.ok) {
          const d = await stockRes.json().catch(() => null)
          throw new Error(d?.message || 'No se pudo cargar el stock')
        }
      }

      setVariantName(''); setVariantSku(''); setVariantPrice(''); setVariantStock('')
      setSuccess('Variante creada correctamente')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando variante')
    } finally {
      setSavingVariant(false)
    }
  }

  async function handleAdjustStock(variantId: string) {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) throw new Error('Debes iniciar sesión')
      const cantidad = Number(stockAdjustByVariant[variantId] || 0)
      if (!Number.isFinite(cantidad) || cantidad === 0) throw new Error('Ingresa una cantidad distinta de 0')
      setAdjustingStockVariantId(variantId)
      const res = await fetch(`/api/admin/products/${productId}/variants/${variantId}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cantidad, motivo: 'Ajuste manual desde panel admin' }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => null)
        throw new Error(d?.message || 'No se pudo ajustar el stock')
      }
      setStockAdjustByVariant((prev) => ({ ...prev, [variantId]: '' }))
      setSuccess('Stock ajustado correctamente')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error ajustando stock')
    } finally {
      setAdjustingStockVariantId('')
    }
  }

  const estadoColor: Record<string, { bg: string; color: string }> = {
    ACTIVO:    { bg: '#dcfce7', color: '#166534' },
    BORRADOR:  { bg: '#f1f5f9', color: '#475569' },
    PAUSADO:   { bg: '#fef9c3', color: '#854d0e' },
    ARCHIVADO: { bg: '#fee2e2', color: '#991b1b' },
  }

  if (loading) {
    return (
      <main className="page">
        <section className="page-title-section"><h1>Editar producto</h1></section>
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <p style={{ color: '#64748b' }}>Cargando producto...</p>
        </section>
      </main>
    )
  }

  if (!producto) {
    return (
      <main className="page">
        <section className="page-title-section"><h1>Editar producto</h1></section>
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div style={{ background: '#fee2e2', borderRadius: '1rem', padding: '1rem 1.5rem', color: '#991b1b' }}>
            {error || 'No se encontró el producto.'}
          </div>
          <Link href="/admin/productos" style={{ display: 'inline-block', marginTop: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
            ← Volver a productos
          </Link>
        </section>
      </main>
    )
  }

  const ec = estadoColor[estado] ?? estadoColor.BORRADOR

  return (
    <main className="page">
      <section className="page-title-section">
        <h1>Editar producto</h1>
      </section>

      <section style={{ background: 'var(--gradient-soft)', padding: '2.5rem 1.5rem 4rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <Link href="/admin/productos" style={{ fontSize: '0.85rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                ← Volver a productos
              </Link>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {producto.titulo}
              </h1>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'monospace', marginTop: '0.25rem' }}>
                {productId}
              </p>
            </div>
            <span style={{
              borderRadius: '999px', padding: '0.3rem 1rem',
              fontSize: '0.78rem', fontWeight: 700,
              textTransform: 'uppercase' as const,
              background: ec.bg, color: ec.color,
            }}>
              {estado}
            </span>
          </div>

          {/* Alertas globales */}
          {error && (
            <div style={{ background: '#fee2e2', borderRadius: '0.75rem', border: '1px solid #fca5a5',
              padding: '0.75rem 1rem', color: '#991b1b', fontSize: '0.875rem',
              marginBottom: '1.5rem', fontWeight: 500 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#dcfce7', borderRadius: '0.75rem', border: '1px solid #86efac',
              padding: '0.75rem 1rem', color: '#166534', fontSize: '0.875rem',
              marginBottom: '1.5rem', fontWeight: 600 }}>
              ✓ {success}
            </div>
          )}

          {/* Layout principal */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

            {/* ── Datos generales ── */}
            <SectionCard title="Datos del producto">
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Título *</label>
                  <input value={titulo} onChange={(e) => setTitulo(e.target.value)} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Descripción *</label>
                  <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                    style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} required />
                </div>
                <div>
                  <label style={labelStyle}>Categoría</label>
                  <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} style={inputStyle}>
                    <option value="">Sin categoría</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>Precio base</label>
                    <input type="number" step="0.01" value={precioBase}
                      onChange={(e) => setPrecioBase(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Moneda</label>
                    <input value={moneda} onChange={(e) => setMoneda(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Estado</label>
                    <select value={estado} onChange={(e) => setEstado(e.target.value)} style={inputStyle}>
                      <option value="BORRADOR">BORRADOR</option>
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="PAUSADO">PAUSADO</option>
                      <option value="ARCHIVADO">ARCHIVADO</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={saving} style={{
                  background: saving ? '#94a3b8' : 'linear-gradient(135deg, #1c8a86, #2b3a8c)',
                  color: '#ffffff', border: 'none', borderRadius: '0.75rem',
                  padding: '0.8rem', fontWeight: 700, fontSize: '0.9rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </form>
            </SectionCard>

            {/* ── Imágenes ── */}
            <SectionCard title="Imágenes" subtitle={`${producto.imagenes.length} imagen${producto.imagenes.length !== 1 ? 'es' : ''}`}>
              {/* Subir nuevas */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Subir imágenes</label>
                <input type="file" multiple accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? [])
                    previewUrls.forEach((u) => URL.revokeObjectURL(u))
                    setSelectedFiles(files)
                    setPreviewUrls(files.map((f) => URL.createObjectURL(f)))
                  }}
                  style={{ ...inputStyle, padding: '0.45rem 0.9rem' }}
                />
                {previewUrls.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                    {previewUrls.map((url, i) => (
                      <img key={`${url}-${i}`} src={url} alt={`Preview ${i + 1}`}
                        style={{ width: '64px', height: '64px', objectFit: 'cover',
                          borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                    ))}
                  </div>
                )}
                <button type="button" onClick={handleUploadImages}
                  disabled={uploadingImages || selectedFiles.length === 0}
                  style={{
                    marginTop: '0.75rem', width: '100%',
                    background: uploadingImages || selectedFiles.length === 0 ? '#94a3b8' : '#1c8a86',
                    color: '#fff', border: 'none', borderRadius: '0.6rem',
                    padding: '0.65rem', fontWeight: 700, fontSize: '0.875rem',
                    cursor: uploadingImages || selectedFiles.length === 0 ? 'not-allowed' : 'pointer',
                  }}>
                  {uploadingImages ? 'Subiendo...' : 'Subir imágenes'}
                </button>
              </div>

              {/* Imágenes actuales */}
              {producto.imagenes.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
                  Sin imágenes todavía.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {producto.imagenes.map((img, index) => (
                    <div key={img.id} style={{
                      borderRadius: '0.75rem', border: `2px solid ${index === 0 ? '#1c8a86' : '#e2e8f0'}`,
                      overflow: 'hidden', background: '#f8fafc',
                    }}>
                      <div style={{ position: 'relative' }}>
                        <img src={img.url} alt={`Imagen ${index + 1}`}
                          style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                        {index === 0 && (
                          <span style={{
                            position: 'absolute', top: '0.35rem', left: '0.35rem',
                            background: '#1c8a86', color: '#fff', borderRadius: '999px',
                            padding: '0.15rem 0.5rem', fontSize: '0.65rem', fontWeight: 700,
                          }}>
                            Principal
                          </span>
                        )}
                      </div>
                      <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <button type="button" onClick={() => handleSetPrimaryImage(img.id)}
                          style={{ ...btnSmall, background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac' }}>
                          ★ Principal
                        </button>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                          <button type="button" onClick={() => handleMoveImage(img.id, 'up')}
                            style={{ ...btnSmall, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                            ↑
                          </button>
                          <button type="button" onClick={() => handleMoveImage(img.id, 'down')}
                            style={{ ...btnSmall, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                            ↓
                          </button>
                        </div>
                        <button type="button" onClick={() => handleDeleteImage(img.id)}
                          disabled={deletingImageId === img.id}
                          style={{ ...btnSmall, background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5',
                            opacity: deletingImageId === img.id ? 0.6 : 1 }}>
                          {deletingImageId === img.id ? '...' : 'Eliminar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          {/* ── Variantes ── */}
          <div style={{ marginTop: '1.5rem' }}>
            <SectionCard title="Variantes" subtitle="Gestiona presentaciones, talles, colores, etc.">

              {/* Formulario nueva variante */}
              <form onSubmit={handleCreateVariant} style={{
                background: '#f8fafc', borderRadius: '0.75rem',
                border: '1px solid #e2e8f0', padding: '1.25rem',
                marginBottom: '1.5rem',
              }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', margin: '0 0 1rem' }}>
                  Nueva variante
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>Nombre *</label>
                    <input value={variantName} onChange={(e) => setVariantName(e.target.value)}
                      style={inputStyle} placeholder="Ej. 100 gr" required />
                  </div>
                  <div>
                    <label style={labelStyle}>SKU</label>
                    <input value={variantSku} onChange={(e) => setVariantSku(e.target.value)}
                      style={inputStyle} placeholder="SKU-001" />
                  </div>
                  <div>
                    <label style={labelStyle}>Precio</label>
                    <input type="number" step="0.01" value={variantPrice}
                      onChange={(e) => setVariantPrice(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Stock inicial</label>
                    <input type="number" value={variantStock}
                      onChange={(e) => setVariantStock(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <button type="submit" disabled={savingVariant} style={{
                  marginTop: '1rem',
                  background: savingVariant ? '#94a3b8' : '#2b3a8c',
                  color: '#fff', border: 'none', borderRadius: '0.6rem',
                  padding: '0.65rem 1.5rem', fontWeight: 700, fontSize: '0.875rem',
                  cursor: savingVariant ? 'not-allowed' : 'pointer',
                }}>
                  {savingVariant ? 'Guardando...' : '+ Crear variante'}
                </button>
              </form>

              {/* Tabla variantes */}
              {producto.variantes.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem', fontSize: '0.875rem' }}>
                  Este producto no tiene variantes todavía.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                        {['Nombre', 'SKU', 'Precio', 'Stock', 'Ajustar stock'].map((h) => (
                          <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0.5rem',
                            fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8',
                            textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {producto.variantes.map((v) => (
                        <tr key={v.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#1e293b' }}>
                            {v.nombre}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', color: '#64748b', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {v.sku || '—'}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', color: '#1e293b', fontWeight: 600 }}>
                            {v.precio != null ? `USD ${Number(v.precio).toFixed(2)}` : '—'}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <span style={{
                              background: v.stock > 10 ? '#dcfce7' : v.stock > 0 ? '#fef9c3' : '#fee2e2',
                              color: v.stock > 10 ? '#166534' : v.stock > 0 ? '#854d0e' : '#991b1b',
                              borderRadius: '999px', padding: '0.2rem 0.65rem',
                              fontSize: '0.8rem', fontWeight: 700,
                            }}>
                              {v.stock}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input
                                type="number"
                                value={stockAdjustByVariant[v.id] ?? ''}
                                onChange={(e) => setStockAdjustByVariant((prev) => ({ ...prev, [v.id]: e.target.value }))}
                                placeholder="+/-"
                                style={{ ...inputStyle, width: '80px', padding: '0.45rem 0.6rem', fontSize: '0.85rem' }}
                              />
                              <button type="button" onClick={() => handleAdjustStock(v.id)}
                                disabled={adjustingStockVariantId === v.id}
                                style={{
                                  background: '#2b3a8c', color: '#fff', border: 'none',
                                  borderRadius: '0.5rem', padding: '0.45rem 0.85rem',
                                  fontSize: '0.8rem', fontWeight: 700,
                                  cursor: adjustingStockVariantId === v.id ? 'not-allowed' : 'pointer',
                                  opacity: adjustingStockVariantId === v.id ? 0.6 : 1,
                                  whiteSpace: 'nowrap' as const,
                                }}>
                                {adjustingStockVariantId === v.id ? '...' : 'Aplicar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </div>

        </div>
      </section>
    </main>
  )
}

const btnSmall: React.CSSProperties = {
  width: '100%', border: 'none', borderRadius: '0.4rem',
  padding: '0.3rem 0.4rem', fontSize: '0.72rem', fontWeight: 700,
  cursor: 'pointer', textAlign: 'center' as const,
}