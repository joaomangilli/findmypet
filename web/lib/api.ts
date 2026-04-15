const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("findmypet_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  sendOtp: (phone: string) =>
    request("/api/v1/auth/send_otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, code: string, name?: string) =>
    request<{ token: string; user: User }>("/api/v1/auth/verify_otp", {
      method: "POST",
      body: JSON.stringify({ phone, code, name }),
    }),

  signOut: () =>
    request("/api/v1/auth/sign_out", { method: "DELETE" }),

  // Me
  getMe: () => request<User>("/api/v1/me"),
  updateMe: (data: Partial<User>) =>
    request<User>("/api/v1/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Subscribers
  subscribe: (data: SubscribeInput) =>
    request<Subscriber>("/api/v1/subscribers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Announcements
  listAnnouncements: () =>
    request<AnnouncementSummary[]>("/api/v1/announcements"),

  getAnnouncement: (id: number | string) =>
    request<AnnouncementDetail>(`/api/v1/announcements/${id}`),

  createAnnouncement: (data: CreateAnnouncementInput) =>
    request<AnnouncementDetail>("/api/v1/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  closeAnnouncement: (id: number | string, status: "found" | "closed") =>
    request<AnnouncementDetail>(`/api/v1/announcements/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  // Sightings
  createSighting: (announcementId: number | string, data: CreateSightingInput) =>
    request<Sighting>(`/api/v1/announcements/${announcementId}/sightings`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Types
export interface User {
  id: number;
  phone: string;
  name: string;
}

export interface Subscriber {
  id: number;
  phone: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  notification_radius_km: number;
}

export interface SubscribeInput {
  phone: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  notification_radius_km?: number;
}

export interface Pet {
  id: number;
  name: string;
  species: string;
  breed?: string;
  color?: string;
  description?: string;
  photos: string[];
}

export interface AnnouncementSummary {
  id: number;
  status: "active" | "found" | "closed";
  last_seen_address: string;
  last_seen_at: string;
  created_at: string;
  lat?: number;
  lng?: number;
  pet: Pet;
  owner: { id: number; name: string };
}

export interface Sighting {
  id: number;
  saw_it: boolean;
  reporter_name: string;
  address?: string;
  description?: string;
  seen_at?: string;
  lat?: number;
  lng?: number;
  created_at: string;
}

export interface AnnouncementDetail extends AnnouncementSummary {
  description: string;
  notification_radius_km: number;
  sightings_count: number;
  sightings: Sighting[];
}

export interface CreateAnnouncementInput {
  description: string;
  last_seen_address: string;
  last_seen_at: string;
  notification_radius_km: number;
  lat?: number;
  lng?: number;
  pet?: {
    name: string;
    species: string;
    breed?: string;
    color?: string;
    description?: string;
  };
  pet_id?: number;
}

export interface CreateSightingInput {
  saw_it: boolean;
  reporter_name?: string;
  reporter_phone?: string;
  address?: string;
  description?: string;
  seen_at?: string;
  lat?: number;
  lng?: number;
}
