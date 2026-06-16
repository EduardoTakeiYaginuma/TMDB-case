import api from './api'
import type { SearchResponse, MovieDetail } from '@/types/movie'

export async function searchMovies(query: string, page = 1): Promise<SearchResponse> {
  const { data } = await api.get<SearchResponse>('/movies/search', {
    params: { q: query, page },
  })
  return data
}

export async function getMovieDetail(tmdbId: number): Promise<MovieDetail> {
  const { data } = await api.get<MovieDetail>(`/movies/${tmdbId}`)
  return data
}
