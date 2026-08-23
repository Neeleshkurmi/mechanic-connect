import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "USER" | "MECHANIC";

interface LocationState {
  lat: number;
  lng: number;
  accuracy: number;
  capturedAt: string;
}

interface AuthState {
  role: Role | null;
  name: string;
  experience: string;
  services: string[];
  location: LocationState | null;
  setRole: (role: Role) => void;
  setProfile: (data: { name: string; experience?: string; services?: string[] }) => void;
  setLocation: (loc: LocationState) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      name: "",
      experience: "",
      services: [],
      location: null,
      setRole: (role) => set({ role }),
      setProfile: ({ name, experience, services }) =>
        set({ name, ...(experience !== undefined ? { experience } : {}), ...(services ? { services } : {}) }),
      setLocation: (location) => set({ location }),
      reset: () => set({ role: null, name: "", experience: "", services: [], location: null }),
    }),
    { name: "cym-profile" }
  )
);
