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
                 hover:ring-2 hover:ring-brand transition-all duration-200
                 hover:scale-[1.02] text-left w-full"
      aria-label={`Ver detalhes de ${movie.title}`}
    >
      <div className="relative aspect-[2/3] bg-surface-elevated overflow-hidden">
        {movie.poster_path ? (
          <img
            src={movie.poster_path}
            alt={`Pôster de ${movie.title}`}
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <span className="text-4xl mb-2">🎬</span>
          </div>
        )}

        {badge && (
          <div className="absolute top-2 right-2">
            {badge}
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-0.5 flex-1">
        <p className="text-sm font-semibold text-white line-clamp-2 leading-snug">
          {movie.title}
        </p>
        {movie.release_date && (
          <p className="text-xs text-gray-500">{releaseYear(movie.release_date)}</p>
        )}
      </div>
    </button>
  )
}
