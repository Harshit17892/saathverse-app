import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const message = useMemo(() => {
    if (checking) return "Validating reset link...";
    if (!ready) return "This reset link is invalid or expired.";
    return "Set a new password for your account.";
  }, [checking, ready]);

  useEffect(() => {
    const initializeRecoverySession = async () => {
      try {
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setReady(false);
          } else {
            setReady(true);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          setChecking(false);
          return;
        }

        const code = new URL(window.location.href).searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          setReady(!error);
          setChecking(false);
          return;
        }

        const { data } = await supabase.auth.getSession();
        setReady(!!data.session);
      } catch {
        setReady(false);
      } finally {
        setChecking(false);
      }
    };

    initializeRecoverySession();
  }, []);

  const handleReset = async () => {
    if (!ready) {
      toast.error("Reset link is not valid. Request a fresh link.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error(error.message || "Failed to change password.");
      setSaving(false);
      return;
    }

    toast.success("Password changed successfully. Please sign in.");
    await supabase.auth.signOut();
    setSaving(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/40 bg-card/70 backdrop-blur p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
            {checking ? <Loader2 className="h-5 w-5 animate-spin text-accent" /> : <Lock className="h-5 w-5 text-accent" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Reset Password</h1>
            <p className="text-xs text-muted-foreground">{message}</p>
          </div>
        </div>

        {!checking && !ready && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Request a new reset email and use the latest link.</p>
            <Link to="/login" className="text-sm text-accent hover:underline">Go to login</Link>
          </div>
        )}

        {!checking && ready && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>

            <Button onClick={handleReset} disabled={saving} className="w-full gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {saving ? "Updating..." : "Update Password"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">After update, you will be redirected to login.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
