import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ChevronDown, Wrench, Loader2, Pencil, ShieldCheck } from "lucide-react";
import type { ConfirmationResult } from "firebase/auth";
import { sendOtp, friendlyAuthError, isFirebaseConfigured } from "@/lib/firebase";
import { toast } from "sonner";

const COUNTRY_CODES = [
  { code: "+91", country: "India" },
  { code: "+1", country: "USA" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "Australia" },
];

type Step = "phone" | "otp";

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [showCodes, setShowCodes] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fullPhone = countryCode + phone.replace(/\s/g, "");

  useEffect(() => {
    if (step === "otp") inputRefs.current[0]?.focus();
  }, [step]);

  const validateE164 = () => /^\+[1-9]\d{6,14}$/.test(fullPhone);

  const handleSendCode = async () => {
    setError("");
    if (!phone.replace(/\s/g, "")) {
      setError("Please enter your mobile number");
      return;
    }
    if (!validateE164()) {
      setError("Enter a valid mobile number (e.g. 9876543210)");
      return;
    }
    setLoading(true);
    try {
      const result = await sendOtp(fullPhone);
      setConfirmation(result);
      toast.success("OTP sent to " + fullPhone);
      setStep("otp");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    setLoading(true);
    try {
      await confirmation?.confirm(code);
      toast.success("Signed in successfully!");
      navigate("/role");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-deep flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

      {/* Centered card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
      >
        {/* Card header */}
        <div className="bg-slate-deep px-8 pt-8 pb-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center shadow-lg">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-card leading-tight">Call Your Mechanic</h1>
              <p className="text-xs text-muted-foreground">Help is just a tap away</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-7">
          {!isFirebaseConfigured && (
            <div className="mb-5 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs text-destructive font-medium">
              Firebase is not configured yet. Add your Firebase web app keys to the <code>.env</code> file to enable SMS sign-in.
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-xl font-bold text-foreground mb-1">Welcome back</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter your phone number to get started
                </p>

                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Phone Number
                </label>
                <div
                  className={`relative flex items-center rounded-lg border-2 transition-colors ${
                    error ? "border-destructive" : "border-border focus-within:border-primary"
                  } bg-card overflow-visible`}
                >
                  <button
                    type="button"
                    onClick={() => setShowCodes(!showCodes)}
                    className="flex items-center gap-1 px-4 py-3.5 border-r border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors rounded-l-md"
                  >
                    {countryCode}
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <div className="flex items-center flex-1 px-4 gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/[^\d\s]/g, ""));
                        setError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                      className="flex-1 py-3.5 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-medium min-w-0"
                    />
                  </div>

                  {showCodes && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg overflow-hidden shadow-xl z-10"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => {
                            setCountryCode(c.code);
                            setShowCodes(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm font-medium flex justify-between items-center hover:bg-secondary transition-colors ${
                            countryCode === c.code ? "bg-amber-soft text-primary" : "text-foreground"
                          }`}
                        >
                          <span>{c.country}</span>
                          <span className="text-muted-foreground">{c.code}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-destructive text-sm mt-2 font-medium"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSendCode}
                  disabled={loading}
                  className="w-full mt-6 py-3.5 rounded-lg bg-primary text-primary-foreground font-bold text-base disabled:opacity-60 transition-all shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Send Code"
                  )}
                </motion.button>

                <p className="flex items-center justify-center gap-1.5 text-center text-muted-foreground text-xs mt-5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Secured by Firebase Authentication
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-xl font-bold text-foreground mb-1">Verify your number</h2>
                <div className="flex items-center gap-2 mb-6">
                  <p className="text-sm text-muted-foreground">
                    Code sent to <span className="text-primary font-semibold">{fullPhone}</span>
                  </p>
                  <button
                    onClick={() => {
                      setStep("phone");
                      setOtp(Array(6).fill(""));
                      setError("");
                    }}
                    className="text-primary hover:text-primary/80 transition-colors"
                    aria-label="Edit phone number"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>

                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Enter 6-digit code
                </label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border-2 bg-card text-foreground outline-none transition-all ${
                        error
                          ? "border-destructive"
                          : digit
                          ? "border-primary"
                          : "border-border focus:border-primary"
                      }`}
                    />
                  ))}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-destructive text-sm mt-3 text-center font-medium"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full mt-6 py-3.5 rounded-lg bg-primary text-primary-foreground font-bold text-base disabled:opacity-60 transition-all shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "Verify & Continue"
                  )}
                </motion.button>

                <button
                  onClick={handleSendCode}
                  disabled={loading}
                  className="w-full mt-3 text-center text-primary text-sm font-semibold hover:text-primary/80 transition-colors"
                >
                  Resend Code
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Invisible reCAPTCHA mount point (required by Firebase phone auth) */}
      <div id="recaptcha-container" />
    </div>
  );
};

export default Login;
