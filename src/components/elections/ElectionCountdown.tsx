import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

type ElectionCountdownProps = {
  startDate?: string
  endDate?: string
  status: 'live' | 'upcoming' | 'ended'
  className?: string
}

type TimeRemaining = {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

function calculateTimeRemaining(targetDateStr?: string): TimeRemaining {
  if (!targetDateStr) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }

  const target = new Date(targetDateStr).getTime()
  const now = new Date().getTime()
  const diff = target - now

  if (isNaN(target) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }

  const seconds = Math.floor((diff / 1000) % 60)
  const minutes = Math.floor((diff / 1000 / 60) % 60)
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  return { days, hours, minutes, seconds, isExpired: false }
}

export function ElectionCountdown({
  startDate,
  endDate,
  status,
  className = '',
}: ElectionCountdownProps) {
  const targetDate = status === 'upcoming' ? startDate : endDate
  const [time, setTime] = useState<TimeRemaining>(() => calculateTimeRemaining(targetDate))

  useEffect(() => {
    if (status === 'ended' || !targetDate) return

    const timer = setInterval(() => {
      setTime(calculateTimeRemaining(targetDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, status])

  if (status === 'ended' || time.isExpired) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-navy-muted ${className}`}>
        <Clock className="size-3.5 text-navy-muted" />
        <span>Election Ended</span>
      </div>
    )
  }

  const label = status === 'upcoming' ? 'Starts in' : 'Ends in'

  return (
    <div className={`inline-flex items-center gap-3 rounded-2xl border border-accent/20 bg-accent-soft/40 px-4 py-2.5 shadow-sm ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
        <Clock className="size-4 animate-pulse" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2 font-mono text-sm font-bold text-navy">
        {time.days > 0 && (
          <div className="flex items-center gap-0.5">
            <span>{String(time.days).padStart(2, '0')}</span>
            <span className="text-[10px] font-sans text-navy-muted">d</span>
          </div>
        )}
        <div className="flex items-center gap-0.5">
          <span>{String(time.hours).padStart(2, '0')}</span>
          <span className="text-[10px] font-sans text-navy-muted">h</span>
        </div>
        <span>:</span>
        <div className="flex items-center gap-0.5">
          <span>{String(time.minutes).padStart(2, '0')}</span>
          <span className="text-[10px] font-sans text-navy-muted">m</span>
        </div>
        <span>:</span>
        <div className="flex items-center gap-0.5">
          <span>{String(time.seconds).padStart(2, '0')}</span>
          <span className="text-[10px] font-sans text-navy-muted">s</span>
        </div>
      </div>
    </div>
  )
}
