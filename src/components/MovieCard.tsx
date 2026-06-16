import type { Movie } from '@/types/movie'

interface MovieCardProps {
  movie: Movie
  onClick: (movie: Movie) => void
  badge?: React.ReactNode
}

function releaseYear(dateStr: string | null): string {
  if (!dateStr) return ''
  return dateStr.slice(0, 4)
}

export default function MovieCard({ movie, onClick, badge }: MovieCardProps) {
  return (
    <button
      onClick={() => onClick(movie)}
      className="group relative flex flex-col bg-surface-card rounded-xl overflow-hidden
                 hover:ring-2 hover:ring-brand/60 transition-all duration-300
                 hover:scale-105 text-left w-full
                 shadow-md shadow-black/40 hover:shadow-xl hover:shadow-black/60"
      aria-label={`Ver detalhes de ${movie.title}`}
    >
      <div className="relative aspect-[2/3] bg-surface-elevated overflow-hidden">
        {movie.poster_path ? (
          <img
            src={movie.poster_path}
            alt={`Pôster de ${movie.title}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 text-text-secondary">
            <span className="text-5xl mb-2">🎬</span>
          </div>
        )}

        {/* Cinematic hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {badge && (
          <div className="absolute top-2.5 right-2.5">
            {badge}
          </div>
        )}

        {/* TMDB vote badge */}
        {movie.vote_average != null && movie.vote_average > 0 && (
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm
                          text-xs font-bold text-brand px-1.5 py-0.5 rounded-md">
            ★ {movie.vote_average.toFixed(1)}
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-0.5 flex-1">
        <p className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug">
          {movie.title}
        </p>
        {movie.release_date && (
          <p className="text-xs text-text-secondary">{releaseYear(movie.release_date)}</p>
        )}
      </div>
    </button>
  )
}
