import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, MapPin, Calendar, Github, Linkedin, Code2,
  BookOpen, ArrowLeft, MessageCircle, CheckCircle2, UserPlus,
  Shield, UserX, Clock, Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const HexPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="hex-pub" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
        <path d="M28 2L54 18V50L28 66L2 50V18L28 2Z" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
        <path d="M28 34L54 50V82L28 98L2 82V50L28 34Z" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hex-pub)" />
  </svg>
);

interface StudentProfile {
  id: string;
  name: string;
  bio: string | null;
  skills: string[];
  avatar_url: string | null;
  graduation_year: number | null;
  status: string | null;
  branches?: { name: string } | null;
  college_id: string | null;
}

type ConnectionStatus = "none" | "pending_sent" | "pending_received" | "accepted" | "blocked";

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user, collegeId } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [collegeName, setCollegeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [connStatus, setConnStatus] = useState<ConnectionStatus>("none");
  const [connId, setConnId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchConnectionStatus = async () => {
    if (!user || !userId || userId === user.id) return;
    const { data } = await supabase
      .from("connections")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
      .maybeSingle();

    if (!data) {
      setConnStatus("none");
      setConnId(null);
    } else {
      setConnId(data.id);
      if (data.status === "blocked") {
        setConnStatus("blocked");
      } else if (data.status === "accepted") {
        setConnStatus("accepted");
      } else if (data.status === "pending") {
        setConnStatus(data.sender_id === user.id ? "pending_sent" : "pending_received");
      }
    }
  };

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      const { data } = await supabase
        .from("students")
        .select("*, branches(name)")
        .eq("id", userId)
        .maybeSingle();
      if (data) {
        setProfile(data as any);
        if (data.college_id) {
          const { data: col } = await supabase.from("colleges").select("name").eq("id", data.college_id).maybeSingle();
          if (col) setCollegeName(col.name);
        }
        if (!data.branches && !data.branch_id) {
          const { data: prof } = await supabase.from("profiles").select("branch, bio, photo_url, skills, linkedin_url, github_url").eq("user_id", userId).maybeSingle();
          if (prof) {
            setProfile((prev: any) => ({
              ...prev,
              bio: prev?.bio || prof.bio,
              avatar_url: prev?.avatar_url || prof.photo_url,
              skills: prev?.skills?.length ? prev.skills : (prof.skills || []),
              _branch_name: prof.branch,
              _linkedin: prof.linkedin_url,
              _github: prof.github_url,
            }));
          }
        }
      }
      setLoading(false);
    };
    fetchData();
    fetchConnectionStatus();
  }, [userId, user]);

  const handleConnect = async () => {
    if (!user || !userId) { toast.error("Please log in first"); return; }
    setActionLoading(true);
    // Use SECURITY DEFINER RPC to bypass RLS entirely
    const { data: result, error } = await supabase
      .rpc("send_connection_request", { _receiver_id: userId });
    if (error) {
      toast.error(`Failed: ${error.message}`);
    } else if (result === "already_exists") {
      toast.info("Connection request already sent");
    } else if (result === "sent") {
      toast.success("Connection request sent!");
    } else {
      toast.error(result || "Something went wrong");
    }
    await fetchConnectionStatus();
    setActionLoading(false);
  };

  const handleRemove = async () => {
    if (!connId) return;
    setActionLoading(true);
    const { error } = await supabase.from("connections").delete().eq("id", connId);
    if (error) {
      toast.error("Failed to remove connection");
    } else {
      toast("Connection removed");
    }
    await fetchConnectionStatus();
    setActionLoading(false);
  };

  const handleBlock = async () => {
    if (!user || !userId) return;
    setActionLoading(true);
    if (connId) {
      // Update existing connection to blocked
      const { error } = await supabase.from("connections").update({ status: "blocked" }).eq("id", connId);
      if (error) toast.error("Failed to block user");
      else toast("User blocked");
    } else {
      // Create a new blocked connection
      const { error } = await supabase.from("connections").insert({
        sender_id: user.id,
        receiver_id: userId,
        status: "blocked",
        college_id: collegeId,
      });
      if (error) toast.error("Failed to block user");
      else toast("User blocked");
    }
    await fetchConnectionStatus();
    setActionLoading(false);
  };

  const handleAccept = async () => {
    if (!connId) return;
    setActionLoading(true);
    const { error } = await supabase.from("connections").update({ status: "accepted" }).eq("id", connId);
    if (error) toast.error("Failed to accept");
    else toast.success("Connection accepted!");
    await fetchConnectionStatus();
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 gap-4">
          <User className="h-16 w-16 text-muted-foreground/30" />
          <h2 className="text-xl font-display font-bold text-foreground">Profile not found</h2>
          <Link to="/" className="text-primary text-sm hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  const initials = profile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const branchName = (profile.branches as any)?.name || (profile as any)?._branch_name || "Student";
  const isOwnProfile = user?.id === userId;

  const renderActionButtons = () => {
    if (isOwnProfile || !user) return null;

    if (connStatus === "blocked") {
      return (
        <span className="px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-2">
          <Shield className="h-4 w-4" /> Blocked
        </span>
      );
    }

    if (connStatus === "accepted") {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-4 py-2.5 rounded-xl bg-green-500/10 text-green-400 text-sm font-medium flex items-center gap-2 border border-green-500/20">
            <CheckCircle2 className="h-4 w-4" /> Connected
          </span>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/chat?user=${userId}`)}
            className="px-4 py-2.5 rounded-xl glass border border-border/30 text-foreground text-sm font-medium flex items-center gap-2 hover:border-primary/40 transition-colors"
          >
            <MessageCircle className="h-4 w-4 text-primary" /> Message
          </motion.button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2.5 rounded-xl glass border border-border/30 text-muted-foreground text-sm font-medium flex items-center gap-2 hover:border-destructive/40 hover:text-destructive transition-colors"
              >
                <UserX className="h-4 w-4" /> Remove
              </motion.button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Connection</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove {profile.name} from your connections? They won't be notified.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemove} disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2.5 rounded-xl glass border border-border/30 text-muted-foreground text-sm font-medium flex items-center gap-2 hover:border-destructive/40 hover:text-destructive transition-colors"
              >
                <Shield className="h-4 w-4" /> Block
              </motion.button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Block {profile.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  They won't be able to see your profile or send you requests. You can unblock them later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBlock} disabled={actionLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Block"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    }

    if (connStatus === "pending_sent") {
      return (
        <span className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" /> Request Sent
        </span>
      );
    }

    if (connStatus === "pending_received") {
      return (
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAccept}
            disabled={actionLoading}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/30 flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" /> Accept Request
          </motion.button>
        </div>
      );
    }

    // No connection
    return (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleConnect}
        disabled={actionLoading}
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm shadow-lg shadow-primary/30 flex items-center gap-2"
      >
        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Connect
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      <HexPattern />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <Link to={-1 as any} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative">
            {/* Banner */}
            <div className="h-48 rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Avatar + Info */}
            <div className="flex flex-col md:flex-row items-start gap-6 -mt-16 px-4 sm:px-6">
              <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0" style={{ zIndex: 10 }}>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary opacity-80" />
                <div className="absolute inset-[3px] rounded-[13px] bg-card overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name}
                      className="block h-full w-full object-cover"
                      style={{ imageRendering: 'auto', minHeight: '100%', minWidth: '100%' }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-card">
                      <span className="text-3xl sm:text-4xl font-display font-bold gradient-text">{initials}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 pt-2 md:pt-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">{profile.name}</h1>
                    <p className="text-muted-foreground mt-1">{branchName} • {profile.status === "alumni" ? "Alumni" : "Student"}</p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-sm text-muted-foreground">
                      {collegeName && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {collegeName}</span>}
                      {profile.graduation_year && <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Class of {profile.graduation_year}</span>}
                      <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> {branchName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {renderActionButtons()}
                    {(profile as any)?._linkedin && (
                      <a href={(profile as any)._linkedin} target="_blank" rel="noopener noreferrer"
                        className="p-2.5 rounded-xl glass border border-border/30 text-muted-foreground hover:text-primary transition-colors">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {(profile as any)?._github && (
                      <a href={(profile as any)._github} target="_blank" rel="noopener noreferrer"
                        className="p-2.5 rounded-xl glass border border-border/30 text-muted-foreground hover:text-primary transition-colors">
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glass rounded-2xl p-6">
              <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" /> Skills
              </h3>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-sm font-medium"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No skills listed.</p>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
              <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-accent" /> About
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio || "No bio available."}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
