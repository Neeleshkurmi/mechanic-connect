import { create } from "zustand";

interface AuthState {
  mobile: string;
  role: "USER" | "MECHANIC";
  accessToken: string | null;
  setMobile: (mobile: string) => void;
  setRole: (role: "USER" | "MECHANIC") => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  mobile: "",
  role: "USER",
  accessToken: null,
  setMobile: (mobile) => set({ mobile }),
  setRole: (role) => set({ role }),
  setAccessToken: (token) => set({ accessToken: token }),
  logout: () => set({ mobile: "", role: "USER", accessToken: null }),
}));
