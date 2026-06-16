import { useEffect } from 'react'
import { useSearchStore } from '@/store/searchStore'
import { useRatingStore } from '@/store/ratingStore'
import { useDiscovery } from '@/hooks/useDiscovery'
import SearchBar from '@/components/SearchBar'
import MovieCard from '@/components/MovieCard'
import MovieRow from '@/components/MovieRow'
import HeroMovie from '@/components/HeroMovie'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import type { Movie } from '@/types/movie'

interface HomePageProps {
  onSelectMovie: (movie: Movie) => void
}

export default function HomePage({ onSelectMovie }: HomePageProps) {
  const { query, results, totalResults, isLoading, error, hasSearched, search } = useSearchStore()
  const { fetchRatings, getRatingForMovie } = useRatingStore()
  const discovery = useDiscovery()

  useEffect(() => {
    fetchRatings()
  }, [fetchRatings])

  const showEmpty = hasSearched && !isLoading && !error && results.length === 0
  const showResults = !isLoading && !error && results.length > 0
  const showDiscovery = !hasSearched

  const heroMovie = discovery.trending.find((m) => m.backdrop_path) ?? discovery.trending[0]

  return (
    <div className="space-y-10">
      {/* Search bar — always visible at top */}
      <div className={`transition-all duration-300 ${showDiscovery ? 'pt-0' : 'pt-2'}`}>
        {showDiscovery && (
          <p className="text-center text-gray-400 text-sm mb-4">
            Pesquise um título ou explore as sugestões abaixo
          </p>
        )}
        <SearchBar
          onSearch={search}
          isLoading={isLoading}
          initialValue={query}
        />
      </div>

      {/* Search state */}
      {isLoading && <LoadingSpinner message="Buscando filmes…" />}

      {error && (
        <ErrorMessage message={error} onRetry={query ? () => search(query) : undefined} />
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
                <MovieCard key={movie.id} movie={movie} onClick={onSelectMovie} badge={badge} />
              )
            })}
          </div>
        </div>
      )}

      {/* Discovery — shown when no search has been made */}
      {showDiscovery && (
        <div className="space-y-10">
          {/* Hero */}
          {discovery.isLoading && (
            <div className="rounded-2xl bg-surface-card animate-pulse" style={{ minHeight: '420px' }} />
          )}
          {!discovery.isLoading && heroMovie && (
            <HeroMovie movie={heroMovie} onSelect={onSelectMovie} />
          )}

          {/* Rows */}
          {discovery.isLoading && (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-5 w-40 bg-surface-card rounded animate-pulse" />
                  <div className="flex gap-3">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <div key={j} className="flex-shrink-0 w-32 md:w-36 aspect-[2/3] bg-surface-card rounded-lg animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!discovery.isLoading && !discovery.error && (
            <>
              <MovieRow
                title="🔥 Em Alta esta Semana"
                movies={discovery.trending.slice(1)}
                onSelect={onSelectMovie}
              />
              <MovieRow
                title="🎬 Populares Agora"
                movies={discovery.popular}
                onSelect={onSelectMovie}
              />
              <MovieRow
                title="⭐ Mais Bem Avaliados"
                movies={discovery.topRated}
                onSelect={onSelectMovie}
              />
            </>
          )}

          {discovery.error && (
            <ErrorMessage message={discovery.error} />
          )}
        </div>
      )}
    </div>
  )
}
