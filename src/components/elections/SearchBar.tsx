import { Search } from 'lucide-react'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  id?: string
  placeholder?: string
  label?: string
}

export function SearchBar({
  value,
  onChange,
  id = 'election-search',
  placeholder = 'Search elections...',
  label = 'Search elections',
}: SearchBarProps) {
  return (
    <div className="relative min-w-0 flex-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy-muted"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-lg border border-border bg-white py-2.5 pr-3 pl-10 text-sm text-navy outline-none transition-shadow placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/20"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
