'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { StatusBadge } from '@/components/StatusBadge';

export default function AdminDashboard() {
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (!token || user?.role !== 'ADMIN')) router.push('/login');
  }, [loading, token, user, router]);

  useEffect(() => {
    if (!token) return;
    refresh();
  }, [token]);

  function refresh() {
    if (!token) return;
    api.adminStats(token).then(setStats);
    api.adminTechnicians(token).then(setTechnicians);
    api.openRequestsForAdmin(token).then(setRequests);
  }

  async function toggleVerify(id: string, verified: boolean) {
    if (!token) return;
    await api.adminVerifyTechnician(token, id, !verified);
    refresh();
  }

  if (loading || !user) return null;

  return (
    <main className="min-h-screen bg-haze">
      <Nav title="Admin" />
      <div className="mx-auto max-w-5xl space-y-10 px-6 py-10">
        {stats && (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              ['Customers', stats.customers],
              ['Technicians', stats.technicians],
              ['Verified', stats.verifiedTechnicians],
              ['Open requests', stats.openRequests],
              ['Completed jobs', stats.completedBookings],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-lg border border-line bg-white p-4">
                <p className="font-display text-2xl font-bold text-ink">{value as number}</p>
                <p className="font-mono text-xs text-ink/50">{label}</p>
              </div>
            ))}
          </section>
        )}

        <section>
          <h2 className="font-display text-lg font-bold text-ink">Technician verification</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-line bg-white">
            <table className="w-full text-sm">
              <thead className="bg-haze text-left font-mono text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Categories</th>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {technicians.map((t) => (
                  <tr key={t.id} className="border-t border-line">
                    <td className="px-4 py-3 font-medium text-ink">{t.user.fullName}</td>
                    <td className="px-4 py-3 text-ink/70">
                      {t.categories.map((c: any) => c.category.name).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-ink/70">{t.locationName || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.verified ? 'PAID' : 'PENDING'} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleVerify(t.id, t.verified)}
                        className={`rounded-md px-3 py-1 text-xs font-medium ${
                          t.verified ? 'bg-line text-ink/60' : 'bg-fix text-white'
                        }`}
                      >
                        {t.verified ? 'Revoke' : 'Verify'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink">All requests</h2>
          <div className="mt-4 space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-line bg-white p-4">
                <div>
                  <p className="font-mono text-xs text-ink/40">{r.category.name}</p>
                  <p className="font-medium text-ink">{r.description}</p>
                  <p className="text-xs text-ink/50">
                    {r.customer.fullName}
                    {r.booking?.technician ? ` → ${r.booking.technician.user.fullName}` : ''}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
