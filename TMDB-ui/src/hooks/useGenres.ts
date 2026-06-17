import { useState, useEffect } from 'react'
import type { Genre } from '@/types/movie'
import { getGenres } from '@/services/movieService'

export function useGenres() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getGenres()
      .then(setGenres)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return { genres, isLoading }
}
