import Link from 'next/link';

const CATEGORY_TAGS = [
  'Vehicle Breakdown',
  'Plumbing',
  'Electrical',
  'Industrial Machinery',
  'Institutional Repairs',
  'Carpentry',
  'Painting',
  'Masonry',
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-ink text-white/70">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-white">DOCTOR FIX</span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              Connecting problems with professionals — quickly, reliably and transparently. One
              platform for household, vehicle, institutional and industrial repair needs.
            </p>
          </div>

          <div>
            <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-white/40">
              For customers
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/register" className="footer-link">
                  Report a breakdown
                </Link>
              </li>
              <li>
                <Link href="/register" className="footer-link">
                  Schedule maintenance
                </Link>
              </li>
              <li>
                <Link href="/login" className="footer-link">
                  Track a job
                </Link>
              </li>
              <li>
                <Link href="/#services" className="footer-link">
                  Browse services
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-white/40">
              For technicians
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/register" className="footer-link">
                  Join as a technician
                </Link>
              </li>
              <li>
                <Link href="/login" className="footer-link">
                  Technician login
                </Link>
              </li>
              <li>
                <Link href="/login" className="footer-link">
                  Admin login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div id="services" className="mt-12 flex flex-wrap gap-2 border-t border-white/10 pt-8">
          {CATEGORY_TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/15 px-3 py-1 font-mono text-xs text-white/50"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Doctor Fix. Investor demo build.</span>
          <span className="font-mono">Connecting problems with professionals.</span>
        </div>
      </div>
    </footer>
  );
}
