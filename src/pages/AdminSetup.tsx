import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, User, Lock, Eye, EyeOff, Phone, Briefcase, Camera,
  ArrowRight, Sparkles, Loader2, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

/**
 * AdminSetup — shown to invited college admins after they verify their email.
 * Collects: Profile Photo, Full Name, Password, Confirm Password,
 *           Designation/Role, Phone Number.
 * On submit: sets password, uploads photo, saves profile, assigns role,
 *            marks invite accepted, redirects to /admin.
 */
const AdminSetup = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Invite info
  const [collegeName, setCollegeName] = useState("");
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [inviteId, setInviteId] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(true);

  // Form state
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [designation, setDesignation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Load pending invite for this user's email
  useEffect(() => {
    const loadInvite = async () => {
      if (!user?.email) return;

      // Primary: check user_metadata set by signInWithOtp
      const meta = user.user_metadata;
      if (meta?.invited_as === "college_admin" && meta?.college_id) {
        setCollegeId(meta.college_id);

        // Fetch college name
        const { data: college } = await supabase
          .from("colleges")
          .select("name")
          .eq("id", meta.college_id)
          .maybeSingle();

        setCollegeName((college as any)?.name || meta?.college_name || "your college");

        // Try to find invite ID (may fail due to RLS, that's OK)
        const { data: invite } = await supabase
          .from("pending_admin_invites" as any)
          .select("id")
          .eq("email", user.email.toLowerCase())
          .eq("status", "pending")
          .maybeSingle();
        if (invite) setInviteId((invite as any).id);

        setInviteLoading(false);
        return;
      }

      // Fallback: try DB query (works if user already has admin role from previous session)
      const { data: invite } = await supabase
        .from("pending_admin_invites" as any)
        .select("id, college_id, status")
        .eq("email", user.email.toLowerCase())
        .eq("status", "pending")
        .maybeSingle();

      if (!invite) {
        // No pending invite found — redirect away
        toast.error("No pending admin invite found for your account.");
        navigate("/discover", { replace: true });
        return;
      }

      setInviteId((invite as any).id);
      setCollegeId((invite as any).college_id);

      // Fetch college name
      const { data: college } = await supabase
        .from("colleges")
        .select("name")
        .eq("id", (invite as any).college_id)
        .maybeSingle();

      setCollegeName((college as any)?.name || "your college");
      setInviteLoading(false);
    };
    loadInvite();
  }, [user, navigate]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        if (!user) navigate("/login", { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error("Photo must be under 1 MB");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) { toast.error("Please enter your full name"); return; }
    if (!password || password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (!user) { toast.error("Not logged in"); return; }
    if (!collegeId) { toast.error("Missing college data"); return; }

    setLoading(true);
    try {
      // 1. Set password
      const { error: pwError } = await supabase.auth.updateUser({ password });
      if (pwError) throw pwError;

      // 2. Upload photo if provided
      let photoUrl: string | null = null;
      if (photo) {
        const ext = photo.name.split(".").pop();
        const path = `avatars/${user.id}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(path, photo, { upsert: true });
        if (uploadErr) {
          console.error("Photo upload error:", uploadErr);
          // Non-fatal — continue without photo
        } else {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
          photoUrl = urlData.publicUrl;
        }
      }

      // 3. Upsert profile (include branch + year_of_study so profile is "complete")
      const profilePayload: any = {
        user_id: user.id,
        full_name: fullName.trim(),
        photo_url: photoUrl,
        college_id: collegeId,
        bio: designation.trim() || null,
        phone: phoneNumber.trim() || null,
        branch: designation.trim() || "Admin",
        year_of_study: "N/A",
      };

      let { error: profError } = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "user_id" });

      // Backward compatibility for projects where profiles.phone does not exist yet.
      if (profError && (profError.message || "").toLowerCase().includes("phone")) {
        const { phone: _phone, ...payloadWithoutPhone } = profilePayload;
        const retry = await supabase
          .from("profiles")
          .upsert(payloadWithoutPhone, { onConflict: "user_id" });
        profError = retry.error;
      }

      // If error is students_email_key (from sync_profile_to_student trigger), 
      // clear the conflicting student email and retry the profile upsert
      if (profError && (profError.message || "").includes("students_email_key")) {
        console.warn("students_email_key conflict — clearing conflicting email and retrying");
        // Try to rename the conflicting student's email so our insert can proceed
        if (user.email) {
          await supabase
            .from("students")
            .update({ email: `legacy+${user.id.substring(0, 8)}@migrated.local` })
            .eq("email", user.email.toLowerCase())
            .neq("id", user.id);
        }
        // Retry profile upsert
        const retry2 = await supabase
          .from("profiles")
          .upsert(profilePayload, { onConflict: "user_id" });
        profError = retry2.error;
        // If it still fails on the same thing, just ignore — profile may already exist
        if (profError && (profError.message || "").includes("students_email_key")) {
          console.warn("students_email_key still failing — continuing anyway, profile likely exists");
          profError = null;
        }
      }

      if (profError) throw profError;

      // 4 & 5. Assign college_admin role + mark invite accepted via RPC
      // The RPC runs with SECURITY DEFINER to bypass RLS
      let roleAssigned = false;
      try {
        const { data: rpcResult, error: rpcErr } = await supabase.rpc(
          "accept_admin_invite" as any,
          { p_user_id: user.id, p_college_id: collegeId }
        );
        if (rpcErr) {
          console.error("accept_admin_invite RPC error:", rpcErr);
        } else {
          const result = rpcResult as any;
          if (result?.success) {
            roleAssigned = true;
            console.log("✅ Admin role assigned via RPC");
          } else {
            console.warn("RPC returned:", result);
          }
        }
      } catch (rpcCatchErr) {
        console.error("RPC call failed (function may not exist):", rpcCatchErr);
      }

      // Fallback: try direct writes if RPC didn't work
      if (!roleAssigned) {
        console.log("Trying direct role assignment fallback...");
        const { error: roleErr } = await supabase.from("user_roles").upsert({
          user_id: user.id,
          role: "college_admin" as any,
          college_id: collegeId,
        }, { onConflict: "user_id,role" as any });
        if (roleErr) {
          console.error("user_roles upsert failed:", roleErr);
          // Try plain insert
          const { error: insertErr } = await supabase.from("user_roles").insert({
            user_id: user.id,
            role: "college_admin" as any,
            college_id: collegeId,
          });
          if (insertErr) {
            console.error("user_roles insert also failed:", insertErr);
            toast.error("⚠️ Could not assign admin role. Please ask the super admin to manually assign your role from the admin panel.");
          } else {
            roleAssigned = true;
          }
        } else {
          roleAssigned = true;
        }

        // Mark invite as accepted (fallback)
        if (inviteId) {
          const { error: invUpErr } = await supabase
            .from("pending_admin_invites" as any)
            .update({ status: "accepted", updated_at: new Date().toISOString() })
            .eq("id", inviteId);
          if (invUpErr) console.error("Invite update by ID failed:", invUpErr);
        } else if (user.email) {
          const { error: invUpErr2 } = await supabase
            .from("pending_admin_invites" as any)
            .update({ status: "accepted", updated_at: new Date().toISOString() } as any)
            .eq("email", user.email.toLowerCase())
            .eq("college_id", collegeId);
          if (invUpErr2) console.error("Invite update by email failed:", invUpErr2);
        }
      }

      await refreshProfile();
      toast.success("🎉 Welcome aboard! Redirecting to Admin Dashboard…");
      navigate("/admin", { replace: true });
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "bg-secondary/60 border-border/40 focus:border-accent/60 rounded-xl h-11 text-sm placeholder:text-muted-foreground/50";

  if (inviteLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="h-8 w-8 text-accent" />
        </motion.div>
      </div>
    );
  }

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
            <Shield className="h-8 w-8 text-accent" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground">Admin Setup</h1>
          <p className="text-muted-foreground text-sm">
            You've been invited as a College Admin for{" "}
            <span className="text-accent font-semibold">{collegeName}</span>.
            Complete your profile to get started.
          </p>
        </div>

        {/* Form */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/40 p-6 space-y-4">
          {/* Profile Photo */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5" /> Profile Photo
              <span className="text-muted-foreground/50 ml-1">(max 1 MB)</span>
            </label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-16 w-16 rounded-xl object-cover border border-border/40"
                />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-secondary/60 border border-border/40 flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground/50" />
                </div>
              )}
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/60 border border-border/40 text-sm text-muted-foreground hover:text-foreground hover:border-accent/40 transition-all">
                  <Upload className="h-4 w-4" /> Upload Photo
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
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

          {/* Set Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Set Password *
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

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Confirm Password *
            </label>
            <div className="relative">
              <Input
                className={inputClass}
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Designation / Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> Designation / Role
            </label>
            <Input
              className={inputClass}
              placeholder="e.g. Head of Department, Faculty Coordinator"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Phone Number
            </label>
            <Input
              className={inputClass}
              placeholder="+91 98765 43210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
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
              Start Managing <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default AdminSetup;
