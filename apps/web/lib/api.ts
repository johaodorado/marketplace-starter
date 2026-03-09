const API_URL = 'http://localhost:3000/api'

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || 'Error en la petición')
  }

  return response.json() as Promise<T>
}