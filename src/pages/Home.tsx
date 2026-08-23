import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Navigation,
  User,
  Wrench,
  LogOut,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { auth, watchAuth } from "@/lib/firebase";
import { toast } from "sonner";

const Home = () => {
  const navigate = useNavigate();
  const { role, name, experience, services, location, setLocation, reset } = useAuthStore();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

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

  const captureLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          capturedAt: new Date().toISOString(),
        });
        setLocating(false);
        toast.success("Location captured!");
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Please allow location access in your browser."
            : "Unable to fetch your location. Please try again."
        );
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleSignOut = async () => {
    await auth.signOut();
    reset();
    navigate("/");
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
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Profile card */}
        <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden mb-4">
          <div className="px-8 pt-7 pb-5 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                <RoleIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground leading-tight">
                  {name || "Welcome"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isMechanic ? "Mechanic" : "User"}
                  {isMechanic && experience ? ` · ${experience} yrs experience` : ""}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-destructive transition-colors p-2"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {isMechanic && services.length > 0 && (
            <div className="px-8 pb-5">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                <Briefcase className="w-3.5 h-3.5" />
                Services
              </p>
              <div className="flex flex-wrap gap-1.5">
                {services.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-medium bg-amber-soft text-foreground border border-primary/30 rounded-full px-2.5 py-1"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Location card */}
        <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
          <div className="px-8 pt-6 pb-2">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Your Current Location
            </h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              {isMechanic
                ? "Used to match you with nearby service requests"
                : "Used to find mechanics near you"}
            </p>
          </div>

          <div className="px-8 pb-7">
            {location ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="rounded-lg border border-success/40 bg-success/10 px-4 py-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">
                      {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Accurate to ~{Math.round(location.accuracy)}m
                    </p>
                  </div>
                </div>

                {/* Map preview */}
                <div className="rounded-lg overflow-hidden border border-border">
                  <iframe
                    title="Your location on map"
                    width="100%"
                    height="200"
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01}%2C${location.lat - 0.008}%2C${location.lng + 0.01}%2C${location.lat + 0.008}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
                  />
                </div>

                <button
                  onClick={captureLocation}
                  disabled={locating}
                  className="w-full py-3 rounded-lg border-2 border-border text-foreground font-semibold text-sm hover:border-primary/60 transition-all flex items-center justify-center gap-2"
                >
                  {locating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Update Location
                </button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border-2 border-dashed border-border px-4 py-8 text-center">
                  <Navigation className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No location captured yet
                  </p>
                </div>

                {locationError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-destructive text-sm font-medium"
                  >
                    {locationError}
                  </motion.p>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={captureLocation}
                  disabled={locating}
                  className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-bold text-base disabled:opacity-60 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {locating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Locating...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5" />
                      Capture My Location
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
