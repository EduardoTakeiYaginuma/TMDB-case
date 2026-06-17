import { useRef } from 'react'
import type { Movie } from '@/types/movie'
import { useRatingStore } from '@/store/ratingStore'

interface MovieRowProps {
  title: string
  movies: Movie[]
  onSelect: (movie: Movie) => void
}

import MovieCard from './MovieCard'

export default function MovieRow({ title, movies, onSelect }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const { getRatingForMovie } = useRatingStore()

  function scroll(dir: 'left' | 'right') {
    if (!rowRef.current) return
    const amount = rowRef.current.clientWidth * 0.8
    rowRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }

  if (movies.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-text-primary px-1">{title}</h3>

      <div className="relative group">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center
                     bg-surface-elevated/80 backdrop-blur-sm rounded-full shadow-lg
                     opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          aria-label="Rolar para esquerda"
        >
          <span className="text-white text-2xl">‹</span>
        </button>

        {/* Scrollable row */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scrollbar-none pb-4 -mb-4"
        >
          {movies.map((movie) => {
            const existingRating = getRatingForMovie(movie.id)
            const badge = existingRating ? (
              <span className="bg-brand text-black text-xs font-bold px-2 py-1 rounded-full">
                ★ {existingRating.rating}
              </span>
            ) : undefined

            return (
              <div key={movie.id} className="w-40 md:w-44 flex-shrink-0">
                <MovieCard movie={movie} onClick={onSelect} badge={badge} />
              </div>
            )
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center
          bg-surface-elevated/80 backdrop-blur-sm rounded-full shadow-lg
          opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          aria-label="Rolar para direita"
        >
          <span className="text-white text-2xl">›</span>
        </button>
      </div>
    </div>
  )
}
