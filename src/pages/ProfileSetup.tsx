import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, User, Wrench, Briefcase, Check } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { watchAuth } from "@/lib/firebase";
import { toast } from "sonner";

const SERVICES = [
  "Tyre Jump",
  "Battery Jumpstart",
  "Fuel Delivery",
  "Towing",
  "Engine Diagnostics",
  "Brake Repair",
  "Oil Change",
  "AC Repair",
];

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { role, name, experience, services, setProfile } = useAuthStore();
  const [fullName, setFullName] = useState(name);
  const [years, setYears] = useState(experience);
  const [selectedServices, setSelectedServices] = useState<string[]>(services);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsub = watchAuth((user) => {
      if (!user) navigate("/");
      setCheckingAuth(false);
    });
    return unsub;
  }, [navigate]);

  useEffect(() => {
    if (!role) navigate("/role");
  }, [role, navigate]);

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
    setError("");
  };

  const handleNext = () => {
    if (!fullName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (role === "MECHANIC") {
      if (!years.trim()) {
        setError("Please enter your years of experience");
        return;
      }
      if (selectedServices.length === 0) {
        setError("Please select at least one service you offer");
        return;
      }
    }
    setProfile({
      name: fullName.trim(),
      experience: years.trim(),
      services: selectedServices,
    });
    toast.success("Profile saved!");
    navigate("/home");
  };

  if (checkingAuth || !role) {
    return (
      <div className="min-h-screen bg-slate-deep flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isMechanic = role === "MECHANIC";
  const RoleIcon = isMechanic ? Wrench : User;

  return (
    <div className="min-h-screen bg-slate-deep flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
      >
        <div className="px-8 pt-8 pb-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">
              Step 2 of 2
            </p>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-secondary rounded-full px-3 py-1">
              <RoleIcon className="w-3.5 h-3.5" />
              {isMechanic ? "Mechanic" : "User"}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {isMechanic ? "Set up your workshop profile" : "Tell us your name"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {isMechanic
              ? "Customers will see this when requesting your help"
              : "So mechanics know who they're helping"}
          </p>
        </div>

        <div className="px-8 pb-8 space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Full Name</label>
            <div
              className={`flex items-center rounded-lg border-2 transition-colors ${
                error && !fullName.trim()
                  ? "border-destructive"
                  : "border-border focus-within:border-primary"
              } bg-card`}
            >
              <div className="pl-4">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setError("");
                }}
                className="flex-1 px-3 py-3.5 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-medium min-w-0"
              />
            </div>
          </div>

          {isMechanic && (
            <>
              {/* Experience */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Years of Experience
                </label>
                <div
                  className={`flex items-center rounded-lg border-2 transition-colors ${
                    error && !years.trim()
                      ? "border-destructive"
                      : "border-border focus-within:border-primary"
                  } bg-card`}
                >
                  <div className="pl-4">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    placeholder="e.g. 5"
                    value={years}
                    onChange={(e) => {
                      setYears(e.target.value);
                      setError("");
                    }}
                    className="flex-1 px-3 py-3.5 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-medium min-w-0"
                  />
                </div>
              </div>

              {/* Services multi-select */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">
                  Services You Offer
                </label>
                <p className="text-xs text-muted-foreground mb-3">Select all that apply</p>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICES.map((service) => {
                    const active = selectedServices.includes(service);
                    return (
                      <motion.button
                        key={service}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleService(service)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-left text-sm font-medium transition-all ${
                          active
                            ? "border-primary bg-amber-soft text-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <span
                          className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            active ? "border-primary bg-primary" : "border-muted-foreground/40"
                          }`}
                        >
                          {active && <Check className="w-3 h-3 text-primary-foreground" />}
                        </span>
                        {service}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-destructive text-sm font-medium"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-bold text-base transition-all shadow-lg flex items-center justify-center gap-2"
          >
            Next
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;
