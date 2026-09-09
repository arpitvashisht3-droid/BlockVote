import { Link } from 'react-router-dom'
import { buttonClassName } from '../buttonStyles'

type TrustStatementProps = {
  resultsPath: string
}

export function TrustStatement({ resultsPath }: TrustStatementProps) {
  return (
    <section className="rounded-2xl bg-navy px-6 py-12 text-center sm:px-10">
      <h2 className="text-3xl font-bold tracking-tight text-white">
        Your vote. Your proof.
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
        BlockVote uses blockchain technology to create a transparent and
        tamper-resistant record of the election. Anyone can verify the final
        result without accessing voter identities.
      </p>
      <Link
        to={resultsPath}
        className={buttonClassName({ size: 'lg', className: 'mt-8' })}
      >
        Back to Election Results
      </Link>
    </section>
  )
}
