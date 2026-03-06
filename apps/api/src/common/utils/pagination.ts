export function buildPagination(page = 1, pageSize = 20): { skip: number; take: number } {
  const safePage = Math.max(1, Number(page) || 1)
  const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 20))

  return {
    skip: (safePage - 1) * safePageSize,
    take: safePageSize
  }
}
