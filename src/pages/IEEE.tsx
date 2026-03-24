import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calendar, FileText, Users, Globe, ExternalLink, MapPin, Clock,
  BookOpen, Award, Search, Zap, ChevronRight, ChevronLeft, Cpu, Radio, Wifi, Database,
  Shield, Star, TrendingUp, Eye, Link2, Lightbulb, ArrowUpRight
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import IEEECarousel from "@/components/ieee/IEEECarousel";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useIEEEMembers, useIEEEConferences, useIEEEResearchPapers } from "@/hooks/use-supabase-data";

// --- Animated Circuit Board Background ---
const CircuitBoard = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none">
    {Array.from({ length: 30 }).map((_, i) => {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const len = 5 + Math.random() * 15;
      const dir = Math.random() > 0.5;
      return (
        <g key={i}>
          <line x1={`${x}%`} y1={`${y}%`} x2={dir ? `${x + len}%` : `${x}%`} y2={dir ? `${y}%` : `${y + len}%`}
            stroke="hsl(263 70% 58%)" strokeWidth="1" />
          <circle cx={`${x}%`} cy={`${y}%`} r="2" fill="hsl(263 70% 58%)" />
        </g>
      );
    })}
  </svg>
);

const FloatingOrb = ({ delay, size, x, y, color }: { delay: number; size: number; x: string; y: string; color: string }) => (
  <motion.div className="absolute rounded-full blur-3xl pointer-events-none"
    style={{ width: size, height: size, left: x, top: y, background: color }}
    animate={{ y: [0, -30, 0], scale: [1, 1.15, 1], opacity: [0.1, 0.25, 0.1] }}
    transition={{ duration: 7, delay, repeat: Infinity, ease: "easeInOut" }} />
);

const DataNode = ({ x, y, delay }: { x: string; y: string; delay: number }) => (
  <motion.div className="absolute w-2 h-2 rounded-full pointer-events-none"
    style={{ left: x, top: y, background: "hsl(263 70% 58%)" }}
    animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
    transition={{ duration: 3, delay, repeat: Infinity }} />
);

// --- Fallback Data ---
const fallbackConferences = [
  { title: "IEEE International Conference on AI", date: "Apr 15-17, 2026", location: "New Delhi", type: "CONFERENCE", desc: "Cutting-edge research in artificial intelligence and machine learning applications." },
  { title: "IEEE Symposium on IoT & Edge Computing", date: "May 8-10, 2026", location: "Bangalore", type: "SYMPOSIUM", desc: "Explore the future of IoT architectures and edge computing paradigms." },
  { title: "IEEE Workshop on Cybersecurity", date: "Jun 5, 2026", location: "Mumbai", type: "WORKSHOP", desc: "Hands-on workshop covering modern cybersecurity threats and defenses." },
  { title: "IEEE Hackathon: Smart Cities", date: "Jul 20-21, 2026", location: "Hyderabad", type: "HACKATHON", desc: "Build innovative solutions for smart urban infrastructure." },
  { title: "IEEE Congress on Quantum Computing", date: "Aug 12-14, 2026", location: "Chennai", type: "CONFERENCE", desc: "Advancing quantum computing research and practical applications." },
];

const fallbackPapers = [
  { title: "Deep Learning for Real-Time Object Detection in Autonomous Vehicles", authors: "R. Jaiswal, P. Sharma", journal: "IEEE Trans. on Intelligent Systems", year: 2025, citations: 42, doi: "10.1109/TIS.2025.001" },
  { title: "Blockchain-Based Secure Data Sharing in Healthcare IoT", authors: "H. Verma, A. Khan", journal: "IEEE Access", year: 2025, citations: 28, doi: "10.1109/ACCESS.2025.042" },
  { title: "Federated Learning with Differential Privacy Guarantees", authors: "S. Gupta, V. Singh", journal: "IEEE Symposium on SP", year: 2024, citations: 67, doi: "10.1109/SP.2024.118" },
  { title: "Energy-Efficient Routing Protocols for 6G Networks", authors: "A. Patel, M. Reddy", journal: "IEEE Communications Letters", year: 2024, citations: 35, doi: "10.1109/LCOMM.2024.073" },
  { title: "Adversarial Robustness in Computer Vision Models", authors: "N. Mishra, K. Das", journal: "IEEE CVPR Workshop", year: 2024, citations: 19, doi: "10.1109/CVPRW.2024.055" },
];

type PaperItem = {
  title: string;
  authors: string;
  journal: string;
  year: number | string;
  citations: number;
  doi: string;
  paperUrl?: string | null;
};

const tagColors: Record<string, string> = {
  CONFERENCE: "bg-primary/20 text-primary border-primary/30",
  SYMPOSIUM: "bg-accent/20 text-accent border-accent/30",
  WORKSHOP: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  HACKATHON: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

// --- Conference Carousel ---
const ConferenceCarousel = ({ items }: { items: typeof fallbackConferences }) => {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => setIdx(p => (p + 1) % items.length), 5000);
  };
  useEffect(() => { if (items.length > 0) { startTimer(); } return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [items.length]);
  const go = (d: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIdx(p => (p + d + items.length) % items.length);
    startTimer();
  };

  if (items.length === 0) return null;
  const conf = items[idx];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/30 glass">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
      <div className="relative p-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col md:flex-row items-start gap-6 p-6 md:p-8 cursor-pointer"
            onClick={() => (conf as any).hyperlink && window.open((conf as any).hyperlink, "_blank")}
          >
            <div className="hidden md:flex shrink-0" style={{ perspective: "600px" }}>
              <motion.div
                animate={{ rotateY: [0, 15, 0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg"
                style={{ transformStyle: "preserve-3d" }}
              >
                <Calendar className="w-10 h-10 text-primary-foreground" />
              </motion.div>
            </div>
            <div className="flex-1 min-w-0">
              <span className={`inline-block text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border mb-3 ${tagColors[conf.type] || tagColors.CONFERENCE}`}>
                {conf.type}
              </span>
              <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1">{conf.title}</h3>
              <p className="text-muted-foreground text-sm mb-3">{conf.desc}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" /> {conf.date}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-accent" /> {conf.location}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex justify-center gap-1.5 pb-4">
        {items.map((_, i) => (
          <button key={i} onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setIdx(i); startTimer(); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`} />
        ))}
      </div>
    </div>
  );
};

// --- Stat Card ---
const StatCard = ({ icon: Icon, value, label, color }: { icon: any; value: string; label: string; color: string }) => (
  <motion.div whileHover={{ y: -4, scale: 1.02 }} className="glass rounded-xl p-4 flex items-center gap-3 card-hover group">
    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
      <Icon className="h-5 w-5" style={{ color }} />
    </div>
    <div>
      <p className="font-display font-bold text-lg text-foreground leading-none">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  </motion.div>
);

// --- Member Card ---
const MemberCard = ({ member, index }: { member: any; index: number }) => (
  <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay: index * 0.06, type: "spring", stiffness: 150 }} className="group relative">
    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/30 group-hover:via-accent/15 group-hover:to-primary/30 transition-all duration-500 blur-[1px]" />
    <div className="relative glass rounded-2xl p-5 overflow-hidden">
      <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "linear-gradient(105deg, transparent 40%, hsl(263 70% 58% / 0.05) 45%, hsl(30 95% 55% / 0.05) 55%, transparent 60%)" }}
        animate={{ x: ["-100%", "200%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
      <div className="relative z-10 flex items-start gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center border-2 border-primary/20">
            <span className="text-sm font-bold text-primary-foreground">{member.avatar || member.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}</span>
          </div>
          {member.is_officer && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[hsl(160_70%_45%)] border-2 border-background flex items-center justify-center">
              <Star className="h-2.5 w-2.5 text-background" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-bold text-foreground text-sm truncate">{member.name}</h4>
          <p className="text-xs text-primary font-medium">{member.role || "Member"}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{member.department || "—"} {member.ieee_id ? `• ${member.ieee_id}` : ""}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="secondary" className="text-[10px] gap-1 bg-primary/10 text-primary border-primary/20">
              <BookOpen className="h-3 w-3" /> {member.research_papers || 0} papers
            </Badge>
            {member.specialization && (
              <Badge variant="outline" className="text-[10px] gap-1 border-border/50">
                <Cpu className="h-3 w-3" /> {member.specialization}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// --- Paper Card ---
const PaperCard = ({ paper, index }: { paper: PaperItem; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08 }}
    whileHover={{ y: -3 }}
    className="glass rounded-2xl p-5 border border-border/30 hover:border-primary/30 transition-colors group"
  >
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
        <FileText className="h-5 w-5 text-primary" />
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-[10px] gap-1 bg-accent/10 text-accent border-accent/20">
          <Eye className="h-3 w-3" /> {paper.citations} citations
        </Badge>
      </div>
    </div>
    <h4 className="font-display font-bold text-foreground text-sm leading-snug mb-2 group-hover:text-primary transition-colors">{paper.title}</h4>
    <p className="text-xs text-muted-foreground mb-1">{paper.authors}</p>
    <p className="text-[11px] text-muted-foreground mb-3">{paper.journal} · {paper.year}</p>
    <div className="flex items-center justify-between pt-3 border-t border-border/20">
      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
        <Link2 className="h-3 w-3" /> DOI: {paper.doi}
      </span>
      {paper.paperUrl ? (
        <a
          href={paper.paperUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex"
          aria-label="Open paper"
        >
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </a>
      ) : (
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50" />
      )}
    </div>
  </motion.div>
);

// --- Main Page ---
const IEEE = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"members" | "conferences" | "papers">("members");
  const { data: dbMembers = [], isLoading } = useIEEEMembers();
  const { data: dbConferences = [] } = useIEEEConferences();
  const { data: dbPapers = [] } = useIEEEResearchPapers();

  // Use DB conferences if available, otherwise fallback
  const conferences = dbConferences.length > 0
    ? dbConferences.map((c: any) => ({
        title: c.title,
        date: c.date || "",
        location: c.location || "",
        type: (c.conference_type || "conference").toUpperCase(),
        desc: c.description || "",
        hyperlink: c.hyperlink || null,
      }))
    : fallbackConferences;

  const filteredMembers = dbMembers.filter((m: any) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.department || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.specialization || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPapers = dbMembers.reduce((a: number, m: any) => a + (m.research_papers || 0), 0);
  const officers = dbMembers.filter((m: any) => m.is_officer);

  const papers: PaperItem[] = dbPapers.length > 0
    ? dbPapers.map((p: any) => ({
        title: p.title || "Untitled",
        authors: p.authors || "Unknown",
        journal: p.publisher || p.source || "Research",
        year: p.publication_date
          ? String(p.publication_date).slice(0, 4)
          : "-",
        citations: Number(p.citations || 0),
        doi: p.doi || "-",
        paperUrl: p.paper_url || null,
      }))
    : fallbackPapers.map((p) => ({ ...p, paperUrl: null }));

  const totalPublishedPapers = dbPapers.length > 0
    ? dbPapers.length
    : totalPapers;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <CircuitBoard />
      <FloatingOrb delay={0} size={500} x="0%" y="10%" color="hsl(263 70% 58% / 0.06)" />
      <FloatingOrb delay={2.5} size={400} x="70%" y="30%" color="hsl(30 95% 55% / 0.04)" />
      <FloatingOrb delay={5} size={350} x="30%" y="70%" color="hsl(160 70% 45% / 0.04)" />
      <DataNode x="15%" y="25%" delay={0} />
      <DataNode x="85%" y="35%" delay={1} />
      <DataNode x="45%" y="80%" delay={2} />
      <DataNode x="75%" y="15%" delay={0.5} />
      <Navbar />

      <div className="relative z-10 pt-24 pb-20 px-4 max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
        </Link>

        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden mb-10">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(240 30% 8%), hsl(263 40% 12%), hsl(240 30% 8%))" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 50%, hsl(263 70% 58% / 0.15), transparent 60%)" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 80% 80%, hsl(30 95% 55% / 0.08), transparent 50%)" }} />
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: `linear-gradient(hsl(263 70% 58%) 1px, transparent 1px), linear-gradient(90deg, hsl(263 70% 58%) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
          <div className="relative z-10 p-8 md:p-12 min-h-[220px]">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center border border-primary/30 relative">
                <Radio className="h-8 w-8 text-primary-foreground" />
                <motion.div className="absolute inset-0 rounded-2xl border border-primary/40"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-black text-foreground tracking-tight">IEEE</h1>
                <p className="text-primary text-sm font-medium tracking-widest uppercase">Student Branch</p>
              </div>
            </motion.div>
            <p className="text-muted-foreground text-sm max-w-lg leading-relaxed">
              Advancing technology for the benefit of humanity. Research, innovation, and professional development.
            </p>
          </div>
        </motion.div>

        {/* IEEE CAROUSEL */}
        <IEEECarousel />

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <StatCard icon={Users} value={String(dbMembers.length)} label="Members" color="hsl(263 70% 58%)" />
          <StatCard icon={Award} value={String(officers.length)} label="Officers" color="hsl(30 95% 55%)" />
          <StatCard icon={FileText} value={String(totalPublishedPapers)} label="Papers Published" color="hsl(160 70% 45%)" />
          <StatCard icon={Globe} value={String(new Set(dbMembers.map((m: any) => m.department).filter(Boolean)).size)} label="Departments" color="hsl(340 80% 55%)" />
        </div>

        {/* TABS */}
        <div className="flex items-center gap-1 mb-8 bg-secondary/30 rounded-xl p-1 w-fit border border-border/20">
          {(["members", "conferences", "papers"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {activeTab === "members" && (
          <>
            {/* SEARCH */}
            <div className="mb-8">
              <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search members, departments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border/40 h-11 focus:border-primary/40" />
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
              <Link
                to="/ieee/research-ideas"
                className="group block rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-4 md:p-5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] tracking-wider uppercase text-primary font-semibold mb-1">Research Topic Assistant</p>
                    <h3 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
                      Want to write a research paper but no idea on topic?
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Explore weekly trending category-wise ideas across AI/ML, Electronics, IoT, Medical, Cybersecurity, Data Science, Robotics, Quantum, Green Tech, FinTech, Tech Law, and Photonics.
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 text-primary">
                    <Lightbulb className="h-5 w-5" />
                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>

            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Members ({filteredMembers.length})
            </h2>

            {isLoading ? (
              <div className="text-center py-20">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Radio className="h-8 w-8 text-primary mx-auto" />
                </motion.div>
                <p className="text-muted-foreground mt-4">Loading members...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-20">
                <Radio className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-foreground mb-2">No members found</h3>
                <p className="text-muted-foreground">Try adjusting your search or add members from the admin panel.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMembers.map((member: any, index: number) => (
                  <MemberCard key={member.id} member={member} index={index} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "conferences" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Upcoming Conferences & Events
            </h2>
            <ConferenceCarousel items={conferences} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {conferences.map((conf, i) => (
                <motion.div
                  key={conf.title + i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="glass rounded-2xl p-5 border border-border/30 hover:border-primary/30 transition-colors cursor-pointer group"
                  onClick={() => (conf as any).hyperlink && window.open((conf as any).hyperlink, "_blank")}
                >
                  <span className={`inline-block text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border mb-3 ${tagColors[conf.type] || tagColors.CONFERENCE}`}>
                    {conf.type}
                  </span>
                  <h4 className="font-display font-bold text-foreground text-sm mb-2 group-hover:text-primary transition-colors">{conf.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{conf.desc}</p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {conf.date}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {conf.location}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "papers" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Research Papers Repository
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl">
              Browse published research papers by IEEE student branch members with citation counts and DOI links.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {papers.map((paper, i) => (
                <PaperCard key={`${paper.doi}-${i}`} paper={paper} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default IEEE;
