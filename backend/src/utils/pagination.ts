export interface PaginationOptions {
  defaultPageSize?: number
  maxPageSize?: number
}

export interface PaginationParams {
  skip: number
  take: number
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    currentPage: number
    pageSize: number
    totalPages: number
    totalItems: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 200

export const getPagination = (
  query: Record<string, unknown>,
  options: PaginationOptions = {}
): PaginationParams | null => {
  const pageRaw = query.page
  const pageSizeRaw = query.pageSize

  if (pageRaw === undefined && pageSizeRaw === undefined) {
    return null
  }

  const page = Number(pageRaw ?? 1)
  const pageSize = Number(pageSizeRaw ?? options.defaultPageSize ?? DEFAULT_PAGE_SIZE)

  if (!Number.isFinite(page) || !Number.isFinite(pageSize)) {
    return null
  }

  const safePage = Math.max(1, Math.floor(page))
  const maxPageSize = options.maxPageSize ?? MAX_PAGE_SIZE
  const safePageSize = Math.min(maxPageSize, Math.max(1, Math.floor(pageSize)))

  return {
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
    page: safePage,
    pageSize: safePageSize
  }
}

export const buildPaginatedResponse = <T>(
  data: T[],
  totalItems: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> => {
  // Guard against invalid pageSize
  const safePageSize = Math.max(1, pageSize)
  
  // Calculate totalPages, defaulting to 0 for empty datasets
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / safePageSize) : 0
  
  // Clamp current page to valid range
  const safePage = totalPages > 0 ? Math.max(1, Math.min(page, totalPages)) : 0

  return {
    data,
    pagination: {
      currentPage: safePage,
      pageSize: safePageSize,
      totalPages,
      totalItems,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1
    }
  }
}
