interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <span className="text-5xl">⚠️</span>
      <p className="text-gray-300 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-5 py-2 bg-brand text-black text-sm font-semibold rounded-lg
                     hover:bg-brand-dark transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
