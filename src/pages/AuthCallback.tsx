import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, XCircle } from "lucide-react";

/**
 * AuthCallback — handles Supabase email verification / magic-link redirects.
 * Supabase appends ?code=... to the redirect URL. We exchange that code for
 * a session, then check if the user needs to complete their profile.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your account…");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange the code in the URL for a real session
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error) {
          // Maybe the user already has a valid session (clicked link twice, etc.)
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await redirectBasedOnProfile(session.user.id);
            return;
          }
          throw error;
        }

        // Get the current session to check profile
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await redirectBasedOnProfile(session.user.id);
        } else {
          setStatus("success");
          setMessage("Email verified! Redirecting…");
          setTimeout(() => navigate("/discover", { replace: true }), 1200);
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setStatus("error");
        setMessage(err?.message || "Verification failed. Please try signing in.");
        setTimeout(() => navigate("/login", { replace: true }), 2500);
      }
    };

    const redirectBasedOnProfile = async (userId: string) => {
      // Get user email for invite lookup
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const userEmail = authUser?.email?.toLowerCase() || "";

      // Check if user has a pending admin invite via user metadata first (RLS-safe),
      // then fall back to DB query (may fail due to RLS for non-admin users)
      const isAdminInviteByMeta = authUser?.user_metadata?.invited_as === "college_admin";
      let pendingInvite: any = null;
      if (!isAdminInviteByMeta) {
        const { data } = await supabase
          .from("pending_admin_invites" as any)
          .select("id, status, college_id")
          .eq("email", userEmail)
          .eq("status", "pending")
          .maybeSingle();
        pendingInvite = data;
      }

      // Check if user has a complete profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, branch, year_of_study, gender")
        .eq("user_id", userId)
        .maybeSingle();

      const isProfileIncomplete = !profile ||
        !profile.full_name ||
        !profile.branch ||
        !profile.year_of_study;

      if (pendingInvite || isAdminInviteByMeta) {
        // Invited admin
        if (isProfileIncomplete) {
          // Needs to complete admin setup
          setStatus("success");
          setMessage("Invite verified! Let's set up your admin account…");
          setTimeout(() => navigate("/admin-setup", { replace: true }), 1200);
        } else {
          // Profile already complete — go straight to admin
          setStatus("success");
          setMessage("Welcome back, admin! Redirecting…");
          setTimeout(() => navigate("/admin", { replace: true }), 1200);
        }
      } else if (isProfileIncomplete) {
        // Regular user with incomplete profile
        setStatus("success");
        setMessage("Email verified! Let's complete your profile setup…");
        setTimeout(() => navigate("/signup?onboarding=1", { replace: true }), 1200);
      } else {
        // Existing user with complete profile
        setStatus("success");
        setMessage("Email verified! Welcome to SaathVerse 🎉");
        setTimeout(() => navigate("/discover", { replace: true }), 1200);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5 text-center px-6"
      >
        {status === "loading" && (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Activity className="h-10 w-10 text-accent" />
          </motion.div>
        )}
        {status === "success" && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </motion.div>
        )}
        {status === "error" && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <XCircle className="h-10 w-10 text-destructive" />
          </motion.div>
        )}

        <div>
          <p className="text-foreground font-semibold text-lg">{message}</p>
          {status === "error" && (
            <p className="text-muted-foreground text-sm mt-1">Redirecting to login…</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthCallback;
