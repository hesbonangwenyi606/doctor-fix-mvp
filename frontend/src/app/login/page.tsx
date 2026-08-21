'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-haze px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg font-bold text-ink">
          DOCTOR FIX
        </Link>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink">Log in</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
            <label className="block text-sm font-medium text-ink/70">Password</label>
            <input
              type="password"
              required
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
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="mt-4 text-sm text-ink/60">
          No account? <Link href="/register" className="font-medium text-signal">Register</Link>
        </p>
        <p className="mt-2 font-mono text-xs text-ink/40">
          Admin demo login: admin@dofix.local / ChangeMe123!
        </p>
      </div>
    </main>
  );
}
