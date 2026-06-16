/**
 * Centralized API caller.
 *
 * - `auth.*` talks directly to the ASP.NET Core PrinterServiceAPI via axios
 *   (see lib/axiosClient.ts) — that's the backend that's wired up so far.
 * - Everything else still talks to the local Next.js API routes / JSON mock
 *   in /data until those backend controllers exist and are ready to swap in.
 */

import axios from "axios";
import { axiosClient } from "./AxiosClient";
import { tokenStore } from "./TokenStore";
import type { AuthUser, Machine, Visit } from "./types";

const BASE = "/api";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      isJson && body && typeof body === "object" && "error" in body
        ? (body as { error: string }).error
        : "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return body as T;
}

function buildQuery(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// ---------------------------------------------------------------------------
// Auth — wired to the real backend, unwrapping its ApiResponse<T> envelope
// ---------------------------------------------------------------------------

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  technicianCode: string;
  fullName: string;
  role: string;
  expiresAt: string;
}

function toAuthUser(dto: LoginResponseDto): AuthUser {
  return {
    techCode: dto.technicianCode,
    name: dto.fullName,
    role: dto.role.toLowerCase() as AuthUser["role"],
  };
}

async function unwrap<T>(call: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  try {
    const { data: envelope } = await call;
    if (!envelope.success) throw new Error(envelope.message || "Request failed.");
    return envelope.data as T;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const envelope = err.response?.data as ApiEnvelope<unknown> | undefined;
      throw new Error(envelope?.message ?? "Something went wrong. Please try again.");
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Site Visits — best-effort wiring to the real backend.
//
// NOTE: I don't have your actual SiteVisitController, so the route below
// ("/sitevisits") is a guess based on naming convention, not confirmed fact.
// If it 404s, change SITE_VISITS_PATH to whatever your route actually is —
// everything else here should still hold since it's built directly from
// your CreateSiteVisitRequest / SiteVisitResponse / SolutionCategoryDto DTOs.
// ---------------------------------------------------------------------------

const SITE_VISITS_PATH = "/visits";
const SOLUTION_CATEGORIES_PATH = "/categories";

export interface SolutionCategory {
  categoryId: number;
  categoryName: string;
  sortOrder: number;
}

export interface CreateSiteVisitInput {
  machineRefNumber: string;
  categoryId: number;
  note?: string | null;
  meterReadingValue?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  locationAddress?: string | null;
}

interface SiteVisitResponseDto {
  visitId: number;
  technicianCode: string;
  technicianName: string;
  machineRefNumber: string;
  categoryId: number;
  categoryName: string;
  note: string | null;
  meterReadingValue: number | null;
  latitude: number | null;
  longitude: number | null;
  locationAddress: string | null;
  visitDate: string;
  visitTime: string;
  createdAt: string;
}

// Maps the backend's SiteVisitResponse onto your existing `Visit` shape.
// I don't have your real `Visit` interface from types.ts, so this is built
// from the fields SiteVisitPage.tsx actually reads off `submitted` — double
// check the field names line up with your real type and adjust if not.
function toVisit(dto: SiteVisitResponseDto): Visit {
  return {
    id: String(dto.visitId),
    techCode: dto.technicianCode,
    techName: dto.technicianName,
    machineRefNo: dto.machineRefNumber,
    solutionCategory: dto.categoryName,
    note: dto.note ?? "",
    meterReading: dto.meterReadingValue,
    latitude: dto.latitude,
    longitude: dto.longitude,
    visitDate: dto.visitDate,
    visitTime: dto.visitTime,
  } as Visit;
}

export const api = {
  auth: {
    login: async (techCode: string, password: string) => {
      const dto = await unwrap<LoginResponseDto>(
        axiosClient.post("/auth/login", { technicianCode: techCode, password })
      );
      tokenStore.setTokens(dto.accessToken, dto.refreshToken);
      return { user: toAuthUser(dto) };
    },

    logout: async () => {
      const refreshToken = tokenStore.getRefreshToken();
      if (refreshToken) {
        try {
          await unwrap(axiosClient.post("/auth/logout", { refreshToken }));
        } catch {
          // best effort — clear the local session regardless of server response
        }
      }
      tokenStore.clear();
    },

    changePassword: (
      currentPassword: string,
      newPassword: string,
      confirmNewPassword: string
    ) =>
      unwrap<string>(
        axiosClient.post("/auth/change-password", {
          currentPassword,
          newPassword,
          confirmNewPassword,
        })
      ),

    forgotPassword: (techCode: string) =>
      unwrap<string>(
        axiosClient.post("/auth/forgot-password", { technicianCode: techCode })
      ),

    resetPassword: (token: string, newPassword: string, confirmNewPassword: string) =>
      unwrap<string>(
        axiosClient.post("/auth/reset-password", {
          token,
          newPassword,
          confirmNewPassword,
        })
      ),
  },

  categories: {
    list: () => unwrap<SolutionCategory[]>(axiosClient.get(SOLUTION_CATEGORIES_PATH)),
  },

  // -------------------------------------------------------------------------
  // `visits.create` now hits the real backend. `list`/`get` are unchanged —
  // still pointed at the local mock until those endpoints are confirmed too.
  // -------------------------------------------------------------------------
  visits: {
    list: (params: {
      techCode?: string;
      from?: string;
      to?: string;
      search?: string;
    } = {}) => request<{ visits: Visit[] }>(`/visits${buildQuery(params)}`),

    get: (id: string) => request<{ visit: Visit }>(`/visits/${id}`),

    create: async (data: CreateSiteVisitInput) => {
      const dto = await unwrap<SiteVisitResponseDto>(
        axiosClient.post(SITE_VISITS_PATH, data)
      );
      return { visit: toVisit(dto) };
    },
  },

  machines: {
    list: (search?: string) =>
      request<{ machines: Machine[] }>(`/machines${buildQuery({ search })}`),

    get: (refNo: string) => request<{ machine: Machine }>(`/machines/${refNo}`),
  },

  technicians: {
    list: () =>
      request<{
        technicians: (AuthUser & { visitCount: number })[];
      }>(`/technicians`),

    get: (techCode: string, params: { from?: string; to?: string } = {}) =>
      request<{
        technician: AuthUser;
        visits: Visit[];
        stats: {
          totalVisits: number;
          categoryBreakdown: Record<string, number>;
          lastVisit: string | null;
        };
      }>(`/technicians/${techCode}${buildQuery(params)}`),
  },

  dashboard: {
    get: () =>
      request<{
        totalVisits: number;
        topCategories: { category: string; count: number }[];
        topTechnicians: { techCode: string; name: string; count: number }[];
        dailyTrend: { date: string; total: number; categories: Record<string, number> }[];
        categoryDistribution: { category: string; count: number; percentage: number }[];
      }>("/dashboard"),
  },

  reports: {
    overall: (params: { from?: string; to?: string; search?: string; techCode?: string } = {}) =>
      request<{ visits: Visit[] }>(`/reports/overall${buildQuery(params)}`),

    technician: (techCode: string, params: { from?: string; to?: string } = {}) =>
      request<{ technician: AuthUser; visits: Visit[] }>(
        `/reports/technician/${techCode}${buildQuery(params)}`
      ),
  },
};