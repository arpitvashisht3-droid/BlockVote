type CandidatePositionsProps = {
  positions: string[]
  selected: string
  onSelect: (value: string) => void
}

export function CandidatePositions({
  positions,
  selected,
  onSelect,
}: CandidatePositionsProps) {
  if (positions.length === 0) {
    return null
  }

  const options = ['all', ...positions]

  return (
    <section aria-label="Positions in this election">
      <h2 className="text-sm font-semibold text-navy">Positions</h2>
      <div className="mt-2 flex flex-wrap gap-2" role="group">
        {options.map((item) => {
          const isSelected = selected === item
          return (
            <button
              key={item}
              type="button"
              aria-pressed={isSelected}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                isSelected
                  ? 'bg-accent text-white'
                  : 'border border-border bg-white text-navy-muted hover:text-navy'
              }`}
              onClick={() => onSelect(item)}
            >
              {item === 'all' ? 'All' : item}
            </button>
          )
        })}
      </div>
    </section>
  )
}
