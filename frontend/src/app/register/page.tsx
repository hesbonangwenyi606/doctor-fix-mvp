'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ApiError, Role } from '@/lib/api';

export default function RegisterPage() {
  const { register } = useAuth();
  const [role, setRole] = useState<Role>('CUSTOMER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register({ email, password, fullName, phone: phone || undefined, role });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-haze px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg font-bold text-ink">
          DOCTOR FIX
        </Link>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink">Create your account</h1>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {(['CUSTOMER', 'TECHNICIAN'] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                role === r ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink/70'
              }`}
            >
              {r === 'CUSTOMER' ? "I need a repair" : "I'm a technician"}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink/70">Full name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-ink focus:border-ink"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-ink focus:border-ink"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70">Phone (optional)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-ink focus:border-ink"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-ink focus:border-ink"
            />
          </div>
          {error && <p className="text-sm text-signal">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-signal px-4 py-2.5 font-medium text-white transition hover:bg-signal/90 disabled:opacity-60"
          >
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-4 text-sm text-ink/60">
          Already registered? <Link href="/login" className="font-medium text-signal">Log in</Link>
        </p>
      </div>
    </main>
  );
}
