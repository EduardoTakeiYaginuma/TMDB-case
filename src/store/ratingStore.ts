import { create } from 'zustand'
import axios from 'axios'
import type { Rating, CreateRatingPayload } from '@/types/rating'
import {
  getRatings,
  createRating,
  updateRating,
  deleteRating,
} from '@/services/ratingService'

interface RatingState {
  ratings: Rating[]
  isLoading: boolean
  error: string | null
  hasFetched: boolean
  fetchRatings: () => Promise<void>
  addRating: (payload: CreateRatingPayload) => Promise<Rating>
  editRating: (tmdbMovieId: number, value: number) => Promise<Rating>
  removeRating: (tmdbMovieId: number) => Promise<void>
  getRatingForMovie: (tmdbMovieId: number) => Rating | undefined
}

function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error ?? 'Operação falhou. Tente novamente.'
  }
  return 'Operação falhou. Tente novamente.'
}

export const useRatingStore = create<RatingState>((set, get) => ({
  ratings: [],
  isLoading: false,
  error: null,
  hasFetched: false,

  fetchRatings: async () => {
    if (get().hasFetched) return
    set({ isLoading: true, error: null })
    try {
      const ratings = await getRatings()
      set({ ratings, isLoading: false, hasFetched: true })
    } catch (err) {
      set({ isLoading: false, error: extractError(err) })
    }
  },

  addRating: async (payload) => {
    const rating = await createRating(payload)
    set((state) => ({ ratings: [...state.ratings, rating] }))
    return rating
  },

  editRating: async (tmdbMovieId, value) => {
    const updated = await updateRating(tmdbMovieId, { rating: value })
    set((state) => ({
      ratings: state.ratings.map((r) =>
        r.tmdb_movie_id === tmdbMovieId ? updated : r,
      ),
    }))
    return updated
  },

  removeRating: async (tmdbMovieId) => {
    await deleteRating(tmdbMovieId)
    set((state) => ({
      ratings: state.ratings.filter((r) => r.tmdb_movie_id !== tmdbMovieId),
    }))
  },

  getRatingForMovie: (tmdbMovieId) =>
    get().ratings.find((r) => r.tmdb_movie_id === tmdbMovieId),
}))
