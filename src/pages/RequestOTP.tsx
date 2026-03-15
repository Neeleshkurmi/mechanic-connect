import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, ChevronDown, Wrench } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

const COUNTRY_CODES = [
  { code: "+91", country: "IN" },
  { code: "+1", country: "US" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "AU" },
];

const RequestOTP = () => {
  const navigate = useNavigate();
  const { setMobile } = useAuthStore();
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [showCodes, setShowCodes] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateE164 = (num: string) => {
    const full = countryCode + num.replace(/\s/g, "");
    return /^\+[1-9]\d{6,14}$/.test(full);
  };

  const handleSendCode = async () => {
    setError("");
    const cleanPhone = phone.replace(/\s/g, "");

    if (!cleanPhone) {
      setError("Please enter your mobile number");
      return;
    }

    if (!validateE164(cleanPhone)) {
      setError("Mobile must be in E.164 format (e.g., +919876543210)");
      return;
    }

    setLoading(true);
    const fullMobile = countryCode + cleanPhone;

    try {
      const res = await api.requestOtp(fullMobile);
      setMobile(fullMobile);
      toast.success(res.message || "OTP sent successfully!");
      navigate("/verify");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-slate-deep px-6 pt-14 pb-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <Wrench className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-card">Call Your Mechanic</h1>
            <p className="text-sm text-muted-foreground">Help is just a tap away</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-2xl font-bold text-card mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm">
            Enter your phone number to get started
          </p>
        </motion.div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex-1 px-6 pt-8"
      >
        <label className="text-sm font-semibold text-foreground mb-3 block">
          Phone Number
        </label>

        <div
          className={`flex items-center rounded-lg border-2 transition-colors ${
            error ? "border-destructive" : "border-border focus-within:border-primary"
          } bg-card overflow-hidden`}
        >
          {/* Country code selector */}
          <button
            onClick={() => setShowCodes(!showCodes)}
            className="flex items-center gap-1 px-4 py-4 border-r border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors"
          >
            {countryCode}
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Phone input */}
          <div className="flex items-center flex-1 px-4 gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError("");
              }}
              className="flex-1 py-4 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-medium"
            />
          </div>
        </div>

        {/* Country code dropdown */}
        {showCodes && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 bg-card border border-border rounded-lg overflow-hidden shadow-lg"
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

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-destructive text-sm mt-2 font-medium"
          >
            {error}
          </motion.p>
        )}

        {/* Send Code Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSendCode}
          disabled={loading}
          className="w-full mt-8 py-4 rounded-lg bg-primary text-primary-foreground font-bold text-base disabled:opacity-60 transition-all shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full inline-block"
              />
              Sending...
            </span>
          ) : (
            "Send Code"
          )}
        </motion.button>

        <p className="text-center text-muted-foreground text-xs mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  );
};

export default RequestOTP;
