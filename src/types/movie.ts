export interface Movie {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string | null
  vote_average: number | null
  overview: string
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface MovieDetail extends Movie {
  genres: string[]
  runtime: number | null
  cast: CastMember[]
}

export interface SearchResponse {
  results: Movie[]
  page: number
  total_pages: number
  total_results: number
}
