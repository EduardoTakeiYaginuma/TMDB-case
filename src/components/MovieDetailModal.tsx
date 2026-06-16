import { useEffect, useState, useCallback } from 'react'
import { useMovieDetail } from '@/hooks/useMovieDetail'
import { useRatingStore } from '@/store/ratingStore'
import StarRating from '@/components/StarRating'
import CastRow from '@/components/CastRow'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import type { Movie } from '@/types/movie'

interface MovieDetailModalProps {
  movie: Movie | null
  onClose: () => void
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

export default function MovieDetailModal({ movie, onClose }: MovieDetailModalProps) {
  const { detail, isLoading, error } = useMovieDetail(movie?.id ?? null)
  const { getRatingForMovie, addRating, editRating, removeRating } = useRatingStore()

  const existingRating = movie ? getRatingForMovie(movie.id) : undefined

  const [isEditing, setIsEditing] = useState(false)
  const [selectedStar, setSelectedStar] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [ratingError, setRatingError] = useState<string | null>(null)

  // Sync star state whenever the movie or existing rating changes
  useEffect(() => {
    setSelectedStar(existingRating?.rating ?? 0)
    setIsEditing(false)
    setRatingError(null)
  }, [movie?.id, existingRating?.rating])

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!movie) return
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [movie, onClose])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  async function handleSaveRating() {
    if (!movie || selectedStar < 1 || selectedStar > 5) {
      setRatingError('Selecione uma nota de 1 a 5.')
      return
    }
    setIsSaving(true)
    setRatingError(null)
    try {
      if (existingRating) {
        await editRating(movie.id, selectedStar)
        setIsEditing(false)
      } else {
        await addRating({
          tmdb_movie_id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          rating: selectedStar,
        })
      }
    } catch {
      setRatingError('Erro ao salvar avaliação. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteRating() {
    if (!movie || !existingRating) return
    setIsSaving(true)
    setRatingError(null)
    try {
      await removeRating(movie.id)
      setSelectedStar(0)
    } catch {
      setRatingError('Erro ao remover avaliação. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!movie) return null

  const data = detail ?? movie

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-surface-card rounded-2xl w-full max-w-2xl my-auto shadow-2xl overflow-hidden"
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
                {detail?.genres && detail.genres.length > 0 && (
                  <span>{detail.genres.join(', ')}</span>
                )}
              </div>
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

                {/* Already rated, not editing */}
                {existingRating && !isEditing ? (
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
