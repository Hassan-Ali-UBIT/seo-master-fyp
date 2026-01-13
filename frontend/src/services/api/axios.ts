import axios from "axios";
import type {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
  AxiosRequestHeaders,
} from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from "@utils/tokenStorage";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Extend config to support skipAuth flag
declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
  }
}

// Attach access token on every request
function setAuthHeader(headers: AxiosRequestHeaders, token: string) {
  const maybe = headers as unknown as {
    set?: (key: string, value: string) => void;
  };
  if (typeof maybe.set === "function") {
    maybe.set("Authorization", `Bearer ${token}`);
  } else {
    (headers as unknown as Record<string, string>)[
      "Authorization"
    ] = `Bearer ${token}`;
  }
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Skip adding token if skipAuth flag is set
  if (config.skipAuth) {
    return config;
  }

  const token = getAccessToken();
  if (token) {
    setAuthHeader(config.headers, token);
  }
  return config;
});

// Normalize backend errors to a consistent shape
type NormalizedError = {
  success: false;
  message: string;
  data: unknown;
  status?: number;
};
type BackendError = { success: boolean; message?: string; data?: unknown };

function isBackendError(val: unknown): val is BackendError {
  return (
    !!val &&
    typeof val === "object" &&
    "success" in (val as Record<string, unknown>) &&
    "message" in (val as Record<string, unknown>) &&
    "data" in (val as Record<string, unknown>)
  );
}

function normalizeError(err: AxiosError): Promise<NormalizedError> {
  const status = err.response?.status;
  const data = err.response?.data as unknown;

  if (isBackendError(data)) {
    return Promise.reject({
      success: false,
      message: data.message || "An error occurred",
      data: data.data,
      status,
    });
  }

  return Promise.reject({
    success: false,
    message: "An error occurred",
    data: {},
    status,
  });
}

let isRefreshing = false;
let subscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  subscribers.push(callback);
}

// Handle 401 by refreshing the access token using refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If unauthorized and we have a refresh token, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        return normalizeError(error);
      }

      originalRequest._retry = true;

      // Prevent parallel refresh calls; queue requests until refresh completes
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            setAuthHeader(originalRequest.headers, newToken);
            resolve(
              api.request(originalRequest as unknown as AxiosRequestConfig)
            );
          });
        }).catch(() => normalizeError(error));
      }

      isRefreshing = true;

      try {
        type RefreshResponse = { data: { access: string } };
        const res = await axios.post<RefreshResponse>(
          `${API_BASE_URL}users/login/refresh/`,
          { refresh: refreshToken },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const newAccess = res.data?.data.access;
        if (!newAccess) {
          clearTokens();
          isRefreshing = false;
          return normalizeError(error);
        }

        setAccessToken(newAccess);
        isRefreshing = false;
        onRefreshed(newAccess);

        // Retry the original request with new token
        setAuthHeader(originalRequest.headers, newAccess);
        return api.request(originalRequest as unknown as AxiosRequestConfig);
      } catch (err) {
        console.log("Refresh token failed", err);
        clearTokens();
        isRefreshing = false;
        return normalizeError(error);
      }
    }

    return normalizeError(error);
  }
);

export default api;
