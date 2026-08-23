import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Wrench, ArrowRight, Check } from "lucide-react";
import { useAuthStore, type Role } from "@/store/auth-store";
import { auth, watchAuth } from "@/lib/firebase";

const RoleSelect = () => {
  const navigate = useNavigate();
  const { role, setRole } = useAuthStore();
  const [selected, setSelected] = useState<Role | null>(role);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsub = watchAuth((user) => {
      if (!user) navigate("/");
      setCheckingAuth(false);
    });
    return unsub;
  }, [navigate]);

  const handleNext = () => {
    if (!selected) return;
    setRole(selected);
    navigate("/setup");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-deep flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const options: { value: Role; title: string; desc: string; icon: typeof User }[] = [
    {
      value: "USER",
      title: "User",
      desc: "I need help with my vehicle — find a mechanic near me",
      icon: User,
    },
    {
      value: "MECHANIC",
      title: "Mechanic",
      desc: "I provide repair services and want to receive job requests",
      icon: Wrench,
    },
  ];

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
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
      >
        <div className="px-8 pt-8 pb-2">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
            Step 1 of 2
          </p>
          <h2 className="text-2xl font-bold text-foreground mb-1">Who are you?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Choose how you want to use Call Your Mechanic
          </p>
        </div>

        <div className="px-8 pb-8 space-y-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            const active = selected === opt.value;
            return (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(opt.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  active
                    ? "border-primary bg-amber-soft shadow-md"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    active ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${active ? "text-primary-foreground" : "text-muted-foreground"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">{opt.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    active ? "border-primary bg-primary" : "border-border"
                  }`}
                >
                  {active && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                </div>
              </motion.button>
            );
          })}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            disabled={!selected}
            className="w-full mt-4 py-3.5 rounded-lg bg-primary text-primary-foreground font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
          >
            Next
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <button
            onClick={async () => {
              await auth.signOut();
              useAuthStore.getState().reset();
              navigate("/");
            }}
            className="w-full mt-2 text-center text-muted-foreground text-xs hover:text-foreground transition-colors"
          >
            Sign out and use a different number
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelect;
