import { Link } from 'react-router-dom'
import { Logo } from './Logo'

const footerLinks = [
  { label: 'Home', to: '/' },
  { label: 'Elections', to: '/elections' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
] as const

export function Footer() {
  return (
    <footer id="contact" className="scroll-mt-24 border-t border-border bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-muted">
            Secure, transparent, and tamper-proof voting powered by blockchain.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-navy">Product</h2>
          <ul className="mt-4 space-y-2">
            {footerLinks.map((item) => (
              <li key={item.label}>
                {'to' in item ? (
                  <Link
                    to={item.to}
                    className="text-sm text-navy-muted transition-colors hover:text-navy"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className="text-sm text-navy-muted transition-colors hover:text-navy"
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-navy">Contact</h2>
          <p className="mt-4 text-sm leading-relaxed text-navy-muted">
            For election onboarding or partnerships, reach the BlockVote team at{' '}
            <a
              href="mailto:hello@blockvote.app"
              className="font-medium text-navy underline-offset-2 hover:text-accent hover:underline"
            >
              hello@blockvote.app
            </a>
            .
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-sm text-navy-muted sm:px-6">
          © {new Date().getFullYear()} BlockVote. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
