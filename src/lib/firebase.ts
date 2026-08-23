import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  type ConfirmationResult,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured =
  !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "your-api-key";

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export function getRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
  }
  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
  });
  return window.recaptchaVerifier;
}

export function sendOtp(phoneE164: string): Promise<ConfirmationResult> {
  const verifier = getRecaptchaVerifier("recaptcha-container");
  return signInWithPhoneNumber(auth, phoneE164, verifier);
}

export function watchAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/** Map Firebase auth error codes to friendly messages. */
export function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-phone-number":
      return "Invalid phone number. Use full international format (e.g. +919876543210).";
    case "auth/invalid-verification-code":
      return "Incorrect OTP code. Please check and try again.";
    case "auth/code-expired":
      return "This code has expired. Request a new one.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a while and try again.";
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
      return "Firebase is not configured. Add your Firebase web app keys to the .env file.";
    case "auth/captcha-check-failed":
      return "reCAPTCHA check failed. Please try again.";
    default:
      return (err as Error)?.message || "Something went wrong. Please try again.";
  }
}
