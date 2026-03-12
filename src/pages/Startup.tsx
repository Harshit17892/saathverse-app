import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket, Users, Brain, Sparkles, AlertTriangle, MessageCircle,
  Lightbulb, Target, Zap, TrendingUp, Eye, ChevronRight, Flame,
  ArrowRight, Code2, Briefcase, Utensils, Heart, Cpu, Globe2,
  GraduationCap, Palette, Megaphone, Wrench, UserPlus, Check, X,
  Crown, Clock, Building, ArrowUpRight, Send, Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import StartupCarousel from "@/components/startup/StartupCarousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// --- Animated Background ---
const NeuralNetwork = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" viewBox="0 0 1200 800">
    {Array.from({ length: 20 }).map((_, i) => {
      const x1 = Math.random() * 1200, y1 = Math.random() * 800;
      const x2 = Math.random() * 1200, y2 = Math.random() * 800;
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(263 70% 58%)" strokeWidth="0.5" />;
    })}
    {Array.from({ length: 15 }).map((_, i) => (
      <motion.circle key={`n-${i}`} cx={Math.random() * 1200} cy={Math.random() * 800} r="3"
        fill="hsl(263 70% 58%)" animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }} />
    ))}
  </svg>
);

const FloatingOrb = ({ delay, size, x, y, color }: { delay: number; size: number; x: string; y: string; color: string }) => (
  <motion.div className="absolute rounded-full blur-3xl pointer-events-none"
    style={{ width: size, height: size, left: x, top: y, background: color }}
    animate={{ y: [0, -30, 0], scale: [1, 1.15, 1], opacity: [0.12, 0.28, 0.12] }}
    transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }} />
);

// --- Category Icons ---
const categoryIcons: Record<string, any> = {
  "Tech": Cpu, "Food & Beverage": Utensils, "EdTech": Lightbulb,
  "FinTech": TrendingUp, "HealthTech": Heart, "SaaS": Code2,
  "Social Impact": Globe2, "Other": Briefcase,
};

const categories = ["All", "Tech", "Food & Beverage", "EdTech", "FinTech", "HealthTech", "SaaS", "Social Impact", "Other"];
const stages = [
  { value: "idea", label: "💡 Just an Idea", color: "text-accent" },
  { value: "building", label: "🔨 Building MVP", color: "text-primary" },
  { value: "mvp", label: "🚀 MVP Ready", color: "text-[hsl(160_70%_45%)]" },
  { value: "launched", label: "🎯 Launched", color: "text-[hsl(160_70%_45%)]" },
];
const lookingForOptions = [
  { value: "developer", label: "Developer", icon: Code2 },
  { value: "designer", label: "Designer", icon: Palette },
  { value: "marketer", label: "Marketer", icon: Megaphone },
  { value: "domain_expert", label: "Domain Expert", icon: GraduationCap },
];

// --- Score Ring ---
const ScoreRing = ({ score, size = 80, strokeWidth = 5, label }: { score: number; size?: number; strokeWidth?: number; label?: string }) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const color = score >= 7 ? "hsl(160 70% 45%)" : score >= 5 ? "hsl(var(--accent))" : "hsl(var(--destructive))";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="hsl(var(--muted))" strokeWidth={strokeWidth} fill="none" />
          <motion.circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
            strokeLinecap="round" initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${(score / 10) * circumference} ${circumference}` }}
            transition={{ duration: 1.2, ease: "easeOut" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-bold" style={{ color, fontSize: size * 0.28 }}>{score}</span>
        </div>
      </div>
      {label && <span className="text-[10px] text-muted-foreground">{label}</span>}
    </div>
  );
};

// --- AI Evaluation Modal ---
const AIEvaluationModal = ({ idea, open, onClose }: { idea: any; open: boolean; onClose: () => void }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="glass border-border/50 max-w-md max-h-[85vh] overflow-y-auto p-0">
      <div className="p-6 pb-4 bg-gradient-to-b from-primary/10 to-transparent">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-lg bg-primary/20"><Brain className="h-5 w-5 text-primary" /></div>
            AI Evaluation
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">{idea.name}</DialogDescription>
        </DialogHeader>
      </div>
      <div className="px-6 pb-6 space-y-6">
        <div className="flex justify-center"><ScoreRing score={idea.ai_score || 0} size={120} strokeWidth={7} /></div>
        <p className="text-center text-xs text-muted-foreground -mt-4">Overall Score / 10</p>
        <div className="flex justify-center gap-8">
          <ScoreRing score={idea.ai_clarity || 0} size={64} strokeWidth={4} label="Clarity" />
          <ScoreRing score={idea.ai_market || 0} size={64} strokeWidth={4} label="Market" />
          <ScoreRing score={idea.ai_feasibility || 0} size={64} strokeWidth={4} label="Feasibility" />
        </div>
        <div className="flex justify-center gap-2">
          {idea.ai_innovation && <Badge className="bg-primary/15 text-primary border-primary/25 text-xs gap-1"><Lightbulb className="h-3 w-3" />{idea.ai_innovation}</Badge>}
          {idea.ai_difficulty && <Badge variant="outline" className="text-xs gap-1"><Target className="h-3 w-3" />{idea.ai_difficulty}</Badge>}
        </div>
        {(idea.ai_strengths || []).length > 0 && (
          <div className="rounded-xl bg-[hsl(160_70%_45%/0.05)] border border-[hsl(160_70%_45%/0.15)] p-4">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold mb-3" style={{ color: "hsl(160 70% 45%)" }}>
              <Sparkles className="h-4 w-4" /> Strengths
            </h4>
            <ul className="space-y-2">
              {idea.ai_strengths.map((s: string, i: number) => (
                <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-sm text-muted-foreground flex gap-2 items-start">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "hsl(160 70% 45%)" }} />{s}
                </motion.li>
              ))}
            </ul>
          </div>
        )}
        {(idea.ai_risks || []).length > 0 && (
          <div className="rounded-xl bg-accent/5 border border-accent/15 p-4">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold mb-3 text-accent">
              <AlertTriangle className="h-4 w-4" /> Risks
            </h4>
            <ul className="space-y-2">
              {idea.ai_risks.map((r: string, i: number) => (
                <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-sm text-muted-foreground flex gap-2 items-start">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />{r}
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DialogContent>
  </Dialog>
);

// --- Post Idea Modal ---
const PostIdeaModal = ({ open, onClose, onPosted }: { open: boolean; onClose: () => void; onPosted: () => void }) => {
  const { user, collegeId } = useAuth();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Other");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState("idea");
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [lookingForMentor, setLookingForMentor] = useState(false);
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!name.trim()) { toast.error("Startup name is required"); return; }
    if (!description.trim()) { toast.error("Please describe your idea"); return; }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.from("startup_ideas").insert({
        user_id: user.id,
        college_id: collegeId,
        name: name.trim(),
        category,
        description: description.trim(),
        stage,
        looking_for: lookingFor,
        looking_for_mentor: lookingForMentor,
        tags: tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean),
      }).select().single();

      if (error) throw error;

      // Auto-add founder as member
      await supabase.from("startup_members").insert({
        startup_id: data.id,
        user_id: user.id,
        role: "founder",
        status: "accepted",
      });

      // Trigger AI scoring in background
      supabase.functions.invoke("score-startup-idea", { body: { ideaId: data.id } })
        .then(() => console.log("AI scoring triggered"))
        .catch(e => console.error("AI scoring failed:", e));

      toast.success("🚀 Idea launched! AI is scoring it now...");
      setName(""); setCategory("Other"); setDescription(""); setStage("idea");
      setLookingFor([]); setLookingForMentor(false); setTags("");
      onPosted();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to post idea");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLookingFor = (val: string) => {
    setLookingFor(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass border-border/50 max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="p-6 space-y-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <div className="p-2 rounded-lg bg-accent/20"><Rocket className="h-5 w-5 text-accent" /></div>
              Launch Your Idea
            </DialogTitle>
            <DialogDescription>Share your startup vision with the SaathVerse community</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Startup Name *</label>
              <Input placeholder="e.g. FoodDash — campus food delivery" value={name} onChange={(e) => setName(e.target.value)}
                className="bg-secondary/50 border-border/50 focus:border-primary/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Category *</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Stage</label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger className="bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {stages.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Pitch your idea *</label>
              <Textarea placeholder="What problem are you solving? What's your tech stack? Who do you need on your team?"
                value={description} onChange={(e) => setDescription(e.target.value)}
                className="bg-secondary/50 border-border/50 min-h-[100px]" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Looking for</label>
              <div className="grid grid-cols-2 gap-2">
                {lookingForOptions.map(opt => (
                  <button key={opt.value} onClick={() => toggleLookingFor(opt.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      lookingFor.includes(opt.value)
                        ? "bg-primary/15 border-primary/30 text-primary"
                        : "bg-secondary/30 border-border/30 text-muted-foreground hover:border-border/60"
                    }`}>
                    <opt.icon className="h-3.5 w-3.5" /> {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="mentor" checked={lookingForMentor} onCheckedChange={(c) => setLookingForMentor(!!c)} />
              <label htmlFor="mentor" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Looking for a mentor
              </label>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Tags</label>
              <Input placeholder="ai, health, d2c (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)}
                className="bg-secondary/50 border-border/50" />
            </div>
            <div className="flex gap-3 pt-1">
              <Button disabled={submitting} className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold gap-2 h-11" onClick={handleSubmit}>
                <Zap className="h-4 w-4" /> {submitting ? "Launching..." : "Launch Idea"}
              </Button>
              <Button variant="ghost" onClick={onClose} className="text-muted-foreground">Cancel</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Manage Team Modal ---
const ManageTeamModal = ({ idea, open, onClose }: { idea: any; open: boolean; onClose: () => void }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = useCallback(async () => {
    const { data } = await supabase
      .from("startup_members")
      .select("*")
      .eq("startup_id", idea.id);
    
    // Fetch profile names separately
    const userIds = (data || []).map(d => d.user_id);
    let profileMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, photo_url, branch").in("user_id", userIds);
      (profiles || []).forEach(p => { profileMap[p.user_id] = p; });
    }
    
    setMembers((data || []).map(m => ({ ...m, profiles: profileMap[m.user_id] || null })));
    setLoading(false);
  }, [idea.id]);

  useEffect(() => { if (open) loadMembers(); }, [open, loadMembers]);

  const handleMemberAction = async (memberId: string, action: "accepted" | "rejected") => {
    await supabase.from("startup_members").update({ status: action }).eq("id", memberId);
    toast.success(action === "accepted" ? "Member accepted!" : "Request rejected");
    loadMembers();
  };

  const isFounder = idea.user_id === user?.id;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass border-border/50 max-w-md p-0 max-h-[80vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5 text-primary" /> Team — {idea.name}
            </DialogTitle>
            <DialogDescription>Manage members and join requests</DialogDescription>
          </DialogHeader>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No members yet</div>
          ) : (
            <div className="space-y-3">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {(m.profiles?.full_name || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        {m.profiles?.full_name || "Unknown"}
                        {m.role === "founder" && <Crown className="h-3.5 w-3.5 text-accent" />}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{m.role} • {m.status}</p>
                    </div>
                  </div>
                  {isFounder && m.status === "pending" && (
                    <div className="flex gap-1.5">
                      <Button size="sm" className="h-7 w-7 p-0 bg-[hsl(160_70%_45%/0.15)] text-[hsl(160_70%_45%)] hover:bg-[hsl(160_70%_45%/0.25)]"
                        onClick={() => handleMemberAction(m.id, "accepted")}><Check className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" className="h-7 w-7 p-0 bg-destructive/15 text-destructive hover:bg-destructive/25"
                        onClick={() => handleMemberAction(m.id, "rejected")}><X className="h-3.5 w-3.5" /></Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Idea Card ---
const IdeaCard = ({ idea, index, onViewAI, onManageTeam, userId }: {
  idea: any; index: number; onViewAI: () => void; onManageTeam: () => void; userId?: string;
}) => {
  const navigate = useNavigate();
  const Icon = categoryIcons[idea.category] || Briefcase;
  const isYours = idea.user_id === userId;
  const stageInfo = stages.find(s => s.value === idea.stage) || stages[0];
  const memberCount = idea.member_count || 1;

  const handleJoinRequest = async () => {
    if (!userId) { toast.error("Please sign in first"); return; }
    const { error } = await supabase.from("startup_members").insert({
      startup_id: idea.id, user_id: userId, role: "member", status: "pending",
      message: "I'd like to join your team!",
    });
    if (error?.code === "23505") { toast.info("You already requested to join"); return; }
    if (error) { toast.error("Failed to send request"); return; }
    toast.success("Join request sent to founder!");
  };

  const handleChat = () => {
    if (!userId) { toast.error("Please sign in"); return; }
    navigate(`/startup/${idea.id}/chat`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 150 }}
      className="group relative"
    >
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary/0 via-accent/0 to-primary/0 group-hover:from-primary/30 group-hover:via-accent/20 group-hover:to-primary/30 transition-all duration-500 blur-[1px]" />
      <div className="relative glass rounded-2xl overflow-hidden">
        {/* Score bar */}
        <div className="h-1 w-full" style={{
          background: idea.ai_score
            ? `linear-gradient(90deg, ${idea.ai_score >= 7 ? 'hsl(160 70% 45%)' : idea.ai_score >= 5 ? 'hsl(var(--accent))' : 'hsl(var(--destructive))'} ${(idea.ai_score / 10) * 100}%, hsl(var(--muted)) ${(idea.ai_score / 10) * 100}%)`
            : 'hsl(var(--muted))'
        }} />
        <div className="p-4 sm:p-5 md:p-6">
          {/* Header — stacks vertically on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/10 shrink-0">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-display font-bold text-foreground truncate">{idea.name}</h3>
                  {isYours && <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-accent/20 text-accent border border-accent/20">YOUR IDEA</span>}
                  {idea.looking_for_mentor && <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-primary/15 text-primary border border-primary/20">🎓 MENTOR</span>}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                  <span className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1">
                    <Crown className="h-3 w-3 text-accent" /> {idea.founder_name || "Unknown"}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30 hidden sm:block" />
                  <span className={`text-[11px] sm:text-xs font-medium ${stageInfo.color}`}>{stageInfo.label}</span>
                </div>
              </div>
            </div>
            {/* AI Score — compact on mobile */}
            {idea.ai_score !== null ? (
              <motion.div whileHover={{ scale: 1.05 }} onClick={onViewAI}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-card border border-border/50 cursor-pointer hover:border-primary/30 transition-colors shrink-0 self-start">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" stroke="hsl(var(--muted))" strokeWidth="3" fill="none" />
                    <circle cx="20" cy="20" r="16" strokeWidth="3" fill="none" strokeLinecap="round"
                      stroke={idea.ai_score >= 7 ? "hsl(160 70% 45%)" : idea.ai_score >= 5 ? "hsl(var(--accent))" : "hsl(var(--destructive))"}
                      strokeDasharray={`${(idea.ai_score / 10) * 100.5} 100.5`} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-foreground">{idea.ai_score}</span>
                </div>
                <div className="text-left">
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-none">AI Score</p>
                  <p className="text-[11px] sm:text-xs font-semibold text-foreground">/10</p>
                </div>
              </motion.div>
            ) : (
              <div className="px-2.5 py-1.5 rounded-xl bg-muted/30 border border-border/30 flex items-center gap-2 shrink-0 self-start">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                  <Brain className="h-3.5 w-3.5 text-muted-foreground" />
                </motion.div>
                <span className="text-[10px] text-muted-foreground">Scoring...</span>
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">{idea.description}</p>

          {/* Looking for badges */}
          {(idea.looking_for || []).length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3">
              {idea.looking_for.map((lf: string) => {
                const opt = lookingForOptions.find(o => o.value === lf);
                return (
                  <span key={lf} className="px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                    {opt && <opt.icon className="h-2.5 w-2.5" />} {opt?.label || lf}
                  </span>
                );
              })}
            </div>
          )}

          {/* Tags */}
          {(idea.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3">
              {idea.tags.map((tag: string) => (
                <span key={tag} className="px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] bg-secondary/80 text-muted-foreground border border-border/30">#{tag}</span>
              ))}
            </div>
          )}

          {/* Footer — stacks on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-0 pt-3 border-t border-border/30">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <button onClick={onManageTeam} className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {memberCount} member{memberCount > 1 ? "s" : ""}
              </button>
              {idea.ai_score !== null && (
                <button onClick={onViewAI} className="flex items-center gap-1 text-[11px] sm:text-xs text-primary hover:text-primary/80 transition-colors group/btn">
                  <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Report <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              )}
              <button onClick={handleChat} className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Chat
              </button>
            </div>
            {!isYours ? (
              <Button size="sm" onClick={handleJoinRequest}
                className="h-7 sm:h-8 text-[11px] sm:text-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 gap-1.5 w-full sm:w-auto">
                <UserPlus className="h-3 w-3" /> Request to Join
              </Button>
            ) : (
              <Button size="sm" onClick={onManageTeam}
                className="h-7 sm:h-8 text-[11px] sm:text-xs bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 gap-1.5 w-full sm:w-auto">
                <Wrench className="h-3 w-3" /> Manage Team
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Stats Ticker ---
const StatsTicker = ({ ideas }: { ideas: any[] }) => {
  const stats = [
    { icon: Rocket, value: String(ideas.length), label: "Active Ideas" },
    { icon: Crown, value: String(new Set(ideas.map(i => i.user_id)).size), label: "Founders" },
    { icon: Brain, value: String(ideas.filter(i => i.ai_score !== null).length), label: "AI Reviewed" },
    { icon: Flame, value: String(ideas.filter(i => (i.ai_score || 0) >= 7).length), label: "Trending" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
      {stats.map((stat, i) => (
        <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.08 }}
          className="glass rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 group hover:border-primary/20 transition-colors">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          </div>
          <div>
            <p className="text-base sm:text-lg font-display font-bold text-foreground">{stat.value}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// --- Category Filter ---
const CategoryFilter = ({ selected, onSelect }: { selected: string; onSelect: (c: string) => void }) => (
  <div className="relative mb-6">
    <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
      <style>{`.cat-scroll::-webkit-scrollbar { display: none; }`}</style>
      <div className="flex gap-2 cat-scroll">
        {categories.map(cat => {
          const Icon = cat === "All" ? Zap : (categoryIcons[cat] || Briefcase);
          const isActive = selected === cat;
          return (
            <motion.button key={cat} whileTap={{ scale: 0.95 }} onClick={() => onSelect(cat)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-primary/20 text-primary border-primary/30 shadow-[0_0_15px_-3px_hsl(var(--primary)/0.3)]"
                  : "bg-secondary/30 text-muted-foreground border-border/30 hover:bg-secondary/60 hover:text-foreground"
              }`}>
              <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {cat}
            </motion.button>
          );
        })}
      </div>
    </div>
  </div>
);

// --- Stage Update Modal ---
const StageUpdateModal = ({ idea, open, onClose, onUpdated }: { idea: any; open: boolean; onClose: () => void; onUpdated: () => void }) => {
  const [newStage, setNewStage] = useState(idea?.stage || "idea");
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    const { error } = await supabase.from("startup_ideas").update({ stage: newStage }).eq("id", idea.id);
    if (error) toast.error("Failed to update stage");
    else { toast.success("Stage updated!"); onUpdated(); onClose(); }
    setUpdating(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass border-border/50 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">Update Stage</DialogTitle>
          <DialogDescription>Track your startup's progress</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          {stages.map(s => (
            <button key={s.value} onClick={() => setNewStage(s.value)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                newStage === s.value ? "bg-primary/10 border-primary/30" : "bg-secondary/20 border-border/30 hover:border-border/60"
              }`}>
              <span className="text-lg">{s.label.split(" ")[0]}</span>
              <span className={`text-sm font-medium ${newStage === s.value ? "text-primary" : "text-muted-foreground"}`}>
                {s.label.slice(3)}
              </span>
            </button>
          ))}
          <Button disabled={updating} onClick={handleUpdate} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold h-10">
            {updating ? "Updating..." : "Update Stage"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Page ---
const Startup = () => {
  const { user, collegeId } = useAuth();
  const navigate = useNavigate();
  const [postOpen, setPostOpen] = useState(false);
  const [aiModalIdea, setAiModalIdea] = useState<any>(null);
  const [teamModalIdea, setTeamModalIdea] = useState<any>(null);
  const [stageModalIdea, setStageModalIdea] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIdeas = useCallback(async () => {
    let query = supabase
      .from("startup_ideas")
      .select("*")
      .order("created_at", { ascending: false });

    if (collegeId) query = query.eq("college_id", collegeId);

    const { data, error } = await query;
    if (error) { console.error(error); setLoading(false); return; }

    // Get founder names from profiles
    const userIds = [...new Set((data || []).map(d => d.user_id))];
    let profileMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      (profiles || []).forEach(p => { profileMap[p.user_id] = p.full_name || "Unknown"; });
    }

    // Get member counts
    const ideaIds = (data || []).map(d => d.id);
    let memberCounts: Record<string, number> = {};
    if (ideaIds.length > 0) {
      const { data: members } = await supabase
        .from("startup_members")
        .select("startup_id")
        .in("startup_id", ideaIds)
        .eq("status", "accepted");
      (members || []).forEach(m => {
        memberCounts[m.startup_id] = (memberCounts[m.startup_id] || 0) + 1;
      });
    }

    setIdeas((data || []).map(d => ({
      ...d,
      founder_name: profileMap[d.user_id] || "Unknown",
      member_count: memberCounts[d.id] || 1,
    })));
    setLoading(false);
  }, [collegeId]);

  useEffect(() => { loadIdeas(); }, [loadIdeas]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel("startup-ideas-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "startup_ideas" }, () => loadIdeas())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadIdeas]);

  const filtered = ideas.filter(i => {
    const catMatch = selectedCategory === "All" || i.category === selectedCategory;
    const searchMatch = !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.description.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && searchMatch;
  });

  const scrollToIdeas = () => {
    document.getElementById("ideas-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="hidden sm:block">
        <NeuralNetwork />
      </div>
      <FloatingOrb delay={0} size={300} x="-5%" y="10%" color="hsl(263 70% 58% / 0.06)" />
      <FloatingOrb delay={2} size={250} x="65%" y="30%" color="hsl(30 95% 55% / 0.05)" />
      <Navbar />

      <div className="relative z-10 pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-4 max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative mb-8 sm:mb-10">
          <div className="grid md:grid-cols-5 gap-4 sm:gap-6 items-center">
            <div className="md:col-span-3">
              <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                <Badge className="bg-accent/15 text-accent border-accent/25 mb-3 sm:mb-4 text-[10px] sm:text-xs gap-1"><Flame className="h-3 w-3" /> Entrepreneurship Hub</Badge>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-foreground leading-[1.1] mb-3 sm:mb-4">
                  Turn Ideas Into
                  <span className="gradient-text block">Ventures</span>
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-md mb-5 sm:mb-6 leading-relaxed">
                  Pitch your startup, get AI-powered feedback, find co-founders, and launch from campus.
                </p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button onClick={() => user ? setPostOpen(true) : toast.error("Please sign in to post an idea")}
                    className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold gap-2 h-9 sm:h-11 px-4 sm:px-6 text-xs sm:text-sm glow-primary">
                    <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Launch Idea
                  </Button>
                  <Button variant="outline" onClick={scrollToIdeas}
                    className="h-9 sm:h-11 gap-2 border-border/50 text-muted-foreground hover:text-foreground text-xs sm:text-sm">
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Explore
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* 3D Card Stack */}
            <div className="md:col-span-2 relative h-64 hidden md:block perspective-[1000px]">
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  className="absolute inset-0 glass rounded-2xl p-5 flex flex-col justify-between"
                  initial={{ rotateY: 15, rotateX: -5, z: -i * 30 }}
                  animate={{ rotateY: [15, 12, 15], rotateX: [-5, -3, -5], y: [i * 12, i * 12 - 5, i * 12] }}
                  transition={{ duration: 4, delay: i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformStyle: "preserve-3d", zIndex: 3 - i, opacity: 1 - i * 0.25, scale: 1 - i * 0.05 }}
                >
                  {i === 0 && ideas.length > 0 ? (
                    <>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 rounded-lg bg-primary/20"><Lightbulb className="h-4 w-4 text-primary" /></div>
                          <span className="text-sm font-semibold text-foreground">{ideas[0].name}</span>
                          {ideas[0].ai_score && <Badge className="text-[9px] bg-[hsl(160_70%_45%/0.15)] text-[hsl(160_70%_45%)] border-none">{ideas[0].ai_score}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{ideas[0].description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{ideas[0].member_count || 1} members</span>
                      </div>
                    </>
                  ) : i === 0 && (
                    <>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 rounded-lg bg-primary/20"><Lightbulb className="h-4 w-4 text-primary" /></div>
                          <span className="text-sm font-semibold text-foreground">Your Next Idea</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Launch your startup idea and get AI feedback...</p>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Startup Carousel — admin-controlled */}
        <StartupCarousel />

        <StatsTicker ideas={ideas} />

        {/* Search + Filter */}
        <div id="ideas-section" className="relative mb-3 sm:mb-4">
          <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ideas, categories, founders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/30 border-border/30 focus:border-primary/30 h-10 text-sm" />
        </div>
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

        {/* Ideas */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-16 glass rounded-2xl">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <Brain className="h-10 w-10 text-primary mx-auto mb-3" />
              </motion.div>
              <p className="text-muted-foreground text-sm">Loading ideas...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map((idea, i) => (
                <IdeaCard key={idea.id} idea={idea} index={i} userId={user?.id}
                  onViewAI={() => setAiModalIdea(idea)}
                  onManageTeam={() => setTeamModalIdea(idea)} />
              ))}
            </AnimatePresence>
          )}
          {!loading && filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 glass rounded-2xl">
              <Lightbulb className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm mb-2">
                {ideas.length === 0 ? "No ideas yet. Be the first to launch!" : "No ideas match your search"}
              </p>
              {ideas.length === 0 ? (
                <Button onClick={() => user ? setPostOpen(true) : toast.error("Please sign in")}
                  className="mt-2 bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2">
                  <Rocket className="h-4 w-4" /> Launch First Idea
                </Button>
              ) : (
                <Button variant="ghost" className="mt-2 text-primary text-xs" onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}>
                  Clear Filters
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PostIdeaModal open={postOpen} onClose={() => setPostOpen(false)} onPosted={loadIdeas} />
      {aiModalIdea && <AIEvaluationModal idea={aiModalIdea} open={!!aiModalIdea} onClose={() => setAiModalIdea(null)} />}
      {teamModalIdea && <ManageTeamModal idea={teamModalIdea} open={!!teamModalIdea} onClose={() => setTeamModalIdea(null)} />}
      {stageModalIdea && <StageUpdateModal idea={stageModalIdea} open={!!stageModalIdea} onClose={() => setStageModalIdea(null)} onUpdated={loadIdeas} />}
    </div>
  );
};

export default Startup;
