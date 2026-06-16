import { useState, useEffect } from 'react'
import type { Movie } from '@/types/movie'
import { getTrendingMovies, getPopularMovies, getTopRatedMovies } from '@/services/movieService'

interface DiscoveryState {
  trending: Movie[]
  popular: Movie[]
  topRated: Movie[]
  isLoading: boolean
  error: string | null
}

export function useDiscovery() {
  const [state, setState] = useState<DiscoveryState>({
    trending: [],
    popular: [],
    topRated: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [trending, popular, topRated] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(),
          getTopRatedMovies(),
        ])
        if (!cancelled) {
          setState({ trending, popular, topRated, isLoading: false, error: null })
        }
      } catch {
        if (!cancelled) {
          setState((prev) => ({ ...prev, isLoading: false, error: 'Erro ao carregar sugestões.' }))
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return state
}
