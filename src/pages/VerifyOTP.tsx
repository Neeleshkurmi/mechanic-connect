import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Pencil, Wrench, User, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/services/api";
import { toast } from "sonner";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const { mobile, role, setRole, setAccessToken } = useAuthStore();
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!mobile) navigate("/");
  }, [mobile, navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
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
      const res = await api.verifyOtp(mobile, code, role);
      setAccessToken(res.data.accessToken);
      toast.success(res.message || "Verified successfully!");
      navigate("/profile");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-slate-deep px-6 pt-14 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-card mb-1">Verify your number</h2>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-muted-foreground text-sm">
              Code sent to <span className="text-primary font-semibold">{mobile}</span>
            </p>
            <button
              onClick={() => navigate("/")}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex-1 px-6 pt-8"
      >
        {/* Role Toggle */}
        <label className="text-sm font-semibold text-foreground mb-3 block">
          I am a
        </label>
        <div className="flex rounded-lg overflow-hidden border-2 border-border mb-8">
          <button
            onClick={() => setRole("USER")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-semibold text-sm transition-all ${
              role === "USER"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            <User className="w-4 h-4" />
            Customer
          </button>
          <button
            onClick={() => setRole("MECHANIC")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-semibold text-sm transition-all ${
              role === "MECHANIC"
                ? "bg-slate-deep text-card"
                : "bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Wrench className="w-4 h-4" />
            Mechanic
          </button>
        </div>

        {/* OTP Input */}
        <label className="text-sm font-semibold text-foreground mb-3 block">
          Enter 6-digit code
        </label>
        <div className="flex gap-3 justify-center">
          {otp.map((digit, i) => (
            <motion.input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className={`w-12 h-14 text-center text-xl font-bold rounded-lg border-2 bg-card text-foreground outline-none transition-all ${
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

        {/* Verify Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleVerify}
          disabled={loading}
          className="w-full mt-8 py-4 rounded-lg bg-primary text-primary-foreground font-bold text-base disabled:opacity-60 transition-all shadow-lg"
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

        <button className="w-full mt-4 text-center text-primary text-sm font-semibold">
          Resend Code
        </button>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
