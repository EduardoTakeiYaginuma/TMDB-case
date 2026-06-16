import { useRef } from 'react'
import type { Movie } from '@/types/movie'
import { useRatingStore } from '@/store/ratingStore'

interface MovieRowProps {
  title: string
  movies: Movie[]
  onSelect: (movie: Movie) => void
}

export default function MovieRow({ title, movies, onSelect }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const { getRatingForMovie } = useRatingStore()

  function scroll(dir: 'left' | 'right') {
    if (!rowRef.current) return
    const amount = rowRef.current.clientWidth * 0.75
    rowRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }

  if (movies.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white px-1">{title}</h3>

      <div className="relative group">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-10 flex items-center justify-center
                     bg-gradient-to-r from-surface to-transparent
                     opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Rolar para esquerda"
        >
          <span className="bg-black/60 rounded-full w-8 h-8 flex items-center justify-center text-white text-sm">‹</span>
        </button>

        {/* Scrollable row */}
        <div
          ref={rowRef}
          className="flex gap-3 overflow-x-auto scrollbar-none pb-2"
        >
          {movies.map((movie) => {
            const rating = getRatingForMovie(movie.id)
            return (
              <button
                key={movie.id}
                onClick={() => onSelect(movie)}
                className="flex-shrink-0 w-32 md:w-36 group/card relative rounded-lg overflow-hidden
                           hover:ring-2 hover:ring-brand transition-all duration-200 hover:scale-105 bg-surface-card"
                aria-label={`Ver detalhes de ${movie.title}`}
              >
                <div className="aspect-[2/3] relative overflow-hidden bg-surface-elevated">
                  {movie.poster_path ? (
                    <img
                      src={movie.poster_path}
                      alt={`Pôster de ${movie.title}`}
                      className="w-full h-full object-cover group-hover/card:opacity-90 transition-opacity"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🎬</div>
                  )}

                  {rating && (
                    <div className="absolute top-1.5 right-1.5 bg-brand text-black text-xs font-bold px-1.5 py-0.5 rounded">
                      ★ {rating.rating}
                    </div>
                  )}

                  {movie.vote_average != null && movie.vote_average > 0 && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
                      <span className="text-xs text-brand font-semibold">★ {movie.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="p-2">
                  <p className="text-xs font-medium text-white line-clamp-2 leading-snug text-left">
                    {movie.title}
                  </p>
                  {movie.release_date && (
                    <p className="text-xs text-gray-500 mt-0.5 text-left">{movie.release_date.slice(0, 4)}</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-10 flex items-center justify-center
                     bg-gradient-to-l from-surface to-transparent
                     opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Rolar para direita"
        >
          <span className="bg-black/60 rounded-full w-8 h-8 flex items-center justify-center text-white text-sm">›</span>
        </button>
      </div>
    </div>
  )
}
