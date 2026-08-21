'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Nav({ title }: { title: string }) {
  const { user, logout } = useAuth();
  return (
    <header className="border-b border-line bg-ink">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-white">
          DOCTOR FIX
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-xs text-white/60 sm:inline">{title}</span>
          {user && (
            <>
              <span className="text-sm text-white/80">{user.email}</span>
              <button
                onClick={logout}
                className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
