import { BadgeCheck, Check, ShieldCheck } from 'lucide-react'

export function HeroVisual() {
  return (
    <div
      className="relative mx-auto flex min-h-[340px] w-full max-w-[440px] items-center justify-center sm:min-h-[400px]"
      role="img"
      aria-label="A verified ballot being cast into a secure blockchain block"
    >
      <div className="absolute inset-10 rounded-full bg-accent/10 blur-3xl" />

      <div className="float-slow absolute top-6 left-2 z-10 flex size-12 items-center justify-center rounded-xl border border-border bg-white shadow-card sm:left-4">
        <ShieldCheck className="size-6 text-accent" aria-hidden="true" />
      </div>

      <div className="float-slower absolute top-16 right-2 z-10 flex size-12 items-center justify-center rounded-xl border border-border bg-white shadow-card sm:right-6">
        <BadgeCheck className="size-6 text-accent" aria-hidden="true" />
      </div>

      <div className="hero-scene relative">
        <div className="hero-cube" aria-hidden="true">
          <div className="hero-cube-face hero-cube-face-front" />
          <div className="hero-cube-face hero-cube-face-back" />
          <div className="hero-cube-face hero-cube-face-left" />
          <div className="hero-cube-face hero-cube-face-right" />
          <div className="hero-cube-face hero-cube-face-top">
            <span className="hero-cube-slot" />
          </div>
          <div className="hero-cube-face hero-cube-face-bottom" />
        </div>

        <div className="absolute -top-6 left-1/2 z-20 w-[92px] -translate-x-1/2 -rotate-12 rounded-xl border border-border bg-white px-3 py-4 shadow-card sm:-top-4">
          <span className="mx-auto flex size-8 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Check className="size-4 stroke-[2.5]" aria-hidden="true" />
          </span>
          <span className="mt-2 block text-center text-[10px] font-semibold tracking-[0.18em] text-navy-muted uppercase">
            Ballot
          </span>
        </div>
      </div>
    </div>
  )
}
