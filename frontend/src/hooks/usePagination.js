import { useState, useMemo } from 'react'

export const usePagination = (totalItems, initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  const totalPages = Math.ceil(totalItems / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const nextPage = () => goToPage(page + 1)
  const prevPage = () => goToPage(page - 1)

  const resetPagination = () => {
    setPage(initialPage)
    setLimit(initialLimit)
  }

  return {
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setPage,
    setLimit,
    goToPage,
    nextPage,
    prevPage,
    resetPagination
  }
}