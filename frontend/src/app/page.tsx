import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { Footer } from '@/components/Footer';

const CATEGORIES = [
  'Vehicle Breakdown & Automotive',
  'Industrial Machinery',
  'School & Institutional Repairs',
  'Plumbing',
  'Electrical',
  'Appliance & Equipment',
  'Carpentry & Furniture',
  'Painting & Finishing',
  'Masonry & Building',
  'General Maintenance',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-haze">
      <header className="border-b border-line bg-ink">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-display text-lg font-bold tracking-tight text-white">DOCTOR FIX</span>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/80 hover:text-white">
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-signal px-4 py-2 text-sm font-medium text-white transition hover:bg-signal/90"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-16 pt-20">
        <p className="hero-rise font-mono text-xs uppercase tracking-widest text-signal">
          <span className="signal-pulse status-dot mr-2 bg-signal align-middle" />
          Dispatch ticket №1
        </p>
        <h1 className="hero-rise mt-3 max-w-2xl font-display text-5xl font-bold leading-[1.05] text-ink" style={{ animationDelay: '80ms' }}>
          Something's broken.
          <br />
          Get it fixed — fast.
        </h1>
        <p className="hero-rise mt-6 max-w-xl text-lg text-ink/70" style={{ animationDelay: '160ms' }}>
          Doctor Fix connects vehicle owners, households, institutions and industries with verified
          repair professionals — from a roadside breakdown to a school's electrical fault.
        </p>
        <div className="hero-rise mt-8 flex gap-3" style={{ animationDelay: '240ms' }}>
          <Link
            href="/register"
            className="hover-lift rounded-md bg-signal px-6 py-3 font-medium text-white transition hover:bg-signal/90"
          >
            Report a breakdown
          </Link>
          <Link
            href="/register"
            className="hover-lift rounded-md border border-ink/20 px-6 py-3 font-medium text-ink transition hover:bg-ink/5"
          >
            Join as a technician
          </Link>
        </div>
      </section>

      <section className="border-t border-line bg-white py-14">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink/50">
              Service categories
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="ticket-edge mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-5">
              {CATEGORIES.map((c) => (
                <div key={c} className="hover-lift relative bg-white p-4 text-sm font-medium text-ink">
                  {c}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <Reveal>
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink/50">How it works</h2>
        </Reveal>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            ['Report or schedule', 'Describe the problem, drop a pin, choose urgent or scheduled.'],
            ['Get matched', 'A verified professional in your category and area picks up the job.'],
            ['Track & pay', 'Watch the job move from accepted to in progress to done, then pay digitally.'],
          ].map(([title, desc], i) => (
            <Reveal key={title} delay={i * 100}>
              <div className="hover-lift h-full rounded-lg border border-line bg-white p-5">
                <h3 className="font-display font-bold text-ink">{title}</h3>
                <p className="mt-2 text-sm text-ink/70">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
