import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Trophy, Star, ExternalLink, Sparkles, Code, BookOpen, Rocket, Users, Award, Zap, Globe, Filter, CheckCircle2, UserPlus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import SkillGalaxy from "@/components/branch/SkillGalaxy";
import LivePulse from "@/components/branch/LivePulse";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { branchesData } from "@/data/branchesData";
import { toast } from "sonner";

const branchMeta: Record<string, { label: string; color: string; icon: typeof Code }> = {
  diploma: { label: "Diploma", color: "from-emerald-500 to-teal-600", icon: BookOpen },
  "engineering-technology": { label: "Engineering & Technology", color: "from-primary to-accent", icon: Code },
  medical: { label: "Medical", color: "from-rose-500 to-pink-600", icon: Sparkles },
  science: { label: "Science", color: "from-cyan-400 to-blue-600", icon: Globe },
  commerce: { label: "Commerce", color: "from-amber-400 to-orange-600", icon: Rocket },
  management: { label: "Management", color: "from-violet-500 to-purple-700", icon: Users },
  "arts-humanities": { label: "Arts & Humanities", color: "from-fuchsia-500 to-pink-600", icon: Star },
  law: { label: "Law", color: "from-slate-400 to-zinc-600", icon: Award },
  education: { label: "Education", color: "from-green-400 to-emerald-600", icon: BookOpen },
  "architecture-planning": { label: "Architecture & Planning", color: "from-orange-400 to-red-600", icon: Zap },
  design: { label: "Design", color: "from-pink-400 to-rose-600", icon: Sparkles },
  agriculture: { label: "Agriculture", color: "from-lime-400 to-green-600", icon: Globe },
  pharmacy: { label: "Pharmacy", color: "from-teal-400 to-cyan-600", icon: Sparkles },
  "nursing-paramedical": { label: "Nursing & Paramedical", color: "from-red-400 to-rose-600", icon: Award },
  "computer-applications": { label: "Computer Applications", color: "from-indigo-500 to-blue-600", icon: Code },
};

// No more hardcoded data — events and top students come from the database

// ─── Animated Background ───
const HexGrid = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="hexB" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
        <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hexB)" />
  </svg>
);

const FloatingOrb = ({ className }: { className: string }) => (
  <motion.div
    animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
  />
);

// ─── Tag Colors ───
const tagColors: Record<string, string> = {
  EVENT: "bg-accent/20 text-accent border-accent/30",
  RESEARCH: "bg-primary/20 text-primary border-primary/30",
  WORKSHOP: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  FEST: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  ALUMNI: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  general: "bg-accent/20 text-accent border-accent/30",
  hackathon: "bg-primary/20 text-primary border-primary/30",
  workshop: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  seminar: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  fest: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

type BranchEvent = {
  title: string;
  tag: string;
  desc: string;
  date: string;
  image_url?: string | null;
  hyperlink?: string | null;
  icon?: string | null;
  gradient?: string | null;
};

// ─── Events Carousel ───
const EventsCarousel = ({ gradient, events }: { gradient: string; events: BranchEvent[] }) => {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (events.length === 0) return;
    timerRef.current = setInterval(() => setIdx(p => (p + 1) % events.length), 4000);
  };
  useEffect(() => { startTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [events.length]);
  const go = (d: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIdx(p => (p + d + events.length) % events.length);
    startTimer();
  };

  if (events.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border/30 glass p-8 text-center text-muted-foreground">
        No events added for this branch yet.
      </div>
    );
  }

  const current = events[idx];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/30" style={{ perspective: "1200px" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none z-10 rounded-2xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <AnimatePresence mode="wait">
        <motion.a
          key={idx}
          initial={{ opacity: 0, rotateY: 8, scale: 0.96 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
          exit={{ opacity: 0, rotateY: -8, scale: 0.96 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          href={current.hyperlink || "#"}
          target={current.hyperlink ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="relative block group"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="relative h-[220px] md:h-[280px] overflow-hidden rounded-2xl">
            {current.image_url ? (
              <img
                src={current.image_url}
                alt={current.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${current.gradient || gradient}`} />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-[10px] px-3 py-1 rounded-full border font-semibold uppercase tracking-wider ${tagColors[current.tag] || tagColors.EVENT}`}>
                  {current.tag || "general"}
                </span>
                {current.hyperlink && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-3 w-3" /> Learn More
                  </span>
                )}
              </div>

              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                {current.title}
              </h3>
              {current.desc && <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{current.desc}</p>}
              <span className="text-xs text-accent font-medium mt-2">{current.date}</span>
            </div>
          </div>
        </motion.a>
      </AnimatePresence>

      {events.length > 1 && (
        <>
          <button onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {events.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {events.map((_, i) => (
            <button
              key={i}
              onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setIdx(i); startTimer(); }}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

type TopStudent = { id: string; name: string; achievement: string; title: string; skills: string[]; bio: string; year: string; avatar_url?: string | null };

// ─── Top Student Carousel ───
const TopStudentCarousel = ({ students }: { students: TopStudent[] }) => {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (students.length === 0) return;
    timerRef.current = setInterval(() => setIdx(p => (p + 1) % students.length), 5000);
  };
  useEffect(() => { startTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [students.length]);
  const go = (d: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIdx(p => (p + d + students.length) % students.length);
    startTimer();
  };

  if (students.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border/30 glass p-8 text-center text-muted-foreground">
        No featured students added for this branch yet.
      </div>
    );
  }

  const s = students[idx];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/30 glass">
      <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-primary/5" />
      <div className="px-6 pt-5 pb-2 flex items-center gap-2 relative">
        <Trophy className="w-4 h-4 text-accent" />
        <span className="text-xs font-bold text-accent uppercase tracking-widest">Top Students</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}
          className="relative flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
          <div className="relative shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center overflow-hidden border-2 border-accent/20">
              {s.avatar_url ? (
                <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display text-3xl md:text-4xl font-bold gradient-text">{s.name.split(" ").map(n => n[0]).join("")}</span>
              )}
            </div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-1 rounded-2xl border border-dashed border-accent/20 pointer-events-none" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-display text-xl font-bold text-foreground">{s.name}</h3>
            <p className="text-muted-foreground text-sm mb-2">{s.title} · Class of {s.year}</p>
            <div className="hidden md:flex items-center gap-2 justify-center md:justify-start mb-3">
              <Award className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-accent">{s.achievement}</span>
            </div>
            <p className="hidden md:block text-muted-foreground text-xs mb-3 italic">"{s.bio}"</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {s.skills.map(sk => (
                <span key={sk} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-accent/15 text-accent border border-accent/20">{sk}</span>
              ))}
            </div>
            <Link to={`/profile/${s.id}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              View Profile <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      <button onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors">
        <ChevronRight className="w-4 h-4" />
      </button>
      <div className="flex justify-center gap-1.5 pb-4">
        {students.map((_, i) => (
          <button key={i} onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setIdx(i); startTimer(); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`} />
        ))}
      </div>
    </div>
  );
};

type StudentDisplay = {
  id?: string;
  name: string;
  dept: string;
  year: string;
  title: string;
  skills: string[];
  avatar_url?: string | null;
  isBot?: boolean;
  degreeLevel?: string;
  hackathonInterest?: boolean;
};

const normalizeBranchText = (value?: string | null) =>
  (value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const dynamicBranchMapping: Record<string, string[]> = branchesData.reduce((acc, branch) => {
  const normalizedKeys = [branch.name, branch.slug, ...branch.subBranches.map((sub) => sub.name)]
    .map((item) => normalizeBranchText(item))
    .filter(Boolean);

  acc[branch.slug] = Array.from(new Set(normalizedKeys));
  return acc;
}, {} as Record<string, string[]>);

const subBranchToMainSlug = new Map<string, string>();
for (const [mainSlug, normalizedKeys] of Object.entries(dynamicBranchMapping)) {
  for (const key of normalizedKeys) {
    subBranchToMainSlug.set(key, mainSlug);
  }
}

const aliasToMainSlugs: Record<string, string[]> = {
  bsms: ["medical"],
  taxation: ["commerce"],
  tax: ["commerce"],
  auditing: ["commerce", "management"],
  audit: ["commerce", "management"],
  bcom: ["commerce"],
  "b com": ["commerce"],
  accounting: ["commerce"],
  finance: ["commerce"],
  mba: ["management"],
  bba: ["management"],
};

const keywordToMainSlugs: Array<{ key: string; slugs: string[] }> = [
  { key: "mbbs", slugs: ["medical"] },
  { key: "medical", slugs: ["medical"] },
  { key: "nursing", slugs: ["nursing-paramedical"] },
  { key: "paramedical", slugs: ["nursing-paramedical"] },
  { key: "pharmacy", slugs: ["pharmacy"] },
  { key: "pharma", slugs: ["pharmacy"] },
  { key: "computer", slugs: ["engineering-technology", "computer-applications"] },
  { key: "cse", slugs: ["engineering-technology", "computer-applications"] },
  { key: "artificial intelligence", slugs: ["engineering-technology", "computer-applications"] },
  { key: "data science", slugs: ["engineering-technology", "computer-applications"] },
  { key: "engineering", slugs: ["engineering-technology"] },
  { key: "science", slugs: ["science"] },
  { key: "commerce", slugs: ["commerce"] },
  { key: "management", slugs: ["management"] },
  { key: "business", slugs: ["management"] },
  { key: "education", slugs: ["education"] },
  { key: "law", slugs: ["law"] },
  { key: "humanities", slugs: ["arts-humanities"] },
  { key: "arts", slugs: ["arts-humanities"] },
  { key: "design", slugs: ["design"] },
  { key: "architecture", slugs: ["architecture-planning"] },
  { key: "planning", slugs: ["architecture-planning"] },
  { key: "agriculture", slugs: ["agriculture"] },
  { key: "diploma", slugs: ["diploma"] },
];

const inferBranchSlugsFromText = (value?: string | null): string[] => {
  const normalized = normalizeBranchText(value);
  if (!normalized) return [];

  const matches = new Set<string>();

  const direct = subBranchToMainSlug.get(normalized);
  if (direct) matches.add(direct);

  // Dynamic partial matching across all onboarding branch/sub-branch labels.
  // This catches DB text variants like extra words around a known sub-branch.
  for (const [mainSlug, normalizedKeys] of Object.entries(dynamicBranchMapping)) {
    const hasContainMatch = normalizedKeys.some((key) => {
      if (!key) return false;
      if (key.length < 6) return false;
      return normalized.includes(key);
    });
    if (hasContainMatch) matches.add(mainSlug);
  }

  for (const [alias, slugs] of Object.entries(aliasToMainSlugs)) {
    if (normalized.includes(alias)) {
      slugs.forEach((slug) => matches.add(slug));
    }
  }

  for (const rule of keywordToMainSlugs) {
    if (normalized.includes(rule.key)) {
      rule.slugs.forEach((slug) => matches.add(slug));
    }
  }

  return Array.from(matches);
};

const StudentCard = ({ student, i, onConnect, isSent }: { student: StudentDisplay; i: number; onConnect?: (studentId: string, studentName: string) => void; isSent?: boolean }) => {
  const [hovered, setHovered] = useState(false);
  const canConnect = !student.isBot && !!student.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative group"
    >
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/50 to-accent/50 blur-sm pointer-events-none"
      />
      <div className="relative glass rounded-2xl p-4 sm:p-5 border border-border/30 hover:border-primary/30 transition-colors flex items-center gap-3 sm:gap-4">
        <Link to={student.id ? `/profile/${student.id}` : "#"} className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 border border-border/20 overflow-hidden">
          {student.avatar_url ? (
            <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-base sm:text-lg font-bold gradient-text">{student.name.split(" ").map(n => n[0]).join("")}</span>
          )}
        </Link>
        <Link to={student.id ? `/profile/${student.id}` : "#"} className="flex-1 min-w-0">
          <h4 className="font-display font-bold text-foreground text-sm truncate hover:text-primary transition-colors">{student.name}</h4>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground mb-1">
            <Code className="w-3 h-3 shrink-0" />
            <span className="truncate">{student.dept}</span>
            <span>·</span>
            <span className="shrink-0">{student.year}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2 hidden sm:block">{student.title}</p>
          {(student.degreeLevel || student.hackathonInterest) && (
            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2">
              {student.degreeLevel && (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/15 text-primary border border-primary/20">
                  {student.degreeLevel}
                </span>
              )}
              {student.hackathonInterest && (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/15 text-accent border border-accent/20">
                  Hackathon Interested
                </span>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {student.skills.slice(0, 3).map(sk => (
              <span key={sk} className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/15 text-accent border border-accent/20">
                {sk}
              </span>
            ))}
            {student.skills.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] text-muted-foreground">+{student.skills.length - 3}</span>
            )}
          </div>
        </Link>
        {isSent ? (
          <div className="shrink-0 w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center text-green-500 border border-green-500/20" title="Request sent">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        ) : canConnect ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              if (student.id && onConnect) onConnect(student.id, student.name);
            }}
            className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors border border-primary/20"
            title="Send connection request"
          >
            <UserPlus className="w-4 h-4" />
          </motion.button>
        ) : null}
      </div>
    </motion.div>
  );
};
// ─── Main Page ───
const BranchDetail = () => {
  const { branchSlug } = useParams<{ branchSlug: string }>();
  // Legacy per-college branch slugs may have a college suffix like "medical-3048bea8".
  // Normalize to the base main-branch slug so filtering remains correct.
  const normalizedBranchSlug = (branchSlug || "").replace(/-[a-f0-9]{8}$/i, "");
  const meta = branchMeta[normalizedBranchSlug] || { label: normalizedBranchSlug.replace(/-/g, " ") || "Branch", color: "from-primary to-accent", icon: Code };
  const BranchIcon = meta.icon;

  const { collegeId, user } = useAuth();
  const [dbStudents, setDbStudents] = useState<StudentDisplay[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [branchEvents, setBranchEvents] = useState<BranchEvent[]>([]);
  const [featuredStudents, setFeaturedStudents] = useState<TopStudent[]>([]);
  const [branchNotFound, setBranchNotFound] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [connectDialog, setConnectDialog] = useState<{ open: boolean; studentId: string; studentName: string }>({ open: false, studentId: "", studentName: "" });
  const [sendingRequest, setSendingRequest] = useState(false);

  // Load existing sent requests
  useEffect(() => {
    if (!user) return;
    supabase
      .from("connections")
      .select("receiver_id")
      .eq("sender_id", user.id)
      .in("status", ["pending", "accepted"])
      .then(({ data }) => {
      if (data) setSentRequests(new Set(data.map((d: any) => d.receiver_id)));
    });
  }, [user]);

  const openConnectDialog = (studentId: string, studentName: string) => {
    if (!user) { toast.error("Please log in first"); return; }
    if (studentId === user.id) { toast.info("That's you!"); return; }
    if (sentRequests.has(studentId)) { toast.info("Request already sent"); return; }
    setConnectDialog({ open: true, studentId, studentName });
  };

  const handleConnect = async () => {
    setSendingRequest(true);
    const { data: result, error } = await supabase
      .rpc("send_connection_request", { _receiver_id: connectDialog.studentId });
    if (error) {
      toast.error(`Failed: ${error.message}`);
    } else if (result === "already_exists") {
      toast.info("Connection request already sent");
    } else if (result === "sent") {
      toast.success("Connection request sent!");
      setSentRequests(prev => new Set(prev).add(connectDialog.studentId));
    } else {
      toast.error(result || "Something went wrong");
    }
    setSendingRequest(false);
    setConnectDialog({ open: false, studentId: "", studentName: "" });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingStudents(true);
      setBranchNotFound(false);

      // 1. Find the main branch in new global table by slug
      const { data: mainBranchRow } = await supabase
        .from("main_branches" as any)
        .select("id, name, slug")
        .eq("slug", normalizedBranchSlug)
        .maybeSingle();

      // 2. Also find old per-college branch (for events + featured students backward compat)
      let oldBranchId: string | null = null;
      if (collegeId) {
        const { data: oldBranch } = await supabase
          .from("branches")
          .select("id")
          .eq("slug", branchSlug || "")
          .eq("college_id", collegeId)
          .maybeSingle();
        oldBranchId = oldBranch?.id || null;
      }

      // If this slug doesn't exist in the new main_branches table AND doesn't exist in the legacy branches table,
      // do not run an unfiltered student query (prevents "invalid slug shows all students" leak).
      if (!mainBranchRow?.id && !oldBranchId) {
        setBranchNotFound(true);
        setLoadingStudents(false);
        return;
      }

      // 3. Fetch students primarily by main_branch_id, with fallback mapping for legacy/missing records.
      let query = supabase
        .from("students")
        .select("*, main_branch:main_branches(name, slug), specialization:specializations(name), branches(name, slug)")
        .order("created_at", { ascending: false });
      if (collegeId) query = query.eq("college_id", collegeId);
      if (mainBranchRow?.id) query = query.eq("main_branch_id", (mainBranchRow as any).id);
      else if (oldBranchId) query = query.eq("branch_id", oldBranchId);

      const { data } = await query;

      // Fallback: include students in this branch inferred from legacy text fields
      // when main_branch_id is missing/wrong (common in older profile records).
      let fallbackStudents: any[] = [];
      if (collegeId) {
        const { data: fallbackData } = await supabase
          .from("students")
          .select("*, main_branch:main_branches(name, slug), specialization:specializations(name), branches(name, slug)")
          .eq("college_id", collegeId)
          .order("created_at", { ascending: false });

        fallbackStudents = (fallbackData || []).filter((s: any) => {
          // Trust explicit main branch linkage first to avoid cross-branch drift
          // (for example Design specializations being inferred as Engineering).
          if (s.main_branch?.slug) {
            return String(s.main_branch.slug).replace(/-[a-f0-9]{8}$/i, "") === normalizedBranchSlug;
          }

          const possibleSlugs = new Set<string>();

          [s.specialization?.name, s.branch_name, s.branches?.name].forEach((text) => {
            inferBranchSlugsFromText(text).forEach((slug) => possibleSlugs.add(slug));
          });

          return possibleSlugs.has(normalizedBranchSlug);
        });
      }

      const mergedStudents = [
        ...(data || []),
        ...fallbackStudents.filter((s: any) => !(data || []).some((d: any) => d.id === s.id)),
      ];

      const profileByUserId = new Map<string, { degree_level?: string | null; year_of_study?: string | null; hackathon_interest?: boolean | null }>();
      const userIds = Array.from(
        new Set(
          mergedStudents
            .map((s: any) => (s?.id ? String(s.id) : ""))
            .filter(Boolean)
        )
      );

      if (userIds.length > 0) {
        let profilesQuery = supabase
          .from("profiles")
          .select("user_id, year_of_study")
          .in("user_id", userIds);

        if (collegeId) {
          profilesQuery = profilesQuery.eq("college_id", collegeId);
        }

        const { data: profileRows, error: profileErr } = await profilesQuery;
        if (!profileErr) {
          (profileRows || []).forEach((p: any) => {
            profileByUserId.set(String(p.user_id), {
              year_of_study: p.year_of_study,
            });
          });

          // Optional degree_level fetch. If the column is not present yet,
          // we still keep year/hackathon values from the base query.
          let degreeQuery = supabase
            .from("profiles")
            .select("user_id, degree_level")
            .in("user_id", userIds);

          if (collegeId) {
            degreeQuery = degreeQuery.eq("college_id", collegeId);
          }

          const { data: degreeRows, error: degreeErr } = await degreeQuery;
          if (!degreeErr) {
            (degreeRows || []).forEach((d: any) => {
              const key = String(d.user_id);
              const prev = profileByUserId.get(key) || {};
              profileByUserId.set(key, {
                ...prev,
                degree_level: d.degree_level,
              });
            });
          }

          // Optional hackathon_interest fetch. If the column is missing,
          // we keep working with year/degree metadata.
          let hackathonQuery = supabase
            .from("profiles")
            .select("user_id, hackathon_interest")
            .in("user_id", userIds);

          if (collegeId) {
            hackathonQuery = hackathonQuery.eq("college_id", collegeId);
          }

          const { data: hackathonRows, error: hackathonErr } = await hackathonQuery;
          if (!hackathonErr) {
            (hackathonRows || []).forEach((h: any) => {
              const key = String(h.user_id);
              const prev = profileByUserId.get(key) || {};
              profileByUserId.set(key, {
                ...prev,
                hackathon_interest: h.hackathon_interest,
              });
            });
          }
        }
      }

      if (mergedStudents.length > 0) {
        setDbStudents(mergedStudents.map((s: any) => {
          const profileMeta = profileByUserId.get(String(s.id));
          const fallbackDegree = ["UG", "PG", "PHD"].includes(String(profileMeta?.year_of_study || "").toUpperCase())
            ? String(profileMeta?.year_of_study)
            : null;

          return {
            id: s.id,
            name: s.name,
            dept: s.main_branch?.name || s.specialization?.name || s.branch_name || s.branches?.name || meta.label,
            year: s.graduation_year ? String(s.graduation_year) : "—",
            title: s.bio || "Student",
            skills: s.skills || [],
            avatar_url: s.avatar_url,
            isBot: s.is_bot ?? false,
            degreeLevel: profileMeta?.degree_level || fallbackDegree || undefined,
            hackathonInterest: !!profileMeta?.hackathon_interest,
          };
        }));
      } else {
        setDbStudents([]);
      }

      // 4. Fetch events with strict tenant scoping (college-wise only).
      // Include both branch-specific and global (All branches) items within the same college.
      if (collegeId) {
        const eventBranchId = oldBranchId;
        let eventsQuery = supabase
          .from("events")
          .select("*")
          .eq("college_id", collegeId)
          .order("date", { ascending: true });

        if (eventBranchId) {
          eventsQuery = eventsQuery.or(`branch_id.eq.${eventBranchId},branch_id.is.null`);
        } else {
          eventsQuery = eventsQuery.is("branch_id", null);
        }

        const { data: eventsData } = await eventsQuery;
        if (eventsData) {
          const normalized = [...eventsData]
            .filter((e: any) => e.is_active !== false)
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));

          setBranchEvents(normalized.map((e: any) => ({
            title: e.title,
            tag: e.event_type || "general",
            desc: e.description || "",
            date: e.date ? new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBA",
            image_url: e.image_url || null,
            hyperlink: e.hyperlink || null,
            icon: e.icon || null,
            gradient: e.gradient || null,
          })));
        } else {
          setBranchEvents([]);
        }
      } else {
        setBranchEvents([]);
      }

      // 5. Fetch featured students — use old branch_id (branch_featured_students still references old branches)
      if (oldBranchId) {
        const { data: featured } = await supabase
          .from("branch_featured_students" as any)
          .select("*, students(id, name, avatar_url, skills, bio, graduation_year)")
          .eq("branch_id", oldBranchId)
          .order("sort_order");
        if (featured) {
          setFeaturedStudents(featured.map((f: any) => ({
            id: f.students?.id || f.student_id,
            name: f.students?.name || "Unknown",
            achievement: f.achievement || "Featured Student",
            title: f.students?.bio || "Student",
            skills: f.students?.skills || [],
            bio: f.students?.bio || "",
            year: f.students?.graduation_year ? String(f.students.graduation_year) : "—",
            avatar_url: f.students?.avatar_url,
          })));
        }
      }

      setLoadingStudents(false);
    };
    fetchData();
  }, [branchSlug, normalizedBranchSlug, collegeId]);

  const branchStudents: StudentDisplay[] = dbStudents;

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");

  const filtered = branchStudents.filter(s => {
    const matchSearch = search === "" || s.name.toLowerCase().includes(search.toLowerCase()) || s.skills.some(sk => sk.toLowerCase().includes(search.toLowerCase()));
    const matchYear = yearFilter === "all" || s.year === yearFilter;
    return matchSearch && matchYear;
  });

  const years: string[] = ["all", ...Array.from(new Set(branchStudents.map(s => s.year)))];

  if (branchNotFound && !loadingStudents) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="glass rounded-2xl border border-border/30 p-8 text-center">
              <Code className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Branch not found</h2>
              <p className="text-muted-foreground">Please select a valid branch from the list.</p>
              <Link to="/" className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      <HexGrid />
      <FloatingOrb className="w-[500px] h-[500px] bg-primary/10 top-20 -left-40 hidden md:block" />
      <FloatingOrb className="w-[400px] h-[400px] bg-accent/8 bottom-40 -right-32 hidden md:block" />

      <div className="relative pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Back + Title */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              All Branches
            </Link>

            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-lg`}
                style={{ transformStyle: "preserve-3d" }}
              >
                <BranchIcon className="w-7 h-7 text-foreground" />
              </motion.div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{meta.label}</h1>
                <p className="text-muted-foreground text-sm">Browse students and happenings in this branch</p>
              </div>
            </div>
          </motion.div>

          {/* Carousels + Features */}
          <div className="space-y-6 mb-14">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <EventsCarousel gradient={meta.color} events={branchEvents} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <TopStudentCarousel students={featuredStudents} />
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SkillGalaxy />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <LivePulse />
              </motion.div>
            </div>
          </div>

          {/* Filters & Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 mb-8"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              {years.map(y => (
                <button key={y} onClick={() => setYearFilter(y)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${yearFilter === y
                    ? "bg-primary/20 text-primary border-primary/30"
                    : "glass text-muted-foreground border-border/30 hover:text-foreground"}`}>
                  {y === "all" ? "All Years" : y}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-md ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or skill..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-border/30 bg-transparent text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
          </motion.div>

          {/* Student Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filtered.map((s, i) => (
              <StudentCard key={s.id || s.name} student={s} i={i} onConnect={openConnectDialog} isSent={s.id ? sentRequests.has(s.id) : false} />
            ))}
          </div>

          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No students found matching your search</p>
            </motion.div>
          )}

          {/* Connect Request Dialog */}
          <Dialog open={connectDialog.open} onOpenChange={(open) => !open && setConnectDialog({ open: false, studentId: "", studentName: "" })}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Connect with {connectDialog.studentName}</DialogTitle>
                <DialogDescription>Send a connection request</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setConnectDialog({ open: false, studentId: "", studentName: "" })}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleConnect} disabled={sendingRequest}>
                      {sendingRequest ? "Sending..." : "Send Request"}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BranchDetail;
