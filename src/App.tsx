import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import RatedMoviesPage from '@/pages/RatedMoviesPage'
import MovieDetailModal from '@/components/MovieDetailModal'
import type { Movie } from '@/types/movie'

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <header className="bg-surface-card border-b border-surface-elevated sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <NavLink to="/" className="text-2xl font-bold text-brand tracking-wide">
              🎬 CineRate
            </NavLink>
            <nav className="flex gap-6 text-sm font-medium">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  isActive
                    ? 'text-brand border-b-2 border-brand pb-0.5'
                    : 'text-gray-400 hover:text-white transition-colors'
                }
              >
                Buscar
              </NavLink>
              <NavLink
                to="/rated"
                className={({ isActive }) =>
                  isActive
                    ? 'text-brand border-b-2 border-brand pb-0.5'
                    : 'text-gray-400 hover:text-white transition-colors'
                }
              >
                Avaliados
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          <Routes>
            <Route
              path="/"
              element={<HomePage onSelectMovie={setSelectedMovie} />}
            />
            <Route
              path="/rated"
              element={<RatedMoviesPage onSelectMovie={setSelectedMovie} />}
            />
          </Routes>
        </main>

        <footer className="bg-surface-card border-t border-surface-elevated py-4 text-center text-xs text-gray-500">
          CineRate · powered by TMDB
        </footer>
      </div>

      <MovieDetailModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </BrowserRouter>
  )
}
