const ACCESS_TOKEN_KEY = "smp_access_token";
const REFRESH_TOKEN_KEY = "smp_refresh_token";

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function setAccessToken(access: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("smp_user_role");
  localStorage.removeItem("smp_has_paid");
}


export function setUserRole(role: string) {
  localStorage.setItem("smp_user_role", role);
}

export function getUserRole(): string | null {
  return localStorage.getItem("smp_user_role");
}

export function setHasPaid(hasPaid: boolean) {
  localStorage.setItem("smp_has_paid", String(hasPaid));
}

export function getHasPaid(): boolean {
  return localStorage.getItem("smp_has_paid") === "true";
}

