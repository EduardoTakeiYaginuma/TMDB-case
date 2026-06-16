interface LoadingSpinnerProps {
  message?: string
}

export default function LoadingSpinner({ message = 'Carregando…' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
      <div className="w-10 h-10 border-4 border-surface-elevated border-t-brand rounded-full animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
