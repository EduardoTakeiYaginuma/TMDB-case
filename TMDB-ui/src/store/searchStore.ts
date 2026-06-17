import { create } from 'zustand'
import axios from 'axios'
import type { Movie } from '@/types/movie'
import { searchMovies } from '@/services/movieService'

interface SearchState {
  query: string
  results: Movie[]
  totalResults: number
  currentPage: number
  totalPages: number
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasSearched: boolean
  search: (query: string) => Promise<void>
  loadMore: () => Promise<void>
  clear: () => void
}

function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error ?? 'Erro ao buscar filmes. Tente novamente mais tarde.'
  }
  return 'Erro ao buscar filmes. Tente novamente mais tarde.'
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  totalResults: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  hasSearched: false,

  search: async (query: string) => {
    set({ query, isLoading: true, error: null, hasSearched: true, currentPage: 1 })
    try {
      const data = await searchMovies(query, 1)
      set({
        results: data.results,
        totalResults: data.total_results,
        currentPage: data.page,
        totalPages: data.total_pages,
        isLoading: false,
      })
    } catch (err) {
      set({ results: [], totalResults: 0, isLoading: false, error: extractError(err) })
    }
  },

  loadMore: async () => {
    const { query, currentPage, totalPages, isLoadingMore } = get()
    if (isLoadingMore || currentPage >= totalPages) return
    set({ isLoadingMore: true })
    try {
      const data = await searchMovies(query, currentPage + 1)
      set((state) => ({
        results: [...state.results, ...data.results],
        currentPage: data.page,
        totalPages: data.total_pages,
        isLoadingMore: false,
      }))
    } catch (err) {
      set({ isLoadingMore: false, error: extractError(err) })
    }
  },

  clear: () =>
    set({
      query: '',
      results: [],
      totalResults: 0,
      currentPage: 1,
      totalPages: 1,
      error: null,
      hasSearched: false,
    }),
}))
