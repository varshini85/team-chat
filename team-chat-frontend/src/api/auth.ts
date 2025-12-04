import api from "./client";

export interface SignupPayload {
  email: string;
  name: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface NewPasswordPayload {
  email: string;
  new_password: string;
}

export interface ResetPasswordPayload {
  old_password: string;
  new_password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  name: string;
  email: string;
  message: string;
}

export const signup = async (payload: SignupPayload) => {
  const res = await api.post("/auth/signup", payload);
  return res.data;
};

export const login = async (payload: LoginPayload) => {
  const res = await api.post<LoginResponse>("/auth/login", payload);
  return res.data;
};

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const res = await api.post("/auth/forgot-password", payload);
  return res.data as { message: string };
};

export const verifyOtp = async (payload: VerifyOtpPayload) => {
  const res = await api.post("/auth/verify-otp", payload);
  return res.data as { message: string };
};

export const setNewPassword = async (payload: NewPasswordPayload) => {
  const res = await api.post("/auth/new-password", payload);
  return res.data as { message: string };
};

export const resetPassword = async (
  payload: ResetPasswordPayload,
  token: string
) => {
  const res = await api.post(
    "/auth/reset-password",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data as { message: string };
};
