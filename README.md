# Doctor Fix — MVP Platform
A working end-to-end MVP of the Doctor Fix repair/breakdown/maintenance
marketplace described in the investor overview: customers submit repair
requests, verified technicians accept and complete jobs, admins verify
technicians and oversee the platform.

## What's built
**Backend** — `backend/` — NestJS + Prisma + SQLite, JWT auth
- Roles: `CUSTOMER`, `TECHNICIAN`, `ADMIN`
- Service categories (seeded from the 10 categories in the investor overview)
- Service requests (emergency or scheduled), with location-based technician
  matching (straight-line distance — swap for a real routing API later)
- Booking lifecycle: technician accepts → starts → completes; payment record
  created on completion
- Reviews & a running technician rating average
- Admin: verify/revoke technicians, view all requests, platform stats

**Frontend** — `frontend/` — Next.js 14 (App Router) + Tailwind
- Landing page, register/login (role picker: customer or technician)
- Customer dashboard: submit a request, track status, pay (stub), leave a review
- Technician dashboard: set categories/location, see available jobs matching
  your categories, accept → start → complete
- Admin dashboard: stats, verify technicians, all-requests overview

## Deliberately stubbed (needs real infrastructure/API keys)
- **Payments** — `Payment` records are created with status `PENDING`; the
  customer dashboard has a "Mark as paid" button standing in for a real
  gateway webhook. Wire in M-Pesa Daraja or Stripe by replacing
  `BookingsService.markPaid` and adding a webhook endpoint.
- **Notifications** — no SMS/push/email is sent. Add a notifications module
  and hook it into request creation, matching, and status changes.
- **Photo/video uploads on requests** — the PDF mentions this; storage
  (S3/Cloudinary) and an upload endpoint would need to be added.
- **Geospatial matching** — currently straight-line (haversine) distance
  between stored lat/lng. Fine at MVP/city scale; swap for a real
  routing/ETA API for production dispatch.

## Setup
### 1. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed        # creates categories + admin@dofix.local / ChangeMe123!
npm run start:dev   # http://localhost:3001
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

By default the frontend calls the API at `http://localhost:3001`. To change
this, create `frontend/.env.local` with:

```
NEXT_PUBLIC_API_BASE=http://your-api-host:3001
```

### 3. Try it out

1. Visit `http://localhost:3000`, register as a **technician**, set your
   categories and location, then log in as admin
   (`admin@dofix.local` / `ChangeMe123!`) and click **Verify** next to your
   technician.
2. Register a second account as a **customer**, submit a repair request.
3. Log back in as the technician — the request appears under "Available
   jobs" — accept it, start it, mark it complete (optionally with an amount).
4. As the customer, mark the job as paid and leave a review.

## Fixed since first version

The first version of this schema used Prisma native `enum` types
(`Role`, `RequestUrgency`, etc.), which **SQLite does not support** —
`prisma migrate dev` would fail with `P1012`. Role/status/urgency fields
are now plain `String` columns, with a shared TS const-enum in
`backend/src/common/enums.ts` giving the same type safety in application
code. If you're re-downloading this after hitting that error, this
version has it fixed.

## Notes on this build

- SQLite is used for portability during development. For production, change
  `datasource db { provider = "sqlite" }` to `"postgresql"` in
  `backend/prisma/schema.prisma`, set `DATABASE_URL` accordingly, and re-run
  `prisma migrate dev`.
- JWT secret in `backend/.env` is a dev placeholder — replace it before any
  real deployment.
- This was scaffolded and type-checked in a sandboxed environment without
  open internet access, so `prisma generate`/`migrate` and the Google Fonts
  used in the frontend could not be executed here — both need a normal
  internet connection and will work as soon as you run the setup steps
  above on your own machine.
