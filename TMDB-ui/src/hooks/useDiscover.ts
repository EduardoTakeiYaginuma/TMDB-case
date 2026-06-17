import { useState, useEffect, useCallback } from 'react'
import type { Movie } from '@/types/movie'
import { discoverMovies } from '@/services/movieService'

interface DiscoverState {
  results: Movie[]
  currentPage: number
  totalPages: number
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
}

export function useDiscover(genreId: number | null, year: number | null) {
  const [state, setState] = useState<DiscoverState>({
    results: [],
    currentPage: 1,
    totalPages: 1,
    isLoading: false,
    isLoadingMore: false,
    error: null,
  })

  const isActive = genreId !== null || year !== null

  useEffect(() => {
    if (!isActive) {
      setState({ results: [], currentPage: 1, totalPages: 1, isLoading: false, isLoadingMore: false, error: null })
      return
    }

    let cancelled = false
    setState((prev) => ({ ...prev, isLoading: true, error: null, results: [], currentPage: 1 }))

    discoverMovies({ genre_id: genreId, year, page: 1 })
      .then((data) => {
        if (!cancelled) {
          setState({
            results: data.results,
            currentPage: data.page,
            totalPages: data.total_pages,
            isLoading: false,
            isLoadingMore: false,
            error: null,
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState((prev) => ({ ...prev, isLoading: false, error: 'Erro ao carregar filmes.' }))
        }
      })

    return () => { cancelled = true }
  }, [genreId, year, isActive])

  const loadMore = useCallback(async () => {
    if (state.isLoadingMore || state.currentPage >= state.totalPages) return
    setState((prev) => ({ ...prev, isLoadingMore: true }))
    try {
      const data = await discoverMovies({ genre_id: genreId, year, page: state.currentPage + 1 })
      setState((prev) => ({
        ...prev,
        results: [...prev.results, ...data.results],
        currentPage: data.page,
        totalPages: data.total_pages,
        isLoadingMore: false,
      }))
    } catch {
      setState((prev) => ({ ...prev, isLoadingMore: false }))
    }
  }, [state.isLoadingMore, state.currentPage, state.totalPages, genreId, year])

  return { ...state, isActive, loadMore }
}
