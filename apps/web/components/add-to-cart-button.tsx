'use client'

import { useState } from 'react'
import { addToCart } from '../lib/cart'

type Props = {
  productId: string
  variantId: string
  titulo: string
  varianteNombre: string
  precio: number
  moneda: string
  imagenUrl?: string | null
}

export default function AddToCartButton({
  productId,
  variantId,
  titulo,
  varianteNombre,
  precio,
  moneda,
  imagenUrl,
}: Props) {
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addToCart({
      productId,
      variantId,
      titulo,
      varianteNombre,
      precio,
      moneda,
      cantidad: 1,
      imagenUrl,
    })

    setAdded(true)

    setTimeout(() => {
      setAdded(false)
    }, 1500)
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-white"
    >
      {added ? 'Agregado' : 'Agregar al carrito'}
    </button>
  )
}