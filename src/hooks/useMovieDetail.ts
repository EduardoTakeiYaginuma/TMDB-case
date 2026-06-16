import { useState, useEffect } from 'react'
import axios from 'axios'
import { getMovieDetail } from '@/services/movieService'
import type { MovieDetail } from '@/types/movie'

interface UseMovieDetailResult {
  detail: MovieDetail | null
  isLoading: boolean
  error: string | null
}

export function useMovieDetail(tmdbId: number | null): UseMovieDetailResult {
  const [detail, setDetail] = useState<MovieDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tmdbId) {
      setDetail(null)
      return
    }

    let cancelled = false

    setIsLoading(true)
    setError(null)
    setDetail(null)

    getMovieDetail(tmdbId)
      .then((data) => { if (!cancelled) setDetail(data) })
      .catch((err) => {
        if (!cancelled) {
          const msg = axios.isAxiosError(err)
            ? (err.response?.data?.error ?? 'Erro ao carregar detalhes do filme.')
            : 'Erro ao carregar detalhes do filme.'
          setError(msg)
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [tmdbId])

  return { detail, isLoading, error }
}
