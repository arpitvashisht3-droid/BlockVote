const avatarTones = [
  'bg-accent text-white',
  'bg-upcoming text-white',
  'bg-navy text-white',
] as const

type CandidateAvatarProps = {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function CandidateAvatar({ name, size = 'md' }: CandidateAvatarProps) {
  const tone = avatarTones[name.length % avatarTones.length]
  const dimension =
    size === 'lg'
      ? 'size-20 text-xl'
      : size === 'sm'
        ? 'size-8 text-xs'
        : 'size-12 text-sm'

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${dimension} ${tone}`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  )
}
