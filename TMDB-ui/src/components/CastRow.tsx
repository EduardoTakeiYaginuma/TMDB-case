import type { CastMember } from '@/types/movie'

interface CastRowProps {
  cast: CastMember[]
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export default function CastRow({ cast }: CastRowProps) {
  if (cast.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Elenco
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {cast.map((member) => (
          <div
            key={member.id}
            className="flex-shrink-0 w-20 text-center"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-elevated mx-auto mb-2 flex items-center justify-center">
              {member.profile_path ? (
                <img
                  src={member.profile_path}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-lg font-bold text-gray-400">
                  {initials(member.name)}
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-white leading-tight line-clamp-2">
              {member.name}
            </p>
            {member.character && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {member.character}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
