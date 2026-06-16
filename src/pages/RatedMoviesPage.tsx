import type { Movie } from '@/types/movie'

interface RatedMoviesPageProps {
  onSelectMovie: (movie: Movie) => void
}

export default function RatedMoviesPage({ onSelectMovie: _onSelectMovie }: RatedMoviesPageProps) {
  return (
    <div className="text-center py-20">
      <span className="text-6xl">⭐</span>
      <h2 className="text-3xl font-bold text-brand mt-4 mb-3">Filmes Avaliados</h2>
      <p className="text-gray-400">Página será implementada na Fase 6.</p>
    </div>
  )
}
