import type { Movie } from '@/types/movie'

interface HeroMovieProps {
  movie: Movie
  onSelect: (movie: Movie) => void
}

export default function HeroMovie({ movie, onSelect }: HeroMovieProps) {
  const year = movie.release_date?.slice(0, 4)
  const overview = movie.overview?.length > 200
    ? movie.overview.slice(0, 200).trimEnd() + '…'
    : movie.overview

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ minHeight: '420px' }}>
      {/* Backdrop */}
      {movie.backdrop_path ? (
        <img
          src={movie.backdrop_path}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated to-surface" />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-12" style={{ minHeight: '420px' }}>
        <div className="max-w-xl">
          {/* Badge */}
          <span className="inline-block bg-brand text-black text-xs font-bold px-2 py-0.5 rounded mb-3 uppercase tracking-wide">
            Em Alta esta Semana
          </span>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-2 drop-shadow-lg">
            {movie.title}
          </h2>

          <div className="flex items-center gap-3 mb-4 text-sm text-gray-300">
            {year && <span>{year}</span>}
            {movie.vote_average != null && movie.vote_average > 0 && (
              <span className="flex items-center gap-1 text-brand font-semibold">
                ★ {movie.vote_average.toFixed(1)}
              </span>
            )}
          </div>

          {overview && (
            <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-md line-clamp-4">
              {overview}
            </p>
          )}

          <button
            onClick={() => onSelect(movie)}
            className="inline-flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-xl
                       hover:bg-gray-100 transition-colors text-sm shadow-xl"
          >
            ▶ Ver Detalhes
          </button>
        </div>
      </div>
    </div>
  )
}
