import { useEffect, useState, useCallback } from 'react'
import { useMovieDetail } from '@/hooks/useMovieDetail'
import { useRatingStore } from '@/store/ratingStore'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/Toast'
import StarRating from '@/components/StarRating'
import CastRow from '@/components/CastRow'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import type { Movie } from '@/types/movie'

interface MovieDetailModalProps {
  movie: Movie | null
  onClose: () => void
  onRequestAuth: () => void
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Data desconhecida'
  const [year, month, day] = dateStr.split('-')
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function MovieDetailModal({ movie, onClose, onRequestAuth }: MovieDetailModalProps) {
  // Keep a local copy of movie so we can animate out after movie prop becomes null
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(movie)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (movie) {
      setCurrentMovie(movie)
      // Double rAF ensures the initial opacity-0 frame is painted before we transition
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsVisible(true))
      )
      return () => cancelAnimationFrame(id)
    } else {
      setIsVisible(false)
      const t = setTimeout(() => setCurrentMovie(null), 200)
      return () => clearTimeout(t)
    }
  }, [movie])

  const { detail, isLoading, error } = useMovieDetail(currentMovie?.id ?? null)
  const { getRatingForMovie, addRating, editRating, removeRating } = useRatingStore()
  const { isAuthenticated } = useAuthStore()
  const showToast = useToast()

  const existingRating = currentMovie ? getRatingForMovie(currentMovie.id) : undefined

  const [isEditing, setIsEditing] = useState(false)
  const [selectedStar, setSelectedStar] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [ratingError, setRatingError] = useState<string | null>(null)

  useEffect(() => {
    setSelectedStar(existingRating?.rating ?? 0)
    setIsEditing(false)
    setRatingError(null)
  }, [currentMovie?.id, existingRating?.rating])

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!currentMovie) return
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [currentMovie]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  async function handleSaveRating() {
    if (!currentMovie || selectedStar < 1 || selectedStar > 5) {
      setRatingError('Selecione uma nota de 1 a 5.')
      return
    }
    setIsSaving(true)
    setRatingError(null)
    try {
      if (existingRating) {
        await editRating(currentMovie.id, selectedStar)
        setIsEditing(false)
        showToast('Avaliação atualizada!')
      } else {
        await addRating({
          tmdb_movie_id: currentMovie.id,
          title: currentMovie.title,
          poster_path: currentMovie.poster_path,
          rating: selectedStar,
        })
        showToast('Filme avaliado!')
      }
    } catch {
      setRatingError('Erro ao salvar avaliação. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteRating() {
    if (!currentMovie || !existingRating) return
    setIsSaving(true)
    setRatingError(null)
    try {
      await removeRating(currentMovie.id)
      setSelectedStar(0)
      showToast('Avaliação removida.', 'error')
    } catch {
      setRatingError('Erro ao remover avaliação. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!currentMovie) return null

  const data = detail ?? currentMovie

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto
                  transition-all duration-200 backdrop-blur-sm
                  ${isVisible ? 'bg-black/75 opacity-100' : 'bg-black/0 opacity-0'}`}
      onClick={handleClose}
    >
      <div
        className={`bg-surface-card rounded-2xl w-full max-w-2xl my-auto overflow-hidden
                    shadow-2xl shadow-black/60 ring-1 ring-white/5
                    transition-all duration-200
                    ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Backdrop */}
        <div className="relative h-48 bg-surface-elevated overflow-hidden">
          {data.backdrop_path ? (
            <img
              src={data.backdrop_path}
              alt=""
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-surface-elevated to-surface" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent" />

          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center
                       text-white hover:bg-black/80 transition-colors text-sm font-bold"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 -mt-16 relative">
          <div className="flex gap-4 items-end mb-5">
            {/* Poster */}
            <div className="flex-shrink-0 w-24 rounded-xl overflow-hidden shadow-xl ring-2 ring-surface-elevated">
              {data.poster_path ? (
                <img
                  src={data.poster_path}
                  alt={`Pôster de ${data.title}`}
                  className="w-full aspect-[2/3] object-cover"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-surface-elevated flex items-center justify-center">
                  <span className="text-2xl">🎬</span>
                </div>
              )}
            </div>

            {/* Title & meta */}
            <div className="pb-1 min-w-0">
              <h2 className="text-xl font-bold text-white leading-tight mb-1">
                {data.title}
              </h2>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
                {data.release_date && (
                  <span>{formatDate(data.release_date)}</span>
                )}
                {detail?.runtime && (
                  <span>{detail.runtime} min</span>
                )}
              </div>
              {detail?.genres && detail.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {detail.genres.map((g) => (
                    <span
                      key={g}
                      className="text-xs bg-surface-elevated border border-white/5 px-2 py-0.5 rounded-full text-gray-300"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
              {data.vote_average != null && data.vote_average > 0 && (
                <p className="text-brand text-sm font-semibold mt-1">
                  ★ {data.vote_average.toFixed(1)} <span className="text-gray-500 font-normal">TMDB</span>
                </p>
              )}
            </div>
          </div>

          {/* Loading / Error */}
          {isLoading && <LoadingSpinner message="Carregando detalhes…" />}
          {error && <ErrorMessage message={error} />}

          {/* Detail content */}
          {!isLoading && (
            <div className="space-y-5">
              {/* Overview */}
              {data.overview && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Sinopse
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {data.overview}
                  </p>
                </div>
              )}

              {/* Cast */}
              {detail?.cast && detail.cast.length > 0 && (
                <CastRow cast={detail.cast} />
              )}

              {/* Divider */}
              <div className="border-t border-surface-elevated" />

              {/* Rating section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Sua Avaliação
                </h3>

                {/* Not authenticated */}
                {!isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-400">
                      Faça login para avaliar este filme.
                    </p>
                    <button
                      onClick={onRequestAuth}
                      className="px-4 py-1.5 bg-brand text-black text-xs font-bold rounded-lg
                                 hover:bg-amber-400 transition-colors flex-shrink-0"
                    >
                      Entrar
                    </button>
                  </div>
                ) : existingRating && !isEditing ? (
                  /* Already rated, not editing */
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <StarRating value={existingRating.rating} readonly size="md" />
                      <span className="text-brand font-bold text-lg">
                        {existingRating.rating}/5
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedStar(existingRating.rating); setIsEditing(true) }}
                        disabled={isSaving}
                        className="px-3 py-1.5 text-xs font-semibold bg-surface-elevated rounded-lg
                                   text-gray-300 hover:text-white hover:bg-opacity-80 transition-colors
                                   disabled:opacity-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={handleDeleteRating}
                        disabled={isSaving}
                        className="px-3 py-1.5 text-xs font-semibold bg-red-900/40 rounded-lg
                                   text-red-400 hover:bg-red-900/60 transition-colors
                                   disabled:opacity-50"
                      >
                        {isSaving ? 'Removendo…' : 'Remover'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* No rating or editing */
                  <div className="space-y-3">
                    <StarRating
                      value={selectedStar}
                      onChange={setSelectedStar}
                      size="md"
                    />

                    <div className="flex gap-2 items-center flex-wrap">
                      <button
                        onClick={handleSaveRating}
                        disabled={isSaving || selectedStar < 1}
                        className="px-4 py-2 bg-brand text-black text-sm font-bold rounded-lg
                                   hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed
                                   transition-colors"
                      >
                        {isSaving ? 'Salvando…' : existingRating ? 'Salvar alteração' : 'Avaliar'}
                      </button>

                      {existingRating && isEditing && (
                        <button
                          onClick={() => { setIsEditing(false); setSelectedStar(existingRating.rating) }}
                          disabled={isSaving}
                          className="px-4 py-2 bg-surface-elevated text-sm text-gray-300 rounded-lg
                                     hover:text-white transition-colors disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      )}

                      {selectedStar > 0 && (
                        <span className="text-sm text-gray-400">
                          {selectedStar}/5 estrela{selectedStar > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {ratingError && (
                      <p className="text-sm text-red-400">{ratingError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
