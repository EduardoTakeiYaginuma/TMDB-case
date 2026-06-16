import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { ToastProvider } from '@/components/Toast'
import HomePage from '@/pages/HomePage'
import RatedMoviesPage from '@/pages/RatedMoviesPage'
import MovieDetailModal from '@/components/MovieDetailModal'
import type { Movie } from '@/types/movie'

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

  return (
    <ToastProvider>
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <header className="bg-black/40 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-2">
              <span className="text-xl">🎬</span>
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-brand via-amber-300 to-brand bg-clip-text text-transparent">
                CineRate
              </span>
            </NavLink>

            <nav className="flex gap-1 text-sm font-medium">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-brand/15 text-brand'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`
                }
              >
                Buscar
              </NavLink>
              <NavLink
                to="/rated"
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-brand/15 text-brand'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`
                }
              >
                Avaliados
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
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

        <footer className="border-t border-white/5 py-6 text-center text-sm text-text-secondary">
          CineRate &copy; {new Date().getFullYear()} &middot; powered by{' '}
          <span className="text-brand font-medium">TMDB</span>
        </footer>
      </div>

      <MovieDetailModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </BrowserRouter>
    </ToastProvider>
  )
}
