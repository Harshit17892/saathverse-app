import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, BookOpen, Sparkles, ArrowRight, Lock, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { branchesData, getSubBranches } from "@/data/branchesData";

/**
 * CompleteProfile — shown to invited admins (or any user with an incomplete profile)
 * after they verify their email. Collects name, password, branch, year, etc.
 */
const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, collegeId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [mainBranch, setMainBranch] = useState("");
  const [subBranch, setSubBranch] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [bio, setBio] = useState("");

  // Pre-fill from existing profile if available
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setGender(profile.gender || "");
      setMainBranch(profile.branch || "");
      setYearOfStudy(profile.year_of_study?.toString() || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  // Redirect if profile is already complete
  useEffect(() => {
    if (profile?.full_name && profile?.branch && profile?.year_of_study) {
      navigate("/discover", { replace: true });
    }
  }, [profile, navigate]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        if (!user) navigate("/login", { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  const subBranches = mainBranch ? getSubBranches(mainBranch) : [];

  const handleSubmit = async () => {
    if (!fullName.trim()) { toast.error("Please enter your full name"); return; }
    if (!password || password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (!mainBranch) { toast.error("Please select your branch"); return; }
    if (!yearOfStudy) { toast.error("Please select your year"); return; }
    if (!user) { toast.error("Not logged in"); return; }

    setLoading(true);
    try {
      // Update password
      const { error: pwError } = await supabase.auth.updateUser({ password });
      if (pwError) throw pwError;

      // Update profile in DB
      const { error: profError } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          full_name: fullName.trim(),
          gender: gender || null,
          branch: mainBranch,
          year_of_study: yearOfStudy,
          bio: bio.trim() || null,
          college_id: collegeId,
        }, { onConflict: "user_id" });
      if (profError) throw profError;

      // SYNC TO STUDENTS TABLE SO THEY APPEAR IN ADMIN & BRANCH DIRECTORY
      try {
        // Find the accurate branch ID corresponding to chosen branch name
        const { data: bData } = await supabase
           .from("branches")
           .select("id")
           .eq("college_id", collegeId)
           .eq("name", mainBranch)
           .single();

        await supabase.from("students").upsert({
           id: user.id, // Keep IDs matching
           name: fullName.trim(),
           email: user.email,
           college_id: collegeId,
           branch_id: bData ? bData.id : null, 
           graduation_year: yearOfStudy === "1" ? new Date().getFullYear() + 3 :
                            yearOfStudy === "2" ? new Date().getFullYear() + 2 :
                            yearOfStudy === "3" ? new Date().getFullYear() + 1 :
                            new Date().getFullYear(),
           status: "active",
           bio: bio.trim() || null,
           xp_points: 0
        });
      } catch (err) {
        console.error("Student sync failed (often due to RLS), but profile was saved:", err);
      }

      await refreshProfile();
      toast.success("🎉 Profile complete! Welcome to SaathVerse");
      navigate("/discover", { replace: true });
    } catch (e: any) {
      toast.error(e.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "bg-secondary/60 border-border/40 focus:border-accent/60 rounded-xl h-11 text-sm placeholder:text-muted-foreground/50";
  const selectClass = "bg-secondary/60 border border-border/40 focus:border-accent/60 rounded-xl h-11 text-sm w-full px-3";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center"
          >
            <Sparkles className="h-8 w-8 text-accent" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="text-muted-foreground text-sm">
            Welcome! Set up your password and fill in your details to get started.
          </p>
        </div>

        {/* Form */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/40 p-6 space-y-4">
          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Set Your Password *
            </label>
            <div className="relative">
              <Input
                className={inputClass}
                type={showPassword ? "text" : "password"}
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Full Name *
            </label>
            <Input
              className={inputClass}
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Gender</label>
            <div className="flex gap-2">
              {["male", "female"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g as any)}
                  className={`flex-1 h-11 rounded-xl border text-sm font-medium transition-all ${
                    gender === g
                      ? "bg-accent/20 border-accent text-accent"
                      : "bg-secondary/60 border-border/40 text-muted-foreground hover:border-accent/40"
                  }`}
                >
                  {g === "male" ? "👨 Male" : "👩 Female"}
                </button>
              ))}
            </div>
          </div>

          {/* Branch */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Branch / Department *
            </label>
            <select
              className={selectClass}
              value={mainBranch}
              onChange={(e) => { setMainBranch(e.target.value); setSubBranch(""); }}
            >
              <option value="">Select branch…</option>
              {branchesData.map((b) => (
                <option key={b.name} value={b.name}>{b.icon} {b.name}</option>
              ))}
            </select>
          </div>

          {/* Sub Branch */}
          {subBranches.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Specialization</label>
              <select
                className={selectClass}
                value={subBranch}
                onChange={(e) => setSubBranch(e.target.value)}
              >
                <option value="">Select specialization…</option>
                {subBranches.map((sb) => (
                  <option key={sb} value={sb}>{sb}</option>
                ))}
              </select>
            </div>
          )}

          {/* Year */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Year of Study *</label>
            <div className="flex gap-2">
              {["1", "2", "3", "4", "5+"].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYearOfStudy(y)}
                  className={`flex-1 h-11 rounded-xl border text-sm font-medium transition-all ${
                    yearOfStudy === y
                      ? "bg-accent/20 border-accent text-accent"
                      : "bg-secondary/60 border-border/40 text-muted-foreground hover:border-accent/40"
                  }`}
                >
                  {y === "5+" ? "5+" : `${y}yr`}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Short Bio</label>
            <textarea
              className={`${inputClass} w-full p-3 resize-none`}
              rows={2}
              placeholder="A brief intro about yourself (optional)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-accent to-primary text-white font-semibold text-base shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all"
        >
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="h-5 w-5" />
            </motion.div>
          ) : (
            <>
              Complete Profile <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default CompleteProfile;
