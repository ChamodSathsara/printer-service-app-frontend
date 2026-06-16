/**
 * Lightweight storage for the JWT access/refresh token pair returned by the
 * PrinterServiceAPI backend. Kept separate from the `AuthUser` profile
 * object so tokens never leak into code that only needs display info.
 */

const ACCESS_KEY = "psv_access_token";
const REFRESH_KEY = "psv_refresh_token";

function isBrowser() {
  return typeof window !== "undefined";
}

export const tokenStore = {
  getAccessToken(): string | null {
    return isBrowser() ? localStorage.getItem(ACCESS_KEY) : null;
  },

  getRefreshToken(): string | null {
    return isBrowser() ? localStorage.getItem(REFRESH_KEY) : null;
  },

  setTokens(accessToken: string, refreshToken: string) {
    if (!isBrowser()) return;
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },

  clear() {
    if (!isBrowser()) return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};