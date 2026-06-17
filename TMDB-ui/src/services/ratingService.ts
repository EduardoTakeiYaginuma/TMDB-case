import api from './api'
import type { Rating, CreateRatingPayload, UpdateRatingPayload } from '@/types/rating'

export async function getRatings(): Promise<Rating[]> {
  const { data } = await api.get<Rating[]>('/ratings')
  return data
}

export async function createRating(payload: CreateRatingPayload): Promise<Rating> {
  const { data } = await api.post<Rating>('/ratings', payload)
  return data
}

export async function updateRating(
  tmdbMovieId: number,
  payload: UpdateRatingPayload,
): Promise<Rating> {
  const { data } = await api.put<Rating>(`/ratings/${tmdbMovieId}`, payload)
  return data
}

export async function deleteRating(tmdbMovieId: number): Promise<void> {
  await api.delete(`/ratings/${tmdbMovieId}`)
}
