export type CartItem = {
  productId: string
  variantId: string
  titulo: string
  varianteNombre: string
  precio: number
  moneda: string
  cantidad: number
  imagenUrl?: string | null
}

const CART_KEY = 'cartItems'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []

  const raw = localStorage.getItem(CART_KEY)
  if (!raw) return []

  try {
    return JSON.parse(raw) as CartItem[]
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function addToCart(item: CartItem) {
  const items = getCart()

  const existing = items.find(
    (x) => x.productId === item.productId && x.variantId === item.variantId,
  )

  if (existing) {
    existing.cantidad += item.cantidad
  } else {
    items.push(item)
  }

  saveCart(items)
}

export function removeFromCart(variantId: string) {
  const items = getCart().filter((item) => item.variantId !== variantId)
  saveCart(items)
}

export function updateCartItemQuantity(variantId: string, cantidad: number) {
  const items = getCart().map((item) =>
    item.variantId === variantId
      ? { ...item, cantidad: Math.max(1, cantidad) }
      : item,
  )

  saveCart(items)
}

export function clearCart() {
  localStorage.removeItem(CART_KEY)
}