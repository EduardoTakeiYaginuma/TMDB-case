import { create } from 'zustand'
import axios from 'axios'
import type { Movie } from '@/types/movie'
import { searchMovies } from '@/services/movieService'

interface SearchState {
  query: string
  results: Movie[]
  totalResults: number
  isLoading: boolean
  error: string | null
  hasSearched: boolean
  search: (query: string) => Promise<void>
  clear: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  totalResults: 0,
  isLoading: false,
  error: null,
  hasSearched: false,

  search: async (query: string) => {
    set({ query, isLoading: true, error: null, hasSearched: true })
    try {
      const data = await searchMovies(query)
      set({
        results: data.results,
        totalResults: data.total_results,
        isLoading: false,
      })
    } catch (err) {
      let message = 'Erro ao buscar filmes. Tente novamente mais tarde.'
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.error ?? message
      }
      set({ results: [], totalResults: 0, isLoading: false, error: message })
    }
  },

  clear: () =>
    set({ query: '', results: [], totalResults: 0, error: null, hasSearched: false }),
}))
