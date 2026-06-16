import { useState, useEffect, useRef, type FormEvent } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading?: boolean
  initialValue?: string
}

export default function SearchBar({ onSearch, isLoading = false, initialValue = '' }: SearchBarProps) {
  const [value, setValue] = useState(initialValue)
  const lastFired = useRef('')

  // Auto-search with 500ms debounce after user stops typing (min 2 chars)
  useEffect(() => {
    const trimmed = value.trim()
    if (trimmed.length < 2 || trimmed === lastFired.current) return
    const timer = setTimeout(() => {
      lastFired.current = trimmed
      onSearch(trimmed)
    }, 500)
    return () => clearTimeout(timer)
  }, [value, onSearch])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    lastFired.current = trimmed
    onSearch(trimmed)
  }

  function handleClear() {
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto group/form">
      <div className="relative flex items-center transition-shadow duration-300
                      focus-within:drop-shadow-[0_0_20px_rgba(245,197,24,0.15)]">
        <span className="absolute left-4 text-text-secondary text-lg select-none">🔍</span>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar filmes..."
          disabled={isLoading}
          className="w-full bg-surface-card border border-white/10 rounded-full
                     pl-12 pr-32 py-3 text-white placeholder-text-secondary
                     focus:outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/30
                     disabled:opacity-60 transition-all duration-300 text-base"
        />

        {value && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-36 text-text-secondary hover:text-white transition-colors p-1"
            aria-label="Limpar busca"
          >
            ✕
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-brand text-black font-semibold
                     px-5 py-1.5 rounded-full text-sm
                     hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
        >
          {isLoading ? 'Buscando…' : 'Buscar'}
        </button>
      </div>
    </form>
  )
}
