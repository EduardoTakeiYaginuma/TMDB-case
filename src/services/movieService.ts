import api from './api'
import type { SearchResponse, MovieDetail, Movie, Genre, DiscoverParams } from '@/types/movie'

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

export async function getTrendingMovies(): Promise<Movie[]> {
  const { data } = await api.get<Movie[]>('/movies/trending')
  return data
}

export async function getPopularMovies(): Promise<Movie[]> {
  const { data } = await api.get<Movie[]>('/movies/popular')
  return data
}

export async function getTopRatedMovies(): Promise<Movie[]> {
  const { data } = await api.get<Movie[]>('/movies/top-rated')
  return data
}

export async function getGenres(): Promise<Genre[]> {
  const { data } = await api.get<Genre[]>('/movies/genres')
  return data
}

export async function discoverMovies(params: DiscoverParams): Promise<SearchResponse> {
  const { data } = await api.get<SearchResponse>('/movies/discover', {
    params: {
      genre_id: params.genre_id ?? undefined,
      year: params.year ?? undefined,
      page: params.page ?? 1,
    },
  })
  return data
}
