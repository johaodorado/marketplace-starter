'use client'

import Link from 'next/link'
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

function estadoBadge(estado: string) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    ACTIVO:    { bg: '#dcfce7', color: '#166534', border: '#86efac' },
    BORRADOR:  { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
    PAUSADO:   { bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
    ARCHIVADO: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  }
  const s = map[estado] ?? map.BORRADOR
  return (
    <span style={{
      borderRadius: '999px',
      padding: '0.2rem 0.7rem',
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {estado}
    </span>
  )
}

export default function AdminProductosPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingStatusId, setChangingStatusId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [precioBase, setPrecioBase] = useState('')
  const [moneda, setMoneda] = useState('USD')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
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
      if (!token) throw new Error('Debes iniciar sesión como admin')

      const [catRes, prodRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/admin/products', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!catRes.ok) throw new Error('No se pudieron cargar las categorías')
      if (!prodRes.ok) throw new Error('No se pudieron cargar los productos')

      const catData = await catRes.json()
      const prodData = await prodRes.json()

      setCategorias(Array.isArray(catData) ? catData : [])
      setProductos(Array.isArray(prodData) ? prodData : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview) }
  }, [imagePreview])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      const token = localStorage.getItem('accessToken')
      if (!token) throw new Error('Debes iniciar sesión como admin')

      // Crear producto
      const createRes = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          titulo, descripcion,
          categoriaId: categoriaId || undefined,
          precioBase: Number(precioBase), moneda,
        }),
      })
      if (!createRes.ok) {
        const d = await createRes.json().catch(() => null)
        throw new Error(d?.message || 'No se pudo crear el producto')
      }
      const producto = await createRes.json()

      // Subir imagen
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        const imgRes = await fetch(`/api/admin/products/${producto.id}/images`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        if (!imgRes.ok) {
          const d = await imgRes.json().catch(() => null)
          throw new Error(d?.message || 'No se pudo subir la imagen')
        }
      }

      // Crear variante
      let variantId: string | null = null
      if (variantName.trim()) {
        const varRes = await fetch(`/api/admin/products/${producto.id}/variants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            nombre: variantName.trim(),
            sku: sku.trim() || undefined,
            precio: variantPrice ? Number(variantPrice) : undefined,
          }),
        })
        if (!varRes.ok) {
          const d = await varRes.json().catch(() => null)
          throw new Error(d?.message || 'No se pudo crear la variante')
        }
        const variant = await varRes.json()
        variantId = variant.id
      }

      // Cargar stock
      if (variantId && Number(initialStock || 0) > 0) {
        const stockRes = await fetch(`/api/admin/products/${producto.id}/variants/${variantId}/stock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ cantidad: Number(initialStock), motivo: 'Carga inicial desde admin' }),
        })
        if (!stockRes.ok) {
          const d = await stockRes.json().catch(() => null)
          throw new Error(d?.message || 'No se pudo cargar el stock')
        }
      }

      // Activar
      if (activar) {
        const statusRes = await fetch(`/api/admin/products/${producto.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ estado: 'ACTIVO' }),
        })
        if (!statusRes.ok) {
          const d = await statusRes.json().catch(() => null)
          throw new Error(d?.message || 'No se pudo activar el producto')
        }
      }

      setTitulo(''); setDescripcion(''); setCategoriaId(''); setPrecioBase('')
      setMoneda('USD'); setImageFile(null); setImagePreview('')
      setVariantName(''); setSku(''); setVariantPrice(''); setInitialStock('')
      setActivar(true)
      setSuccess('Producto creado correctamente')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando producto')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStatus(producto: Producto) {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) throw new Error('Debes iniciar sesión')
      setChangingStatusId(producto.id)
      setError('')
      const nuevoEstado = producto.estado === 'ACTIVO' ? 'PAUSADO' : 'ACTIVO'
      const res = await fetch(`/api/admin/products/${producto.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => null)
        throw new Error(d?.message || 'No se pudo actualizar el estado')
      }
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando estado')
    } finally {
      setChangingStatusId('')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #e2e8f0',
    borderRadius: '0.6rem',
    padding: '0.65rem 0.9rem',
    fontSize: '0.9rem',
    background: '#f8fafc',
    color: '#1e293b',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '0.35rem',
  }

  return (
    <main className="page">
      <section className="page-title-section">
        <h1>Admin — Productos</h1>
      </section>

      <section style={{ background: 'var(--gradient-soft)', padding: '2.5rem 1.5rem 4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Formulario nuevo producto ── */}
          <aside style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            position: 'sticky',
            top: '8rem',
          }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#374151', margin: 0 }}>
                Nuevo producto
              </h2>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Título *</label>
                <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
                  style={inputStyle} placeholder="Ej. Mouse Gamer RGB" required />
              </div>

              <div>
                <label style={labelStyle}>Descripción *</label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                  placeholder="Describe el producto" required />
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Precio base *</label>
                  <input type="number" step="0.01" value={precioBase}
                    onChange={(e) => setPrecioBase(e.target.value)} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Moneda</label>
                  <input value={moneda} onChange={(e) => setMoneda(e.target.value)} style={inputStyle} />
                </div>
              </div>

              {/* Imagen */}
              <div>
                <label style={labelStyle}>Imagen</label>
                <input type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    setImageFile(file)
                    if (imagePreview) URL.revokeObjectURL(imagePreview)
                    setImagePreview(file ? URL.createObjectURL(file) : '')
                  }}
                  style={{ ...inputStyle, padding: '0.45rem 0.9rem' }}
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview"
                    style={{ marginTop: '0.75rem', height: '100px', width: '100px',
                      objectFit: 'cover', borderRadius: '0.6rem', border: '1px solid #e2e8f0' }} />
                )}
              </div>

              {/* Variante inicial */}
              <div style={{
                borderRadius: '0.75rem', border: '1px solid #e2e8f0',
                background: '#f8fafc', padding: '1rem',
              }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', margin: '0 0 0.75rem' }}>
                  Variante inicial (opcional)
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>Nombre de variante</label>
                    <input value={variantName} onChange={(e) => setVariantName(e.target.value)}
                      style={inputStyle} placeholder="Ej. Talla M / Color negro" />
                  </div>
                  <div>
                    <label style={labelStyle}>SKU</label>
                    <input value={sku} onChange={(e) => setSku(e.target.value)}
                      style={inputStyle} placeholder="SKU-001" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={labelStyle}>Precio variante</label>
                      <input type="number" step="0.01" value={variantPrice}
                        onChange={(e) => setVariantPrice(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Stock inicial</label>
                      <input type="number" value={initialStock}
                        onChange={(e) => setInitialStock(e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={activar} onChange={(e) => setActivar(e.target.checked)} />
                Activar producto al guardar
              </label>

              {error && (
                <div style={{ background: '#fee2e2', borderRadius: '0.6rem', border: '1px solid #fca5a5',
                  padding: '0.65rem 0.9rem', fontSize: '0.85rem', color: '#991b1b' }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{ background: '#dcfce7', borderRadius: '0.6rem', border: '1px solid #86efac',
                  padding: '0.65rem 0.9rem', fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
                  ✓ {success}
                </div>
              )}

              <button type="submit" disabled={saving} style={{
                width: '100%',
                background: saving ? '#94a3b8' : 'linear-gradient(135deg, #1c8a86, #2b3a8c)',
                color: '#ffffff', border: 'none', borderRadius: '0.75rem',
                padding: '0.85rem', fontWeight: 700, fontSize: '0.95rem',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}>
                {saving ? 'Guardando...' : 'Crear producto'}
              </button>
            </form>
          </aside>

          {/* ── Lista de productos ── */}
          <div style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#374151', margin: 0 }}>
                Productos cargados
              </h2>
              <span style={{
                background: '#e2e8f0', color: '#475569', borderRadius: '999px',
                padding: '0.2rem 0.65rem', fontSize: '0.78rem', fontWeight: 700,
              }}>
                {productos.length}
              </span>
            </div>

            <div style={{ padding: '1rem' }}>
              {loading ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                  Cargando productos...
                </p>
              ) : productos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📦</p>
                  <p style={{ color: '#64748b' }}>No hay productos cargados todavía.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {productos.map((producto) => (
                    <article key={producto.id} style={{
                      display: 'grid',
                      gridTemplateColumns: '72px 1fr auto',
                      gap: '1rem',
                      alignItems: 'center',
                      borderRadius: '1rem',
                      border: '1px solid #f1f5f9',
                      background: '#fafafa',
                      padding: '1rem',
                      transition: 'border-color 200ms',
                    }}>
                      {/* Imagen */}
                      <div style={{
                        width: '72px', height: '72px',
                        borderRadius: '0.6rem', overflow: 'hidden',
                        background: '#e2e8f0', flexShrink: 0,
                        border: '1px solid #e2e8f0',
                      }}>
                        {producto.imagenes?.[0]?.url ? (
                          <img src={producto.imagenes[0].url} alt={producto.titulo}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                            📷
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                          <p style={{ fontWeight: 700, color: '#0f172a', margin: 0, fontSize: '0.95rem' }}>
                            {producto.titulo}
                          </p>
                          {estadoBadge(producto.estado)}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.4rem' }}>
                          {producto.categoria?.nombre ?? 'Sin categoría'} ·{' '}
                          {producto.variantes.length} variante{producto.variantes.length !== 1 ? 's' : ''} ·{' '}
                          {producto.imagenes.length} imagen{producto.imagenes.length !== 1 ? 'es' : ''}
                        </p>
                        <p style={{ fontWeight: 700, color: '#1e293b', margin: 0, fontSize: '0.95rem' }}>
                          {producto.moneda} {Number(producto.precioBase).toFixed(2)}
                        </p>
                      </div>

                      {/* Acciones */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                        <Link href={`/admin/productos/${producto.id}`} style={{
                          display: 'block', textAlign: 'center',
                          background: 'linear-gradient(135deg, #1c8a86, #2b3a8c)',
                          color: '#ffffff', borderRadius: '0.6rem',
                          padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: 700,
                        }}>
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(producto)}
                          disabled={changingStatusId === producto.id}
                          style={{
                            border: `1px solid ${producto.estado === 'ACTIVO' ? '#fca5a5' : '#86efac'}`,
                            background: producto.estado === 'ACTIVO' ? '#fff0f0' : '#f0fdf4',
                            color: producto.estado === 'ACTIVO' ? '#dc2626' : '#16a34a',
                            borderRadius: '0.6rem',
                            padding: '0.45rem 1rem',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: changingStatusId === producto.id ? 'not-allowed' : 'pointer',
                            opacity: changingStatusId === producto.id ? 0.6 : 1,
                          }}
                        >
                          {changingStatusId === producto.id
                            ? '...'
                            : producto.estado === 'ACTIVO' ? 'Pausar' : 'Activar'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}