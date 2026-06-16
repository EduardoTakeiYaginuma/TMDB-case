import { useEffect } from 'react'
import { useRatingStore } from '@/store/ratingStore'
import MovieCard from '@/components/MovieCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import StarRating from '@/components/StarRating'
import type { Movie } from '@/types/movie'
import type { Rating } from '@/types/rating'

interface RatedMoviesPageProps {
  onSelectMovie: (movie: Movie) => void
}

function ratingToMovie(rating: Rating): Movie {
  return {
    id: rating.tmdb_movie_id,
    title: rating.title,
    poster_path: rating.poster_path,
    backdrop_path: null,
    release_date: null,
    vote_average: null,
    overview: '',
  }
}

export default function RatedMoviesPage({ onSelectMovie }: RatedMoviesPageProps) {
  const { ratings, isLoading, error, fetchRatings } = useRatingStore()

  useEffect(() => {
    fetchRatings()
  }, [fetchRatings])

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Filmes <span className="text-brand">Avaliados</span>
          </h2>
          {ratings.length > 0 && (
            <p className="text-gray-500 text-sm mt-1">
              {ratings.length} filme{ratings.length !== 1 ? 's' : ''} avaliado{ratings.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {isLoading && <LoadingSpinner message="Carregando avaliações…" />}

      {error && (
        <ErrorMessage message={error} onRetry={fetchRatings} />
      )}

      {!isLoading && !error && ratings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <span className="text-7xl opacity-20">⭐</span>
          <p className="text-gray-400 text-lg font-medium">Nenhum filme avaliado ainda</p>
          <p className="text-gray-600 text-sm max-w-xs">
            Busque um filme na página inicial e dê uma nota de 1 a 5 estrelas
          </p>
        </div>
      )}

      {!isLoading && !error && ratings.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {ratings.map((rating) => (
            <div key={rating.tmdb_movie_id} className="flex flex-col gap-2">
              <MovieCard
                movie={ratingToMovie(rating)}
                onClick={onSelectMovie}
              />
              <div className="flex items-center justify-between px-1">
                <StarRating value={rating.rating} readonly size="sm" />
                <span className="text-xs text-brand font-bold">{rating.rating}/5</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
