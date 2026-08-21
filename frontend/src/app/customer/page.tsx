'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api, ServiceCategory, ServiceRequestDto, ApiError } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { StatusBadge } from '@/components/StatusBadge';

export default function CustomerDashboard() {
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [requests, setRequests] = useState<ServiceRequestDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'EMERGENCY' | 'SCHEDULED'>('EMERGENCY');
  const [scheduledFor, setScheduledFor] = useState('');
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    if (!loading && (!token || user?.role !== 'CUSTOMER')) router.push('/login');
  }, [loading, token, user, router]);

  useEffect(() => {
    if (!token) return;
    api.categories().then((c) => {
      setCategories(c);
      if (c.length) setCategoryId(c[0].id);
    });
    refresh();
  }, [token]);

  function refresh() {
    if (!token) return;
    api.myRequests(token).then(setRequests).catch(() => {});
  }

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setBusy(true);
    try {
      await api.createRequest(token, {
        categoryId,
        description,
        urgency,
        scheduledFor: urgency === 'SCHEDULED' && scheduledFor ? scheduledFor : undefined,
        locationName: locationName || undefined,
      });
      setDescription('');
      setLocationName('');
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit request.');
    } finally {
      setBusy(false);
    }
  }

  async function cancel(id: string) {
    if (!token) return;
    await api.cancelRequest(token, id);
    refresh();
  }

  async function payNow(bookingId: string) {
    if (!token) return;
    await api.markPaid(token, bookingId);
    refresh();
  }

  async function leaveReview(bookingId: string) {
    if (!token) return;
    const rating = Number(window.prompt('Rate this job 1-5:', '5'));
    if (!rating) return;
    const comment = window.prompt('Optional comment:') || undefined;
    try {
      await api.submitReview(token, { bookingId, rating, comment });
      refresh();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not submit review.');
    }
  }

  if (loading || !user) return null;

  return (
    <main className="min-h-screen bg-haze">
      <Nav title="Customer" />
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-10 lg:grid-cols-[380px_1fr]">
        <section className="ticket-edge rounded-lg border border-line bg-white p-6">
          <h2 className="font-display text-lg font-bold text-ink">Report a problem</h2>
          <form onSubmit={submitRequest} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink/70">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-ink"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/70">What's wrong?</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-ink"
                placeholder="e.g. Car won't start, battery seems dead"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUrgency('EMERGENCY')}
                className={`rounded-md border px-3 py-2 text-sm font-medium ${
                  urgency === 'EMERGENCY' ? 'border-signal bg-signal text-white' : 'border-line text-ink/70'
                }`}
              >
                Urgent
              </button>
              <button
                type="button"
                onClick={() => setUrgency('SCHEDULED')}
                className={`rounded-md border px-3 py-2 text-sm font-medium ${
                  urgency === 'SCHEDULED' ? 'border-ink bg-ink text-white' : 'border-line text-ink/70'
                }`}
              >
                Schedule
              </button>
            </div>
            {urgency === 'SCHEDULED' && (
              <div>
                <label className="block text-sm font-medium text-ink/70">Preferred date/time</label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-ink"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-ink/70">Location</label>
              <input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Westlands, Nairobi"
                className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-ink"
              />
            </div>
            {error && <p className="text-sm text-signal">{error}</p>}
            <button
              type="submit"
              disabled={busy || !categoryId}
              className="w-full rounded-md bg-signal px-4 py-2.5 font-medium text-white transition hover:bg-signal/90 disabled:opacity-60"
            >
              {busy ? 'Submitting…' : 'Submit request'}
            </button>
          </form>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink">Your requests</h2>
          <div className="mt-4 space-y-3">
            {requests.length === 0 && (
              <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-ink/50">
                No requests yet — submit one to get matched with a technician.
              </p>
            )}
            {requests.map((r) => (
              <div key={r.id} className="ticket-edge rounded-lg border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-ink/40">{r.category.name}</p>
                    <p className="mt-1 font-medium text-ink">{r.description}</p>
                    {r.locationName && <p className="mt-1 text-sm text-ink/50">{r.locationName}</p>}
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                {r.booking && (
                  <div className="mt-3 rounded-md bg-haze p-3 text-sm">
                    <p className="text-ink/70">
                      Technician: <span className="font-medium text-ink">{r.booking.technician?.user.fullName}</span>
                    </p>
                    {r.booking.payment && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-ink/70">
                          Amount: KES {r.booking.payment.amount.toLocaleString()}
                        </span>
                        {r.booking.payment.status === 'PENDING' ? (
                          <button
                            onClick={() => payNow(r.booking!.id)}
                            className="rounded-md bg-fix px-3 py-1 text-xs font-medium text-white"
                          >
                            Mark as paid
                          </button>
                        ) : (
                          <StatusBadge status="PAID" />
                        )}
                      </div>
                    )}
                    {r.status === 'COMPLETED' && (
                      <button
                        onClick={() => leaveReview(r.booking!.id)}
                        className="mt-2 text-xs font-medium text-signal"
                      >
                        Leave a review →
                      </button>
                    )}
                  </div>
                )}
                {r.status === 'OPEN' && (
                  <button onClick={() => cancel(r.id)} className="mt-3 text-xs font-medium text-ink/50 hover:text-signal">
                    Cancel request
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
