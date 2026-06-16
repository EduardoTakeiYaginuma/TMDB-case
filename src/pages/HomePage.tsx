import { useEffect, useState } from 'react'
import { useSearchStore } from '@/store/searchStore'
import { useRatingStore } from '@/store/ratingStore'
import { useDiscovery } from '@/hooks/useDiscovery'
import { useGenres } from '@/hooks/useGenres'
import { useDiscover } from '@/hooks/useDiscover'
import SearchBar from '@/components/SearchBar'
import MovieCard from '@/components/MovieCard'
import SkeletonCard from '@/components/SkeletonCard'
import MovieRow from '@/components/MovieRow'
import HeroMovie from '@/components/HeroMovie'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import type { Movie } from '@/types/movie'

interface HomePageProps {
  onSelectMovie: (movie: Movie) => void
}

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1969 }, (_, i) => CURRENT_YEAR - i)

export default function HomePage({ onSelectMovie }: HomePageProps) {
  const { query, results, totalResults, currentPage, totalPages, isLoading, isLoadingMore, error, hasSearched, search, loadMore } =
    useSearchStore()
  const { fetchRatings, getRatingForMovie } = useRatingStore()
  const discovery = useDiscovery()
  const { genres } = useGenres()

  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  const discover = useDiscover(selectedGenreId, selectedYear)

  useEffect(() => {
    fetchRatings()
  }, [fetchRatings])

  const showEmpty = hasSearched && !isLoading && !error && results.length === 0
  const showResults = !isLoading && !error && results.length > 0
  const showDiscovery = !hasSearched

  const heroMovie = discovery.trending.find((m) => m.backdrop_path) ?? discovery.trending[0]

  function toggleGenre(id: number) {
    setSelectedGenreId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-10">
      {/* Search bar */}
      <div className={`transition-all duration-300 ${showDiscovery ? 'pt-0' : 'pt-4'}`}>
        {showDiscovery && (
          <p className="text-center text-text-secondary text-sm mb-4">
            Pesquise um título ou explore as sugestões abaixo
          </p>
        )}
        <SearchBar onSearch={search} isLoading={isLoading} initialValue={query} />
      </div>

      {/* Search states */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && (
        <ErrorMessage message={error} onRetry={query ? () => search(query) : undefined} />
      )}

      {showEmpty && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <span className="text-6xl">🎬</span>
          <p className="text-text-secondary">
            Nenhum resultado para <span className="text-white font-medium">"{query}"</span>
          </p>
          <p className="text-sm text-gray-600">Tente outro título ou verifique a ortografia</p>
        </div>
      )}

      {showResults && (
        <div className="space-y-6">
          <p className="text-text-secondary text-sm">
            Exibindo{' '}
            <span className="text-white font-medium">{results.length}</span>
            {' '}de{' '}
            <span className="text-white font-medium">{totalResults.toLocaleString('pt-BR')}</span>
            {' '}resultado{totalResults !== 1 ? 's' : ''} para{' '}
            <span className="text-white">"{query}"</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {results.map((movie) => {
              const existingRating = getRatingForMovie(movie.id)
              const badge = existingRating ? (
                <span className="bg-brand text-black text-xs font-bold px-2 py-1 rounded-full">
                  ★ {existingRating.rating}
                </span>
              ) : undefined
              return (
                <MovieCard key={movie.id} movie={movie} onClick={onSelectMovie} badge={badge} />
              )
            })}
          </div>

          {currentPage < totalPages && (
            <div className="flex justify-center pt-2">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="px-8 py-2.5 bg-surface-card border border-surface-elevated text-sm
                           font-semibold text-gray-300 rounded-full hover:border-brand hover:text-white
                           disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLoadingMore ? 'Carregando…' : `Carregar mais (página ${currentPage + 1} de ${totalPages})`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Discovery section */}
      {showDiscovery && (
        <div className="space-y-8">
          {/* Genre + year filters */}
          {genres.length > 0 && (
            <div className="flex items-center gap-3">
              {/* Horizontally scrollable genre chips — no wrap on mobile */}
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5 flex-1 flex-nowrap">
                <button
                  onClick={() => { setSelectedGenreId(null); setSelectedYear(null) }}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    !selectedGenreId && !selectedYear
                      ? 'bg-brand text-black border-brand'
                      : 'border-surface-elevated text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  Todos
                </button>
                {genres.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => toggleGenre(g.id)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      selectedGenreId === g.id
                        ? 'bg-brand text-black border-brand'
                        : 'border-surface-elevated text-gray-400 hover:text-white hover:border-gray-500'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>

              {/* Year filter — always visible, never scrolls away */}
              <select
                value={selectedYear ?? ''}
                onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                className="flex-shrink-0 bg-surface-card border border-surface-elevated text-sm text-gray-400
                           rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand/60
                           hover:border-gray-500 transition-colors"
              >
                <option value="">Todos os anos</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          {/* Discover results (when filter active) */}
          {discover.isActive && (
            <div className="space-y-6">
              {discover.isLoading && <LoadingSpinner message="Filtrando filmes…" />}
              {discover.error && <ErrorMessage message={discover.error} />}
              {!discover.isLoading && !discover.error && discover.results.length === 0 && (
                <p className="text-center text-gray-500 py-12">
                  Nenhum filme encontrado para este filtro.
                </p>
              )}
              {!discover.isLoading && discover.results.length > 0 && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {discover.results.map((movie) => {
                      const existingRating = getRatingForMovie(movie.id)
                      const badge = existingRating ? (
                        <span className="bg-brand text-black text-xs font-bold px-2 py-1 rounded-full">
                          ★ {existingRating.rating}
                        </span>
                      ) : undefined
                      return (
                        <MovieCard key={movie.id} movie={movie} onClick={onSelectMovie} badge={badge} />
                      )
                    })}
                  </div>
                  {discover.currentPage < discover.totalPages && (
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={discover.loadMore}
                        disabled={discover.isLoadingMore}
                        className="px-8 py-2.5 bg-surface-card border border-surface-elevated text-sm
                                   font-semibold text-gray-300 rounded-full hover:border-brand hover:text-white
                                   disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        {discover.isLoadingMore ? 'Carregando…' : `Carregar mais (${discover.currentPage}/${discover.totalPages})`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Default discovery rows (no filter) */}
          {!discover.isActive && (
            <div className="space-y-12">
              {discovery.isLoading && (
                <div className="rounded-2xl bg-surface-card animate-pulse" style={{ minHeight: '450px' }} />
              )}
              {!discovery.isLoading && heroMovie && (
                <HeroMovie movie={heroMovie} onSelect={onSelectMovie} />
              )}

              {discovery.isLoading && (
                <div className="space-y-10">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-4">
                      <div className="h-6 w-48 bg-surface-card rounded animate-pulse" />
                      <div className="flex gap-4">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <div key={j} className="flex-shrink-0 w-36 md:w-40 aspect-[2/3] bg-surface-card rounded-lg animate-pulse" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!discovery.isLoading && !discovery.error && (
                <div className="space-y-10">
                  <MovieRow title="🔥 Em Alta esta Semana" movies={discovery.trending.slice(1)} onSelect={onSelectMovie} />
                  <MovieRow title="🎬 Populares Agora" movies={discovery.popular} onSelect={onSelectMovie} />
                  <MovieRow title="⭐ Mais Bem Avaliados" movies={discovery.topRated} onSelect={onSelectMovie} />
                </div>
              )}

              {discovery.error && <ErrorMessage message={discovery.error} />}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
