import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { ToastProvider } from '@/components/Toast'
import { useAuthStore } from '@/store/authStore'
import { useRatingStore } from '@/store/ratingStore'
import HomePage from '@/pages/HomePage'
import RatedMoviesPage from '@/pages/RatedMoviesPage'
import MovieDetailModal from '@/components/MovieDetailModal'
import AuthModal from '@/components/AuthModal'
import type { Movie } from '@/types/movie'

type AuthTab = 'login' | 'register'

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<AuthTab>('login')

  const { user, isAuthenticated, logout } = useAuthStore()
  const { reset: resetRatings, fetchRatings } = useRatingStore()

  function openAuthModal(tab: AuthTab = 'login') {
    setAuthModalTab(tab)
    setAuthModalOpen(true)
  }

  // When the token expires (401 from any protected endpoint), clear state
  useEffect(() => {
    function handleExpired() {
      logout()
      resetRatings()
    }
    window.addEventListener('cinerate:auth-expired', handleExpired)
    return () => window.removeEventListener('cinerate:auth-expired', handleExpired)
  }, [logout, resetRatings])

  // Fetch ratings whenever auth state changes (login / page reload with valid token)
  useEffect(() => {
    if (isAuthenticated) {
      fetchRatings()
    } else {
      resetRatings()
    }
  }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

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

              <div className="flex items-center gap-2">
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

                {/* Auth area */}
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
                    <span className="text-sm text-gray-400 hidden sm:block">
                      {user.username}
                    </span>
                    <button
                      onClick={() => { logout(); resetRatings() }}
                      className="px-3 py-1.5 rounded-full text-sm font-medium text-text-secondary
                                 hover:text-white hover:bg-white/5 transition-all duration-200"
                    >
                      Sair
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1 ml-2 pl-2 border-l border-white/10">
                    <button
                      onClick={() => openAuthModal('login')}
                      className="px-4 py-1.5 rounded-full text-sm font-medium text-text-secondary
                                 hover:text-white hover:bg-white/5 transition-all duration-200"
                    >
                      Entrar
                    </button>
                    <button
                      onClick={() => openAuthModal('register')}
                      className="px-4 py-1.5 rounded-full text-sm font-semibold bg-brand text-black
                                 hover:bg-amber-400 transition-all duration-200"
                    >
                      Cadastrar
                    </button>
                  </div>
                )}
              </div>
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
                element={
                  <RatedMoviesPage
                    onSelectMovie={setSelectedMovie}
                    onRequestAuth={() => openAuthModal('login')}
                  />
                }
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
          onRequestAuth={() => openAuthModal('login')}
        />

        <AuthModal
          isOpen={authModalOpen}
          defaultTab={authModalTab}
          onClose={() => setAuthModalOpen(false)}
        />
      </BrowserRouter>
    </ToastProvider>
  )
}
