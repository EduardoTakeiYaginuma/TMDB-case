import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-4xl',
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  const display = hovered > 0 ? hovered : value

  return (
    <div
      className="flex gap-1"
      onMouseLeave={() => !readonly && setHovered(0)}
      aria-label={`Avaliação: ${value} de 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          className={`
            leading-none transition-transform
            ${sizeClasses[size]}
            ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
          `}
          aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
        >
          <span className={display >= star ? 'text-brand' : 'text-gray-600'}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}
