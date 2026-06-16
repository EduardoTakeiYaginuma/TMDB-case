import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import RatedMoviesPage from '@/pages/RatedMoviesPage'
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

      {/* MovieDetailModal will be rendered here in Phase 4 */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
             onClick={() => setSelectedMovie(null)}>
          <div className="bg-surface-card rounded-xl p-6 max-w-sm w-full text-center"
               onClick={(e) => e.stopPropagation()}>
            <p className="text-gray-400 text-sm mb-2">Detalhes chegam na Fase 4</p>
            <p className="text-white font-bold">{selectedMovie.title}</p>
            <button
              onClick={() => setSelectedMovie(null)}
              className="mt-4 px-4 py-2 bg-surface-elevated rounded-lg text-sm text-gray-300 hover:text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </BrowserRouter>
  )
}
