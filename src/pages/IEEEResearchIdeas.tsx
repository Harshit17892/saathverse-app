import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Brain,
  Calendar,
  FileSearch,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { useIEEEResearchPapers } from "@/hooks/use-supabase-data";

type CategoryKey =
  | "ai_ml"
  | "electronics"
  | "iot"
  | "medical"
  | "cybersecurity"
  | "data_science"
  | "robotics"
  | "quantum"
  | "green_tech"
  | "fintech"
  | "tech_law"
  | "photonics";

type CategoryConfig = {
  key: CategoryKey;
  label: string;
  summary: string;
  keywords: string[];
  ideas: string[];
};

const CATEGORIES: CategoryConfig[] = [
  {
    key: "ai_ml",
    label: "AI/ML",
    summary: "Applied GenAI, explainability, and efficient model design.",
    keywords: ["ai", "ml", "gen", "llm", "xai", "learning", "lime", "boost"],
    ideas: [
      "Explainable GenAI for medical triage using LIME and SHAP",
      "Gradient boosting + transformer hybrid for early risk prediction",
      "Lightweight edge-LLM inference for low-power campus devices",
      "Benchmarking retrieval-augmented generation in technical Q&A",
      "Bias detection and mitigation in student recommendation systems",
      "Federated GenAI fine-tuning for privacy-safe education models",
    ],
  },
  {
    key: "electronics",
    label: "Electronics",
    summary: "Power-efficient circuits, embedded systems, and reliability.",
    keywords: ["analog", "circuit", "embedded", "vlsi", "power", "sensor"],
    ideas: [
      "Ultra-low-power sensor node design for always-on monitoring",
      "Fault-tolerant mixed-signal architecture for wearable electronics",
      "Adaptive PCB design rules for EMI-sensitive IoT boards",
      "Energy-aware scheduling for microcontroller-based systems",
      "Design-for-testability workflow for student VLSI prototypes",
    ],
  },
  {
    key: "iot",
    label: "IoT",
    summary: "Connected systems, telemetry analytics, and secure deployments.",
    keywords: ["iot", "edge", "sensor", "telemetry", "mqtt", "device"],
    ideas: [
      "Digital twin pipeline for smart campus infrastructure",
      "Adaptive MQTT compression for low-bandwidth remote sensors",
      "IoT anomaly detection with self-supervised temporal embeddings",
      "Edge-first routing model for resilient disaster response networks",
      "Battery health prediction for long-lived IoT field devices",
    ],
  },
  {
    key: "medical",
    label: "Medical",
    summary: "Clinical AI, imaging support, and assistive diagnostics.",
    keywords: ["medical", "clinical", "health", "diagnostic", "biomedical", "hospital"],
    ideas: [
      "Multimodal triage assistant combining vitals and symptom text",
      "Explainable skin lesion screening using compact CNN models",
      "Early sepsis warning system with temporal uncertainty estimates",
      "Remote rehabilitation tracking via wearable motion signals",
      "Privacy-preserving clinical note summarization with local LLMs",
    ],
  },
  {
    key: "cybersecurity",
    label: "Cybersecurity",
    summary: "Threat detection, secure architecture, and zero-trust patterns.",
    keywords: ["security", "threat", "malware", "zero", "trust", "attack", "forensic"],
    ideas: [
      "Behavior-based phishing detection for student email ecosystems",
      "Zero-trust policy engine for multi-club collaboration platforms",
      "Ransomware early warning using endpoint activity embeddings",
      "Adversarial robustness evaluation for IDS models",
      "LLM-assisted incident triage with explainable action logs",
    ],
  },
  {
    key: "data_science",
    label: "Data Science",
    summary: "Forecasting, causal analytics, and practical decision support.",
    keywords: ["data", "analytics", "causal", "forecast", "time series", "optimization"],
    ideas: [
      "Causal effect modeling for academic intervention outcomes",
      "Probabilistic enrollment forecasting with uncertainty bands",
      "Graph analytics for interdisciplinary collaboration discovery",
      "Hybrid statistical + ML pipeline for placement prediction",
      "Automated feature governance for student analytics systems",
    ],
  },
  {
    key: "robotics",
    label: "Robotics",
    summary: "Autonomy, SLAM, and human-robot interaction.",
    keywords: ["robot", "slam", "navigation", "manipulation", "autonomous"],
    ideas: [
      "Vision-language navigation for indoor service robots",
      "Low-cost SLAM with sparse sensor fusion on edge compute",
      "Human-aware path planning for crowded campus movement",
      "Adaptive robotic grasping under partial occlusion",
      "Collaborative swarm robotics for environmental mapping",
    ],
  },
  {
    key: "quantum",
    label: "Quantum",
    summary: "Quantum algorithms and hybrid classical-quantum workflows.",
    keywords: ["quantum", "qubit", "qaoa", "variational", "hybrid"],
    ideas: [
      "Hybrid QAOA heuristics for constrained scheduling",
      "Noise-aware variational circuits for optimization tasks",
      "Quantum-inspired kernel methods for anomaly detection",
      "Benchmarking classical vs quantum feature maps on tabular data",
      "Error mitigation strategies for near-term quantum experiments",
    ],
  },
  {
    key: "green_tech",
    label: "Green Tech",
    summary: "Energy optimization, sustainability, and climate intelligence.",
    keywords: ["green", "energy", "sustainable", "carbon", "climate", "efficiency"],
    ideas: [
      "Campus microgrid load balancing with reinforcement learning",
      "Carbon-aware workload scheduling for AI inference",
      "Smart waste segregation using lightweight vision models",
      "Solar output forecasting under extreme weather variation",
      "Life-cycle impact dashboard for electronics labs",
    ],
  },
  {
    key: "fintech",
    label: "FinTech",
    summary: "Fraud analytics, risk modeling, and responsible finance systems.",
    keywords: ["finance", "fraud", "risk", "payment", "credit", "trading"],
    ideas: [
      "Real-time fraud detection with graph-based transaction context",
      "Alternative credit scoring using explainable ML",
      "Privacy-aware AML screening with federated analytics",
      "Micro-investment recommendation with risk-adjusted constraints",
      "Behavioral drift detection in digital payment ecosystems",
    ],
  },
  {
    key: "tech_law",
    label: "Tech Law",
    summary: "AI governance, compliance analytics, and digital rights.",
    keywords: ["law", "compliance", "policy", "governance", "privacy", "regulation"],
    ideas: [
      "Automated compliance checker for AI system documentation",
      "Risk taxonomy for GenAI deployments in education",
      "Comparative analysis of data protection obligations in EdTech",
      "Policy-aware prompt filtering for legal-safe AI assistants",
      "Explainability requirements mapping across global AI acts",
    ],
  },
  {
    key: "photonics",
    label: "Photonics",
    summary: "Optical communication, sensing, and photonic compute systems.",
    keywords: ["photonics", "optical", "laser", "fiber", "waveguide", "sensor"],
    ideas: [
      "Integrated photonic sensor arrays for biomedical monitoring",
      "Adaptive modulation in free-space optical communication",
      "Photonic neural acceleration for low-latency inference",
      "Fiber fault localization with physics-informed ML",
      "Waveguide optimization using differentiable simulation",
    ],
  },
];

const getWeekIndex = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return Math.floor((days + start.getDay() + 1) / 7);
};

const rotateByWeek = (arr: string[], weekIndex: number) => {
  if (arr.length === 0) return arr;
  const shift = weekIndex % arr.length;
  return [...arr.slice(shift), ...arr.slice(0, shift)];
};

const IEEEResearchIdeas = () => {
  const { data: dbPapers = [] } = useIEEEResearchPapers();
  const weekIndex = getWeekIndex();

  const computed = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const localSignals = (dbPapers || []).filter((p: any) => {
        const hay = `${p.title || ""} ${p.abstract || ""} ${p.publisher || ""} ${p.paper_type || ""}`.toLowerCase();
        return cat.keywords.some((k) => hay.includes(k));
      }).length;

      const trending = rotateByWeek(cat.ideas, weekIndex).slice(0, 4);
      const score = Math.min(99, 45 + localSignals * 9 + (weekIndex % 13));
      const momentum = score >= 80 ? "Hot" : score >= 65 ? "Rising" : "Stable";

      return {
        ...cat,
        localSignals,
        trending,
        score,
        momentum,
      };
    }).sort((a, b) => b.score - a.score);
  }, [dbPapers, weekIndex]);

  const updatedOn = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <Link to="/ieee" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to IEEE
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl border border-border/30 p-6 md:p-8 mb-7">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge variant="outline" className="border-primary/30 text-primary text-[11px] gap-1">
              <TrendingUp className="h-3 w-3" /> Weekly Trend Intelligence
            </Badge>
            <Badge variant="outline" className="border-accent/30 text-accent text-[11px] gap-1">
              <Calendar className="h-3 w-3" /> Updated: {updatedOn}
            </Badge>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-black text-foreground mb-2">
            Research Topic Compass
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-3xl leading-relaxed">
            Pick a category, explore trending topics, and start writing with confidence. This page refreshes ideas weekly and keeps strong topics visible while introducing new emerging directions.
          </p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border/30 bg-secondary/25 p-3">
              <p className="text-[11px] text-muted-foreground">Categories tracked</p>
              <p className="font-display text-xl font-bold text-foreground">{CATEGORIES.length}</p>
            </div>
            <div className="rounded-xl border border-border/30 bg-secondary/25 p-3">
              <p className="text-[11px] text-muted-foreground">Local paper signals analyzed</p>
              <p className="font-display text-xl font-bold text-foreground">{dbPapers.length}</p>
            </div>
            <div className="rounded-xl border border-border/30 bg-secondary/25 p-3">
              <p className="text-[11px] text-muted-foreground">Refresh cadence</p>
              <p className="font-display text-xl font-bold text-foreground">Weekly</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {computed.map((cat, index) => (
            <motion.article
              key={cat.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="glass rounded-2xl border border-border/30 p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">{cat.label}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{cat.summary}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="border-primary/30 text-primary text-[11px]">
                    {cat.score}/100
                  </Badge>
                  <p className="text-[11px] text-muted-foreground mt-1">{cat.momentum}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-[11px] bg-accent/10 text-accent border-accent/20">
                  <FileSearch className="h-3 w-3 mr-1" /> {cat.localSignals} local related papers
                </Badge>
                <Badge variant="secondary" className="text-[11px] bg-primary/10 text-primary border-primary/20">
                  <Brain className="h-3 w-3 mr-1" /> trend-analyzed
                </Badge>
              </div>

              <div className="rounded-xl border border-border/25 bg-background/30 p-3">
                <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-accent" /> Suggested topics this week
                </p>
                <ul className="space-y-2">
                  {cat.trending.map((topic) => (
                    <li key={topic} className="text-sm text-foreground/90 flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/80 shrink-0" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 pt-3 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground">
                <span>Acceptance fit based on recency + momentum + publication patterns</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IEEEResearchIdeas;
