import { useEffect, useState } from 'react'
import {
  BadgeCheck,
  Eye,
  MousePointerClick,
  ShieldCheck,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { buttonClassName } from '../components/buttonStyles'
import { HeroVisual } from '../components/HeroVisual'
import { fetchBackendElections, formatNumber, getSessionElections, type Election } from '../data/elections'
import {
  chainElectionToElection,
  fetchElectionsFromChain,
} from '../services/blockchain'
import { useDemoAuth } from '../context/DemoAuthContext'
import { AuthPromptModal } from '../components/AuthPromptModal'

const features = [
  {
    title: 'Secure & Tamper-Proof',
    description:
      'Each ballot is sealed on-chain after it is cast, so results cannot be quietly rewritten.',
    icon: ShieldCheck,
  },
  {
    title: 'Transparent Voting',
    description:
      'Election tallies stay public and auditable without exposing a voter\'s private choice.',
    icon: Eye,
  },
  {
    title: 'Blockchain Verified',
    description:
      'Every vote produces a verifiable record that anyone can inspect against the published result.',
    icon: BadgeCheck,
  },
  {
    title: 'Easy to Use',
    description:
      'Open an election, select a candidate, and submit your ballot in a few guided steps.',
    icon: MousePointerClick,
  },
]

export function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useDemoAuth()
  const [elections, setElections] = useState<Election[]>([])
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleExploreClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/elections')
      } else {
        navigate('/dashboard/elections')
      }
    } else {
      setShowAuthModal(true)
    }
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const backendData = await fetchBackendElections()
        const chainData = await fetchElectionsFromChain()
        const mapped = chainData.map(chainElectionToElection)
        const combined = [...backendData]
        for (const c of mapped) {
          if (!combined.some((e) => e.onchainId === c.onchainId || e.id === c.id)) {
            combined.push(c)
          }
        }
        if (mounted) setElections(combined)
      } catch (err) {
        console.error('Failed to load chain elections for homepage:', err)
        if (mounted) setElections(getSessionElections())
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const liveCount = elections.filter((e) => e.status === 'live').length
  const endedCount = elections.filter((e) => e.status === 'ended').length
  const totalVotes = elections.reduce((sum, e) => sum + (e.voteCount ?? 0), 0)

  const stats = [
    { value: formatNumber(liveCount), label: 'Active Elections' },
    { value: formatNumber(totalVotes), label: 'Total Votes' },
    { value: formatNumber(elections.length), label: 'Total Elections' },
    { value: formatNumber(endedCount), label: 'Completed Elections' },
  ]

  return (
    <div className="overflow-x-hidden">
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectPath={user?.role === 'admin' ? '/admin/elections' : '/dashboard/elections'}
      />

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-8 sm:px-6 sm:pt-16 lg:grid-cols-2 lg:gap-16 lg:pt-20 lg:pb-10">
        <div className="min-w-0">
          <h1 className="text-5xl font-extrabold tracking-tight text-navy sm:text-6xl lg:text-7xl lg:leading-[1.05]">
            <span className="block">Vote.</span>
            <span className="block">Verify.</span>
            <span className="block">Trust the</span>
            <span className="block text-accent">Blockchain.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-navy-muted sm:text-lg">
            BlockVote is a secure, transparent, and tamper-proof voting platform
            powered by blockchain. Cast a ballot with confidence and verify the
            outcome on-chain.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleExploreClick}
              className={buttonClassName({ size: 'lg' })}
            >
              Explore Elections
            </button>
            <a
              href="#features"
              className={buttonClassName({ variant: 'secondary', size: 'lg' })}
            >
              Learn More
            </a>
          </div>
        </div>

        <HeroVisual />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:pb-20">
        <div className="card grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-5 py-7 text-center sm:px-6 sm:py-8 ${
                index % 2 === 0 ? 'border-r border-border' : ''
              } ${index < 2 ? 'border-b border-border lg:border-b-0' : ''} ${
                index === 1 || index === 2 ? 'lg:border-r lg:border-border' : ''
              }`}
            >
              <p className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-navy-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-24 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Built for trusted elections
          </h2>
          <p className="mt-3 text-base text-navy-muted sm:text-lg">
            BlockVote keeps the voter experience simple while making every
            ballot independently verifiable.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ title, description, icon: Icon }) => (
            <article key={title} className="card p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-muted">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-24 mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16"
      >
        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-16">
          <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Elections anyone can audit
          </h2>
          <p className="text-base leading-relaxed text-navy-muted sm:text-lg">
            BlockVote records each submitted ballot as a public transaction.
            Eligible voters vote once, administrators cannot alter the count, and
            observers can confirm that the published result matches the
            on-chain record.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-4 pb-16 sm:px-6 lg:pb-24">
        <div className="rounded-2xl bg-navy px-6 py-12 text-center sm:px-10 sm:py-14">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to explore live elections?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Browse open ballots, review candidates, and cast a vote with a
            record you can verify.
          </p>
          <Link
            to="/elections"
            className={buttonClassName({
              size: 'lg',
              className: 'mt-8',
            })}
          >
            Explore Elections
          </Link>
        </div>
      </section>
    </div>
  )
}
