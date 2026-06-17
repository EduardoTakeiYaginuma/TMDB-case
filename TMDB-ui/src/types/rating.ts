export interface Rating {
  id: number
  tmdb_movie_id: number
  title: string
  poster_path: string | null
  rating: number
  created_at: string
  updated_at: string
}

export interface CreateRatingPayload {
  tmdb_movie_id: number
  title: string
  poster_path: string | null
  rating: number
}

export interface UpdateRatingPayload {
  rating: number
}
