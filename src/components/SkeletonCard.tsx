export default function SkeletonCard() {
  return (
    <div className="flex flex-col bg-surface-card rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-surface-elevated" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-surface-elevated rounded w-3/4" />
        <div className="h-3 bg-surface-elevated rounded w-1/2" />
      </div>
    </div>
  )
}
