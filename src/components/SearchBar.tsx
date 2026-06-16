import { useState, type FormEvent } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading?: boolean
  initialValue?: string
}

export default function SearchBar({ onSearch, isLoading = false, initialValue = '' }: SearchBarProps) {
  const [value, setValue] = useState(initialValue)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) {
      onSearch(trimmed)
    }
  }

  function handleClear() {
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <span className="absolute left-4 text-gray-400 text-lg select-none">🔍</span>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar filmes..."
          disabled={isLoading}
          className="w-full bg-surface-card border border-surface-elevated rounded-xl
                     pl-12 pr-24 py-3.5 text-white placeholder-gray-500
                     focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand
                     disabled:opacity-60 transition-colors text-base"
        />

        {value && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-28 text-gray-500 hover:text-white transition-colors p-1"
            aria-label="Limpar busca"
          >
            ✕
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="absolute right-2 bg-brand text-black font-semibold
                     px-4 py-2 rounded-lg text-sm
                     hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
        >
          {isLoading ? 'Buscando…' : 'Buscar'}
        </button>
      </div>
    </form>
  )
}
