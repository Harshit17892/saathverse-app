import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Check, X, Loader2, Crown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TeamRequest {
  id: string;
  team_id: string;
  user_id: string;
  status: string;
  created_at: string;
  name: string;
  skills: string[];
  branch: string | null;
}

interface MyTeam {
  id: string;
  name: string;
  max_size: number;
  looking_for: string[];
  members: { user_id: string; name: string; role: string; status: string }[];
  pendingRequests: TeamRequest[];
}

const MyTeamsSection = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<MyTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchMyTeams = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Get teams I created
      const { data: myTeams } = await supabase
        .from("hackathon_teams")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (!myTeams?.length) { setTeams([]); setLoading(false); return; }

      const teamIds = myTeams.map((t: any) => t.id);

      // Get all members (accepted + pending)
      const { data: allMembers } = await supabase
        .from("hackathon_team_members")
        .select("*")
        .in("team_id", teamIds);

      // Get profiles for members
      const userIds = [...new Set((allMembers || []).map((m: any) => m.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, skills, branch")
        .in("user_id", userIds.length ? userIds : ["_none_"]);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      const mapped: MyTeam[] = myTeams.map((t: any) => {
        const teamMembers = (allMembers || []).filter((m: any) => m.team_id === t.id);
        return {
          id: t.id,
          name: t.name,
          max_size: t.max_size,
          looking_for: t.looking_for || [],
          members: teamMembers
            .filter((m: any) => m.status === "accepted")
            .map((m: any) => ({
              user_id: m.user_id,
              name: profileMap.get(m.user_id)?.full_name || "Unknown",
              role: m.role,
              status: m.status,
            })),
          pendingRequests: teamMembers
            .filter((m: any) => m.status === "pending")
            .map((m: any) => ({
              id: m.id,
              team_id: m.team_id,
              user_id: m.user_id,
              status: m.status,
              created_at: m.created_at,
              name: profileMap.get(m.user_id)?.full_name || "Unknown",
              skills: profileMap.get(m.user_id)?.skills || [],
              branch: profileMap.get(m.user_id)?.branch || null,
            })),
        };
      });

      setTeams(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyTeams(); }, [user]);

  const handleRequest = async (memberId: string, action: "accepted" | "rejected") => {
    setProcessingId(memberId);
    try {
      const { error } = await supabase
        .from("hackathon_team_members")
        .update({ status: action })
        .eq("id", memberId);

      if (error) throw error;
      toast.success(action === "accepted" ? "Member accepted!" : "Request rejected");
      fetchMyTeams();
    } catch (err: any) {
      toast.error(err.message || "Failed to process request");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="h-8 w-8 text-primary mx-auto animate-spin" />
        <p className="text-muted-foreground mt-4">Loading your teams...</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <h3 className="font-display text-lg font-bold text-foreground mb-2">No teams yet</h3>
        <p className="text-sm text-muted-foreground">Create a team to start receiving join requests!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {teams.map((team) => (
        <motion.div
          key={team.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-border/30 overflow-hidden"
        >
          {/* Team header */}
          <div className="p-5 border-b border-border/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                  <Crown className="h-5 w-5 text-accent" />
                  {team.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {team.members.length}/{team.max_size} members
                </p>
              </div>
              {team.pendingRequests.length > 0 && (
                <Badge className="bg-accent/15 text-accent border-accent/30 animate-pulse">
                  {team.pendingRequests.length} pending
                </Badge>
              )}
            </div>

            {/* Current members */}
            <div className="flex flex-wrap gap-2 mt-3">
              {team.members.map((m) => (
                <Badge
                  key={m.user_id}
                  className={`text-xs ${
                    m.role === "leader"
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-secondary/60 text-foreground border-border/30"
                  }`}
                >
                  {m.role === "leader" && <Crown className="h-3 w-3 mr-1" />}
                  {m.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Pending requests */}
          {team.pendingRequests.length > 0 ? (
            <div className="p-5">
              <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Join Requests
              </p>
              <div className="space-y-3">
                {team.pendingRequests.map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/20"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-border/40 flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                      {req.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{req.name}</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {req.branch && (
                          <span className="text-[10px] text-muted-foreground">{req.branch}</span>
                        )}
                        {req.skills.slice(0, 3).map((s) => (
                          <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRequest(req.id, "rejected")}
                        disabled={processingId === req.id}
                        className="h-8 w-8 p-0 border-destructive/30 text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRequest(req.id, "accepted")}
                        disabled={processingId === req.id || team.members.length >= team.max_size}
                        className="h-8 w-8 p-0 glow-primary"
                      >
                        {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 text-center">
              <p className="text-sm text-muted-foreground">No pending requests yet</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default MyTeamsSection;
