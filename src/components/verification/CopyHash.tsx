import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

type CopyHashProps = {
  value: string
  display: string
  label: string
}

export function CopyHash({ value, display, label }: CopyHashProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex min-w-0 items-center justify-end gap-2">
      <code className="max-w-full font-mono text-xs font-semibold break-all text-navy sm:text-sm">
        {display}
      </code>
      <button
        type="button"
        className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent-soft"
        onClick={() => {
          void handleCopy()
        }}
      >
        {copied ? (
          <>
            <Check className="size-3.5" aria-hidden="true" />
            Copied
          </>
        ) : (
          <>
            <Copy className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Copy {label}</span>
            Copy
          </>
        )}
      </button>
    </div>
  )
}
