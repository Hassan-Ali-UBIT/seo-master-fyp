import api from "./axios";
import { setTokens, setUserRole, setHasPaid } from "../../utils/tokenStorage";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  username: string;
  contact?: string;
  hear_about_us?: string;
  referral_code?: string;
}

export async function login(payload: LoginPayload) {
  const res = await api.post("users/login/", payload, { skipAuth: true });
  const data = res.data as {
    success?: boolean;
    data?: { access?: string; refresh?: string; profile?: { role?: string }; user?: { has_paid?: boolean }; [key: string]: unknown };
    [key: string]: unknown;
  };
  const access = data?.success && data?.data?.access;
  const refresh = data?.success && data?.data?.refresh;

  if (access && refresh) {
    setTokens(access, refresh);
    const role = data?.data?.profile?.role;
    if (typeof role === 'string') {
        setUserRole(role);
    }
    const hasPaid = data?.data?.user?.has_paid;
    if (typeof hasPaid === 'boolean') {
        setHasPaid(hasPaid);
    }
  }

  console.log("Login response data:", data);

  return data; // includes user and profile
}

export async function register(payload: RegisterPayload) {
  const res = await api.post("users/register/", payload, { skipAuth: true });
  return res.data;
}

export async function getCurrentUser() {
  const res = await api.get("users/me/");
  return res.data;
}

export interface VerifyOtpPayload {
  email: string;
  otp: number;
}

export async function verifyOtp(payload: VerifyOtpPayload) {
  const res = await api.post("users/verify-otp/", payload, { skipAuth: true });
  return res.data as { success: boolean; message: string; data: { reset_token?: string }};
}

export async function resendSignUpOtp(email: string) {
  const res = await api.post(
    "users/otp/",
    { email, type: "sign_up" },
    { skipAuth: true }
  );
  return res.data as { message: string; otp_code?: number };
}

export async function sendForgotPasswordOtp(email: string) {
  const res = await api.post(
    "users/otp/",
    { email, type: "forget_password" },
    { skipAuth: true }
  );
  return res.data as { message: string; otp_code?: number };
}

export interface ResetPasswordPayload {
  reset_token: string;
  email: string;
  new_password: string;
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const res = await api.post("users/reset-password/", payload, { skipAuth: true });
  return res.data as { message: string };
}
