import { SlidersHorizontal } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { ElectionSort } from '../../data/elections'
import { Button } from '../Button'

const sortOptions: { id: ElectionSort; label: string }[] = [
  { id: 'default', label: 'Default' },
  { id: 'votes', label: 'Most votes' },
  { id: 'title', label: 'Title A–Z' },
]

type FilterMenuProps = {
  sort: ElectionSort
  onSortChange: (sort: ElectionSort) => void
}

export function FilterMenu({ sort, onSortChange }: FilterMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const isFiltered = sort !== 'default'

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative shrink-0">
      <Button
        variant="secondary"
        className={isFiltered ? 'border-accent text-accent' : ''}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filter
      </Button>

      {open ? (
        <div
          id={menuId}
          role="dialog"
          aria-label="Election filters"
          className="card absolute top-[calc(100%+0.5rem)] left-0 z-20 w-56 p-3 sm:left-auto sm:right-0"
        >
          <p className="px-1 text-xs font-semibold tracking-wide text-navy-muted uppercase">
            Sort by
          </p>
          <div className="mt-2 flex flex-col gap-1">
            {sortOptions.map((option) => {
              const selected = option.id === sort

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selected
                      ? 'bg-accent-soft font-medium text-accent'
                      : 'text-navy hover:bg-slate-50'
                  }`}
                  onClick={() => onSortChange(option.id)}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
          <Button
            variant="ghost"
            className="mt-2 w-full"
            onClick={() => {
              onSortChange('default')
              setOpen(false)
            }}
          >
            Reset filters
          </Button>
        </div>
      ) : null}
    </div>
  )
}
