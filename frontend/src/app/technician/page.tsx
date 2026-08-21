'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api, ServiceCategory, ServiceRequestDto, BookingDto, ApiError } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { StatusBadge } from '@/components/StatusBadge';

export default function TechnicianDashboard() {
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [locationName, setLocationName] = useState('');
  const [bio, setBio] = useState('');
  const [jobs, setJobs] = useState<BookingDto[]>([]);
  const [available, setAvailable] = useState<ServiceRequestDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!token || user?.role !== 'TECHNICIAN')) router.push('/login');
  }, [loading, token, user, router]);

  useEffect(() => {
    if (!token) return;
    api.categories().then(setCategories);
    refresh();
  }, [token]);

  function refresh() {
    if (!token) return;
    api.me(token).then((data) => {
      setMe(data);
      setSelectedCats(data.technicianProfile?.categories?.map((c: any) => c.categoryId) || []);
      setLocationName(data.technicianProfile?.locationName || '');
      setBio(data.technicianProfile?.bio || '');
    });
    api.myJobs(token).then(setJobs).catch(() => {});
    api.availableJobs(token).then(setAvailable).catch(() => {});
  }

  async function accept(requestId: string) {
    if (!token) return;
    setAccepting(requestId);
    try {
      await api.acceptRequest(token, requestId);
      refresh();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not accept job.');
    } finally {
      setAccepting(null);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSavingProfile(true);
    setError(null);
    try {
      await api.updateTechnicianProfile(token, { bio, locationName, categoryIds: selectedCats });
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  function toggleCategory(id: string) {
    setSelectedCats((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function start(bookingId: string) {
    if (!token) return;
    await api.startJob(token, bookingId);
    refresh();
  }

  async function complete(bookingId: string) {
    if (!token) return;
    const amountStr = window.prompt('Amount to charge (KES), or leave blank to skip billing:');
    const amount = amountStr ? Number(amountStr) : undefined;
    await api.completeJob(token, bookingId, amount);
    refresh();
  }

  const verified = me?.technicianProfile?.verified;

  if (loading || !user) return null;

  return (
    <main className="min-h-screen bg-haze">
      <Nav title="Technician" />
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-10 lg:grid-cols-[340px_1fr]">
        <section className="ticket-edge rounded-lg border border-line bg-white p-6">
          <h2 className="font-display text-lg font-bold text-ink">Your profile</h2>
          {!verified && (
            <p className="mt-2 rounded-md bg-signal/10 p-3 text-xs text-signal">
              Awaiting admin verification. You won't receive jobs until verified.
            </p>
          )}
          <form onSubmit={saveProfile} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink/70">Categories you cover</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleCategory(c.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      selectedCats.includes(c.id) ? 'border-ink bg-ink text-white' : 'border-line text-ink/60'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/70">Location</label>
              <input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Industrial Area, Nairobi"
                className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-ink"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/70">Short bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-ink"
              />
            </div>
            {error && <p className="text-sm text-signal">{error}</p>}
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full rounded-md bg-ink px-4 py-2.5 font-medium text-white transition hover:bg-ink/90 disabled:opacity-60"
            >
              {savingProfile ? 'Saving…' : 'Save profile'}
            </button>
          </form>
          {me?.technicianProfile && (
            <p className="mt-4 font-mono text-xs text-ink/40">
              Rating: {me.technicianProfile.ratingAvg.toFixed(1)} ★ ({me.technicianProfile.ratingCount} reviews)
            </p>
          )}
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink">Available jobs</h2>
          <div className="mt-4 space-y-3">
            {available.length === 0 && (
              <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-ink/50">
                {verified
                  ? 'No open requests in your categories right now.'
                  : 'Available once your profile is verified and categories are set.'}
              </p>
            )}
            {available.map((r) => (
              <div key={r.id} className="ticket-edge rounded-lg border border-signal/30 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-ink/40">{r.category.name}</p>
                    <p className="mt-1 font-medium text-ink">{r.description}</p>
                    {r.locationName && <p className="mt-1 text-sm text-ink/50">{r.locationName}</p>}
                  </div>
                  <StatusBadge status={r.urgency === 'EMERGENCY' ? 'OPEN' : 'MATCHED'} />
                </div>
                <button
                  onClick={() => accept(r.id)}
                  disabled={accepting === r.id}
                  className="mt-3 rounded-md bg-signal px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                >
                  {accepting === r.id ? 'Accepting…' : 'Accept job'}
                </button>
              </div>
            ))}
          </div>

          <h2 className="mt-8 font-display text-lg font-bold text-ink">Your jobs</h2>
          <div className="mt-4 space-y-3">
            {jobs.length === 0 && (
              <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-ink/50">
                No accepted jobs yet.
              </p>
            )}
            {jobs.map((b) => (
              <div key={b.id} className="ticket-edge rounded-lg border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-ink/40">{b.serviceRequest?.category.name}</p>
                    <p className="mt-1 font-medium text-ink">{b.serviceRequest?.description}</p>
                    {b.serviceRequest?.locationName && (
                      <p className="mt-1 text-sm text-ink/50">{b.serviceRequest.locationName}</p>
                    )}
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="mt-3 flex gap-2">
                  {b.status === 'MATCHED' && (
                    <button
                      onClick={() => start(b.id)}
                      className="rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Start job
                    </button>
                  )}
                  {b.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => complete(b.id)}
                      className="rounded-md bg-fix px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Mark complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
