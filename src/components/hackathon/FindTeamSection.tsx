import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, ArrowRight, Code, Palette, Brain, Rocket, Shield, Gamepad2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const domainIcons: Record<string, typeof Code> = {
  Frontend: Code, Backend: Code, "AI/ML": Brain, Blockchain: Shield,
  "UI/UX": Palette, "Data Science": Brain, DevOps: Rocket,
  "3D/WebXR": Gamepad2, IoT: Rocket, Cloud: Rocket, Mobile: Code,
  Cybersecurity: Shield, "Game Dev": Gamepad2,
};

interface Team {
  id: string;
  name: string;
  description: string | null;
  max_size: number;
  looking_for: string[];
  gradient: string;
  created_by: string;
  hackathon_title?: string;
  members: { user_id: string; role: string; name: string }[];
}

const FindTeamSection = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("All");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningTeamId, setJoiningTeamId] = useState<string | null>(null);
  const [myRequests, setMyRequests] = useState<Set<string>>(new Set());

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data: teamsData, error } = await supabase
        .from("hackathon_teams")
        .select("*, hackathons(title)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch members for each team
      const teamIds = (teamsData || []).map((t: any) => t.id);
      const { data: membersData } = await supabase
        .from("hackathon_team_members")
        .select("team_id, user_id, role, status")
        .in("team_id", teamIds.length ? teamIds : ["_none_"])
        .eq("status", "accepted");

      // Fetch profile names for members
      const memberUserIds = [...new Set((membersData || []).map((m: any) => m.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", memberUserIds.length ? memberUserIds : ["_none_"]);

      const profileMap = new Map((profilesData || []).map((p: any) => [p.user_id, p.full_name || "Unknown"]));

      const mapped: Team[] = (teamsData || []).map((t: any) => {
        const teamMembers = (membersData || [])
          .filter((m: any) => m.team_id === t.id)
          .map((m: any) => ({
            user_id: m.user_id,
            role: m.role,
            name: profileMap.get(m.user_id) || "Unknown",
          }));

        return {
          id: t.id,
          name: t.name,
          description: t.description,
          max_size: t.max_size,
          looking_for: t.looking_for || [],
          gradient: t.gradient || "from-primary to-purple-400",
          created_by: t.created_by,
          hackathon_title: t.hackathons?.title || null,
          members: teamMembers,
        };
      });

      setTeams(mapped);

      // Fetch current user's pending requests
      if (user) {
        const { data: requests } = await supabase
          .from("hackathon_team_members")
          .select("team_id")
          .eq("user_id", user.id);
        setMyRequests(new Set((requests || []).map((r: any) => r.team_id)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [user]);

  const handleJoinRequest = async (teamId: string) => {
    if (!user) {
      toast.error("Please log in to join a team");
      return;
    }

    setJoiningTeamId(teamId);
    try {
      const { error } = await supabase
        .from("hackathon_team_members")
        .insert({
          team_id: teamId,
          user_id: user.id,
          role: "member",
          status: "pending",
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("You already requested to join this team");
        } else {
          throw error;
        }
      } else {
        toast.success("Join request sent!");
        setMyRequests((prev) => new Set([...prev, teamId]));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send request");
    } finally {
      setJoiningTeamId(null);
    }
  };

  const allDomains = ["All", ...Array.from(new Set(teams.flatMap((t) => t.looking_for)))];

  const filtered = teams.filter(
    (t) =>
      (domainFilter === "All" || t.looking_for.includes(domainFilter)) &&
      (searchQuery === "" ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.hackathon_title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.looking_for.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="h-8 w-8 text-primary mx-auto animate-spin" />
        <p className="text-muted-foreground mt-4">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams, hackathons, domains..."
            className="pl-10 bg-secondary/40 border-border/40"
          />
        </div>
      </div>

      {/* Domain pills */}
      {allDomains.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {allDomains.map((d) => (
            <motion.button
              key={d}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDomainFilter(d)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                domainFilter === d
                  ? "bg-primary/20 text-primary border-primary/40"
                  : "bg-secondary/40 text-muted-foreground border-border/30 hover:border-primary/30"
              }`}
            >
              {d}
            </motion.button>
          ))}
        </div>
      )}

      {/* Teams grid */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {teams.length === 0 ? "No teams created yet. Be the first to create one!" : "No teams match your search."}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((team, i) => {
              const alreadyRequested = myRequests.has(team.id);
              const isMember = team.members.some((m) => m.user_id === user?.id);
              const isFull = team.members.length >= team.max_size;

              return (
                <motion.div
                  key={team.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="glass rounded-2xl overflow-hidden border border-border/30 hover:border-primary/30 transition-colors group"
                >
                  <div className={`h-1 bg-gradient-to-r ${team.gradient}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {team.name}
                        </h3>
                        {team.hackathon_title && (
                          <p className="text-xs text-muted-foreground">{team.hackathon_title}</p>
                        )}
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                        {team.members.length}/{team.max_size}
                      </Badge>
                    </div>

                    {team.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{team.description}</p>
                    )}

                    {/* Current members */}
                    <div className="flex items-center mb-3">
                      <div className="flex -space-x-2">
                        {team.members.map((m) => (
                          <div
                            key={m.user_id}
                            className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-background flex items-center justify-center text-[9px] font-bold text-foreground"
                            title={`${m.name} (${m.role})`}
                          >
                            {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        {team.max_size - team.members.length} spots open
                      </span>
                    </div>

                    {/* Looking for */}
                    {team.looking_for.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="text-[10px] text-muted-foreground mr-1">Looking for:</span>
                        {team.looking_for.map((d) => {
                          const Icon = domainIcons[d] || Code;
                          return (
                            <span
                              key={d}
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20"
                            >
                              <Icon className="h-2.5 w-2.5" />
                              {d}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <Button
                      size="sm"
                      className="w-full glow-primary text-xs"
                      disabled={isMember || alreadyRequested || isFull || joiningTeamId === team.id}
                      onClick={() => handleJoinRequest(team.id)}
                    >
                      {joiningTeamId === team.id ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...</>
                      ) : isMember ? (
                        "Already a Member"
                      ) : alreadyRequested ? (
                        "Request Pending"
                      ) : isFull ? (
                        "Team Full"
                      ) : (
                        <>Request to Join <ArrowRight className="h-3.5 w-3.5" /></>
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default FindTeamSection;
