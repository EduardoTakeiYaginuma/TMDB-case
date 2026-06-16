import { useEffect } from 'react'
import { useSearchStore } from '@/store/searchStore'
import { useRatingStore } from '@/store/ratingStore'
import SearchBar from '@/components/SearchBar'
import MovieCard from '@/components/MovieCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import type { Movie } from '@/types/movie'

interface HomePageProps {
  onSelectMovie: (movie: Movie) => void
}

export default function HomePage({ onSelectMovie }: HomePageProps) {
  const { query, results, totalResults, isLoading, error, hasSearched, search } = useSearchStore()
  const { fetchRatings, getRatingForMovie } = useRatingStore()

  useEffect(() => {
    fetchRatings()
  }, [fetchRatings])

  function handleSearch(q: string) {
    search(q)
  }

  const showEmpty = hasSearched && !isLoading && !error && results.length === 0
  const showResults = !isLoading && !error && results.length > 0

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3 pt-4">
        <h2 className="text-4xl font-bold text-white">
          Descubra <span className="text-brand">filmes</span>
        </h2>
        <p className="text-gray-400 text-sm">
          Pesquise, explore e avalie seus filmes favoritos
        </p>
      </div>

      <SearchBar
        onSearch={handleSearch}
        isLoading={isLoading}
        initialValue={query}
      />

      {isLoading && <LoadingSpinner message="Buscando filmes…" />}

      {error && (
        <ErrorMessage
          message={error}
          onRetry={query ? () => search(query) : undefined}
        />
      )}

      {showEmpty && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <span className="text-5xl">🎭</span>
          <p className="text-gray-400">
            Nenhum resultado para <span className="text-white font-medium">"{query}"</span>
          </p>
          <p className="text-gray-600 text-sm">Tente outro título ou verifique a ortografia</p>
        </div>
      )}

      {showResults && (
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">
            {totalResults.toLocaleString('pt-BR')} resultado{totalResults !== 1 ? 's' : ''} para{' '}
            <span className="text-gray-300">"{query}"</span>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((movie) => {
              const existingRating = getRatingForMovie(movie.id)
              const badge = existingRating ? (
                <span className="bg-brand text-black text-xs font-bold px-1.5 py-0.5 rounded">
                  ★ {existingRating.rating}
                </span>
              ) : undefined

              return (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={onSelectMovie}
                  badge={badge}
                />
              )
            })}
          </div>
        </div>
      )}

      {!hasSearched && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center text-gray-600">
          <span className="text-6xl opacity-30">🎬</span>
          <p className="text-sm">Digite o nome de um filme para começar</p>
        </div>
      )}
    </div>
  )
}
