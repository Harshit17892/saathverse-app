import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Sparkles, Users, Loader2, Check, UserPlus, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const domains = [
  "Frontend", "Backend", "AI/ML", "Blockchain", "UI/UX", "DevOps",
  "Mobile", "Data Science", "Cybersecurity", "IoT", "Cloud", "Game Dev",
];

interface Suggestion {
  user_id: string | null;
  name: string;
  skills: string[];
  branch: string | null;
  reason: string;
}

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  hackathonTitle?: string;
  hackathonId?: string;
  onTeamCreated?: () => void;
}

const CreateTeamModal = ({ isOpen, onClose, hackathonTitle, hackathonId, onTeamCreated }: CreateTeamModalProps) => {
  const { user, collegeId } = useAuth();
  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState(4);
  const [description, setDescription] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  // AI suggestions
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Suggestion[]>([]);
  const [showAiResults, setShowAiResults] = useState(false);

  const toggleDomain = (d: string) =>
    setSelectedDomains((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const handleAiSuggest = async () => {
    setAiLoading(true);
    setShowAiResults(false);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-teammates", {
        body: {
          team_name: teamName,
          description,
          looking_for: selectedDomains,
          college_id: collegeId,
        },
      });
      if (error) throw error;
      setAiSuggestions(data?.suggestions || []);
      setShowAiResults(true);
    } catch (err) {
      console.error(err);
      toast.error("AI suggestions unavailable. You can still create your team!");
      setShowAiResults(true);
      setAiSuggestions([]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!user) { toast.error("Please log in"); return; }
    if (!teamName.trim()) { toast.error("Enter a team name"); return; }

    setCreating(true);
    try {
      const { data: team, error: teamError } = await supabase
        .from("hackathon_teams")
        .insert({
          name: teamName.trim(),
          description: description.trim() || null,
          hackathon_id: hackathonId || null,
          max_size: teamSize,
          looking_for: selectedDomains,
          created_by: user.id,
          college_id: collegeId,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as leader
      await supabase.from("hackathon_team_members").insert({
        team_id: team.id,
        user_id: user.id,
        role: "leader",
        status: "accepted",
      });

      toast.success("Team created! Others can now find and request to join your team.");
      onTeamCreated?.();
      resetAndClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setTeamName("");
    setTeamSize(4);
    setDescription("");
    setSelectedDomains([]);
    setAiSuggestions([]);
    setShowAiResults(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={resetAndClose} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass rounded-2xl border border-border/40 p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Create Your Team</h2>
              {hackathonTitle && <p className="text-sm text-muted-foreground mt-1">for {hackathonTitle}</p>}
            </div>
            <button onClick={resetAndClose} className="p-2 rounded-lg hover:bg-secondary/60 transition-colors">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-secondary/60">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: step >= s ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            ))}
          </div>

          {/* Step 1: Team Details */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Team Name *</label>
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Code Crusaders"
                  className="bg-secondary/40 border-border/40"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Team Size</label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6].map((n) => (
                    <motion.button
                      key={n}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTeamSize(n)}
                      className={`w-12 h-12 rounded-xl text-sm font-bold transition-all ${
                        teamSize === n
                          ? "bg-primary text-primary-foreground glow-primary"
                          : "glass text-muted-foreground hover:text-foreground border border-border/30"
                      }`}
                    >
                      {n}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's your team about? What are you building?"
                  rows={3}
                  className="w-full rounded-md bg-secondary/40 border border-border/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <Button onClick={() => setStep(2)} disabled={!teamName.trim()} className="w-full glow-primary">
                Next: Select Domains <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Domain Selection */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">What domains are you looking for?</label>
                <p className="text-xs text-muted-foreground mb-4">Select the skills you need in your team. People with these skills will see your team first.</p>
                <div className="flex flex-wrap gap-2">
                  {domains.map((d) => (
                    <motion.button
                      key={d}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleDomain(d)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                        selectedDomains.includes(d)
                          ? "bg-primary/20 text-primary border-primary/40"
                          : "bg-secondary/40 text-muted-foreground border-border/30 hover:border-primary/30"
                      }`}
                    >
                      {selectedDomains.includes(d) && <Check className="inline h-3 w-3 mr-1" />}
                      {d}
                    </motion.button>
                  ))}
                </div>
              </div>

              {selectedDomains.length > 0 && (
                <div className="glass rounded-xl p-3 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-2">Selected ({selectedDomains.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDomains.map((d) => (
                      <Badge key={d} className="bg-primary/15 text-primary border-primary/30 text-xs">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1 glow-primary">
                  Next: AI Assist <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: AI Suggestions + Create */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              {/* AI card */}
              <div className="glass rounded-xl p-5 border border-primary/20 text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex"
                >
                  <Sparkles className="h-8 w-8 text-primary mb-3" />
                </motion.div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">AI Teammate Finder</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Let AI suggest the best teammates from your college based on skills & domain match.
                  <br />
                  <span className="text-primary text-xs font-medium">This is optional — you can skip and create directly.</span>
                </p>

                {!showAiResults && (
                  <Button onClick={handleAiSuggest} disabled={aiLoading} className="glow-primary">
                    {aiLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Finding best matches...</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Find AI Teammates</>
                    )}
                  </Button>
                )}
              </div>

              {/* AI loading skeleton */}
              {aiLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                      className="h-16 rounded-xl bg-secondary/40 border border-border/20"
                    />
                  ))}
                </div>
              )}

              {/* AI results */}
              {showAiResults && aiSuggestions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" /> AI Recommendations
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">These people will see your team in "Find a Team" — they can request to join!</p>
                  {aiSuggestions.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="flex items-center gap-3 p-3 rounded-xl glass border border-accent/20"
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 border border-accent/40 flex items-center justify-center text-xs font-bold text-foreground">
                          {p.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent flex items-center justify-center">
                          <Sparkles className="h-2.5 w-2.5 text-accent-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{p.reason}</p>
                      </div>
                      <div className="hidden sm:flex gap-1 flex-wrap justify-end max-w-[120px]">
                        {(p.skills || []).slice(0, 2).map((s) => (
                          <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                            {s}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {showAiResults && aiSuggestions.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No AI suggestions available yet. Create your team and others will find you!</p>
                </div>
              )}

              {/* Team summary */}
              <div className="glass rounded-xl p-4 border border-border/30">
                <p className="text-xs text-muted-foreground mb-2">Team Summary</p>
                <p className="text-sm font-bold text-foreground">{teamName}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground">1/{teamSize} members (you as leader)</span>
                </div>
                {selectedDomains.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedDomains.map((d) => (
                      <span key={d} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{d}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={handleCreate} disabled={creating} className="flex-1 glow-primary">
                  {creating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                  ) : (
                    <><Check className="h-4 w-4" /> Create Team</>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateTeamModal;
