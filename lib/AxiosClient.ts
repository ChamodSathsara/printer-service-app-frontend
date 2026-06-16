import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { tokenStore } from "./TokenStore";

// Base URL of the ASP.NET Core API, e.g. https://localhost:7050/api
// Set NEXT_PUBLIC_API_BASE_URL in .env.local (see note in chat).
const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:51636/api";

export const axiosClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Attach the access token to every outgoing request.
axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On a 401, try refreshing the access token once and replay the request.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return null;

  try {
    // Use plain axios here (not axiosClient) so this call never gets caught
    // by the response interceptor below and loops on itself.
    const { data } = await axios.post(`${baseURL}/auth/refresh`, {
      refreshToken,
    });

    if (!data?.success) return null;

    tokenStore.setTokens(data.data.accessToken, data.data.refreshToken);
    return data.data.accessToken as string;
  } catch {
    return null;
  }
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;

    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      original &&
      !original._retried
    ) {
      original._retried = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;
      if (newAccessToken) {
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(original);
      }

      tokenStore.clear();
    }

    return Promise.reject(error);
  }
);