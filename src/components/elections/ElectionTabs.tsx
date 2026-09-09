import type { ElectionStatus } from '../../data/elections'

export type ElectionTab = 'all' | ElectionStatus

const tabs: { id: ElectionTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'ended', label: 'Ended' },
]

type ElectionTabsProps = {
  value: ElectionTab
  onChange: (value: ElectionTab) => void
}

export function ElectionTabs({ value, onChange }: ElectionTabsProps) {
  return (
    <div
      role="group"
      aria-label="Filter elections by status"
      className="flex gap-1 overflow-x-auto border-b border-border"
    >
      {tabs.map((tab) => {
        const selected = tab.id === value

        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={selected}
            aria-controls="elections-list"
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
              selected ? 'text-accent' : 'text-navy-muted hover:text-navy'
            }`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            {selected ? (
              <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
