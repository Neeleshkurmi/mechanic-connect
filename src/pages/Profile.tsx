import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Wrench, LogOut, CheckCircle, Shield } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { mobile, role, setRole, logout } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<"USER" | "MECHANIC">("USER");
  const [updating, setUpdating] = useState(false);

  const handleRoleSwitch = (newRole: "USER" | "MECHANIC") => {
    if (newRole === role) return;
    setPendingRole(newRole);
    setShowModal(true);
  };

  const confirmRoleChange = async () => {
    setUpdating(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRole(pendingRole);
    setUpdating(false);
    setShowModal(false);
    toast.success("User role updated successfully");
  };

  const isMechanic = role === "MECHANIC";

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isMechanic ? "bg-slate-deep" : "bg-background"}`}>
      {/* Header */}
      <div className={`px-6 pt-14 pb-8 ${isMechanic ? "" : "bg-slate-deep"}`}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-card">Profile</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage your account</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="w-10 h-10 rounded-lg bg-card/10 flex items-center justify-center"
          >
            <LogOut className="w-5 h-5 text-card" />
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 px-6 pt-6"
      >
        {/* User Card */}
        <div className={`rounded-xl p-5 mb-6 ${isMechanic ? "bg-card/10 border border-border/30" : "bg-card border border-border shadow-sm"}`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isMechanic ? "bg-primary" : "bg-slate-deep"}`}>
              {isMechanic ? (
                <Wrench className="w-7 h-7 text-primary-foreground" />
              ) : (
                <User className="w-7 h-7 text-card" />
              )}
            </div>
            <div>
              <p className={`font-bold text-lg ${isMechanic ? "text-card" : "text-foreground"}`}>
                {mobile || "+91XXXXXXXXXX"}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Shield className={`w-3.5 h-3.5 ${isMechanic ? "text-primary" : "text-success"}`} />
                <span className={`text-sm font-semibold ${isMechanic ? "text-primary" : "text-success"}`}>
                  {role === "MECHANIC" ? "Mechanic" : "Customer"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Role Switcher */}
        <label className={`text-sm font-semibold mb-3 block ${isMechanic ? "text-card" : "text-foreground"}`}>
          Switch Role
        </label>

        <div className="space-y-3">
          <button
            onClick={() => handleRoleSwitch("USER")}
            className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all border-2 ${
              role === "USER"
                ? "border-primary bg-amber-soft"
                : isMechanic
                ? "border-border/30 bg-card/5 hover:bg-card/10"
                : "border-border bg-card hover:bg-secondary"
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role === "USER" ? "bg-primary" : "bg-muted"}`}>
              <User className={`w-5 h-5 ${role === "USER" ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 text-left">
              <p className={`font-semibold ${isMechanic ? "text-card" : "text-foreground"}`}>Customer</p>
              <p className={`text-xs ${isMechanic ? "text-muted-foreground" : "text-muted-foreground"}`}>Request roadside assistance</p>
            </div>
            {role === "USER" && <CheckCircle className="w-5 h-5 text-primary" />}
          </button>

          <button
            onClick={() => handleRoleSwitch("MECHANIC")}
            className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all border-2 ${
              role === "MECHANIC"
                ? "border-primary bg-amber-soft"
                : isMechanic
                ? "border-border/30 bg-card/5 hover:bg-card/10"
                : "border-border bg-card hover:bg-secondary"
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role === "MECHANIC" ? "bg-primary" : "bg-muted"}`}>
              <Wrench className={`w-5 h-5 ${role === "MECHANIC" ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 text-left">
              <p className={`font-semibold ${isMechanic ? "text-card" : "text-foreground"}`}>Mechanic</p>
              <p className={`text-xs ${isMechanic ? "text-muted-foreground" : "text-muted-foreground"}`}>Accept and fulfill service requests</p>
            </div>
            {role === "MECHANIC" && <CheckCircle className="w-5 h-5 text-primary" />}
          </button>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 flex items-end justify-center z-50 px-4 pb-8"
            onClick={() => !updating && setShowModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />

              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-soft flex items-center justify-center">
                  {pendingRole === "MECHANIC" ? (
                    <Wrench className="w-8 h-8 text-primary" />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold text-foreground text-center mb-2">
                Switch to {pendingRole === "MECHANIC" ? "Mechanic" : "Customer"}?
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                This will update your permissions and available features.
              </p>

              <button
                onClick={confirmRoleChange}
                disabled={updating}
                className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm disabled:opacity-60 transition-all"
              >
                {updating ? "Updating..." : "Confirm Role Change"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={updating}
                className="w-full py-3 mt-2 text-muted-foreground font-semibold text-sm"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
