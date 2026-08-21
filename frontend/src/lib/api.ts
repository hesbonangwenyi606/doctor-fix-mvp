const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      // ignore parse failure, fall back to statusText
    }
    throw new ApiError(res.status, Array.isArray(message) ? message.join(', ') : message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export type Role = 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string | null;
}

export interface ServiceRequestDto {
  id: string;
  description: string;
  urgency: 'EMERGENCY' | 'SCHEDULED';
  status: 'OPEN' | 'MATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  category: ServiceCategory;
  booking?: BookingDto | null;
}

export interface BookingDto {
  id: string;
  status: string;
  acceptedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  serviceRequest?: ServiceRequestDto;
  technician?: { user: { fullName: string; phone?: string | null } };
  payment?: { id: string; amount: number; status: string } | null;
}

export interface TechnicianMatch {
  id: string;
  bio?: string | null;
  verified: boolean;
  ratingAvg: number;
  ratingCount: number;
  distanceKm?: number | null;
  user: { fullName: string; phone?: string | null };
}

export const api = {
  register: (body: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: Role;
  }) => request<{ accessToken: string; user: AuthUser }>('/auth/register', { method: 'POST', body }),

  login: (body: { email: string; password: string }) =>
    request<{ accessToken: string; user: AuthUser }>('/auth/login', { method: 'POST', body }),

  me: (token: string) => request<any>('/users/me', { token }),

  updateTechnicianProfile: (
    token: string,
    body: { bio?: string; latitude?: number; longitude?: number; locationName?: string; categoryIds?: string[] },
  ) => request<any>('/users/me/technician-profile', { method: 'PATCH', token, body }),

  categories: () => request<ServiceCategory[]>('/categories'),

  createRequest: (
    token: string,
    body: {
      categoryId: string;
      description: string;
      urgency: 'EMERGENCY' | 'SCHEDULED';
      scheduledFor?: string;
      latitude?: number;
      longitude?: number;
      locationName?: string;
    },
  ) => request<ServiceRequestDto>('/requests', { method: 'POST', token, body }),

  myRequests: (token: string) => request<ServiceRequestDto[]>('/requests/mine', { token }),

  availableJobs: (token: string) =>
    request<ServiceRequestDto[]>('/requests/available/for-technician', { token }),

  cancelRequest: (token: string, id: string) =>
    request<ServiceRequestDto>(`/requests/${id}`, { method: 'DELETE', token }),

  matchingTechnicians: (token: string, requestId: string) =>
    request<TechnicianMatch[]>(`/requests/${requestId}/matches`, { token }),

  openRequestsForAdmin: (token: string) => request<ServiceRequestDto[]>('/admin/requests', { token }),

  acceptRequest: (token: string, requestId: string) =>
    request<BookingDto>(`/bookings/accept/${requestId}`, { method: 'POST', token }),

  myJobs: (token: string) => request<BookingDto[]>('/bookings/mine', { token }),

  startJob: (token: string, bookingId: string) =>
    request<BookingDto>(`/bookings/${bookingId}/start`, { method: 'POST', token }),

  completeJob: (token: string, bookingId: string, amount?: number) =>
    request<BookingDto>(`/bookings/${bookingId}/complete`, { method: 'POST', token, body: { amount } }),

  markPaid: (token: string, bookingId: string) =>
    request<any>(`/bookings/${bookingId}/mark-paid`, { method: 'POST', token }),

  submitReview: (token: string, body: { bookingId: string; rating: number; comment?: string }) =>
    request<any>('/reviews', { method: 'POST', token, body }),

  adminTechnicians: (token: string) => request<any[]>('/admin/technicians', { token }),

  adminVerifyTechnician: (token: string, id: string, verified: boolean) =>
    request<any>(`/admin/technicians/${id}/verify`, { method: 'PATCH', token, body: { verified } }),

  adminStats: (token: string) =>
    request<{
      customers: number;
      technicians: number;
      verifiedTechnicians: number;
      openRequests: number;
      completedBookings: number;
    }>('/admin/stats', { token }),
};
