const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

interface ApiResponse<T = unknown> {
  timestamp: string;
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

interface VerifyOtpData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  mobile: string;
  role: "USER" | "MECHANIC";
}

async function request<T>(endpoint: string, body: object): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data: ApiResponse<T> = await res.json();

  if (!res.ok || !data.success) {
    const message = data.errors?.length
      ? data.errors.join(", ")
      : data.message || "Something went wrong";
    throw new Error(message);
  }

  return data;
}

export const api = {
  requestOtp: (mobile: string) =>
    request<string>("/api/v1/auth/otp/request", { mobile }),

  verifyOtp: (mobile: string, otp: string, role: "USER" | "MECHANIC") =>
    request<VerifyOtpData>("/api/v1/auth/otp/verify", { mobile, otp, role }),

  updateRole: (mobile: string, role: "USER" | "MECHANIC") =>
    request<string>("/api/v1/auth/user/role", { mobile, role }),
};
