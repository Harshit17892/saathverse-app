import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  Filter,
  Flame,
  Lightbulb,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
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

type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type Heat = "hot" | "rising" | "fresh";
type ViewFilter = "all" | "tech" | "saas";

type TopicIdea = {
  id: string;
  title: string;
  whyTrending: string;
  methods: string[];
  difficulty: Difficulty;
  heat: Heat;
  keywords: string[];
};

type CategoryConfig = {
  key: CategoryKey;
  label: string;
  summary: string;
  view: ViewFilter[];
  topics: TopicIdea[];
};

type BranchProfile = {
  key: string;
  label: string;
  categories: CategoryKey[];
};

const CATEGORIES: CategoryConfig[] = [
  {
    key: "ai_ml",
    label: "AI/ML",
    summary: "GenAI, explainability, and production model systems.",
    view: ["all", "tech", "saas"],
    topics: [
      {
        id: "ai-1",
        title: "Explainable GenAI Triage Assistant",
        whyTrending: "47+ new explainability + GenAI papers posted recently across major preprint and conference tracks.",
        methods: ["LIME", "SHAP", "Gradient Boosting", "RAG pipeline", "Prompt evaluation matrix"],
        difficulty: "Intermediate",
        heat: "hot",
        keywords: ["genai", "xai", "lime", "shap", "triage", "transformer"],
      },
      {
        id: "ai-2",
        title: "Lightweight LLM Inference on Edge Devices",
        whyTrending: "Strong acceptance momentum in edge-AI workshops due to low-cost deployment use-cases.",
        methods: ["Quantization", "Distillation", "ONNX Runtime", "Latency profiling", "LoRA"],
        difficulty: "Advanced",
        heat: "rising",
        keywords: ["llm", "edge", "quantization", "distillation", "latency"],
      },
    ],
  },
  {
    key: "electronics",
    label: "Electronics",
    summary: "Embedded reliability, low-power architectures, and signal integrity.",
    view: ["all", "tech"],
    topics: [
      {
        id: "elec-1",
        title: "Ultra-Low-Power Sensor Board for Continuous Monitoring",
        whyTrending: "Low-power and battery longevity papers are rapidly increasing in smart infrastructure tracks.",
        methods: ["Power gating", "Sleep scheduling", "ADC calibration", "PCB thermal simulation"],
        difficulty: "Intermediate",
        heat: "rising",
        keywords: ["sensor", "power", "embedded", "adc", "pcb"],
      },
      {
        id: "elec-2",
        title: "Fault-Tolerant Mixed-Signal Wearable Architecture",
        whyTrending: "Healthcare electronics and wearable reliability continue to see high conference acceptance.",
        methods: ["Redundancy design", "Signal denoising", "SPICE simulation", "Error injection testing"],
        difficulty: "Advanced",
        heat: "fresh",
        keywords: ["mixed-signal", "wearable", "fault", "spice", "biomedical"],
      },
    ],
  },
  {
    key: "iot",
    label: "IoT",
    summary: "Telemetry analytics, edge networking, and resilient connected systems.",
    view: ["all", "tech", "saas"],
    topics: [
      {
        id: "iot-1",
        title: "Digital Twin for Smart Campus Systems",
        whyTrending: "Digital twin submissions are rising due to measurable impact in city and campus operations.",
        methods: ["MQTT", "Time-series forecasting", "Grafana", "Anomaly scoring", "Edge caching"],
        difficulty: "Intermediate",
        heat: "hot",
        keywords: ["iot", "digital twin", "mqtt", "telemetry", "edge"],
      },
      {
        id: "iot-2",
        title: "Adaptive IoT Routing for Disaster-Ready Networks",
        whyTrending: "Resilient communication papers gained visibility in emergency and sustainability tracks.",
        methods: ["Routing optimization", "Network simulation", "Federated updates", "Packet-loss modeling"],
        difficulty: "Advanced",
        heat: "rising",
        keywords: ["routing", "network", "iot", "resilient", "packet"],
      },
    ],
  },
  {
    key: "medical",
    label: "Medical",
    summary: "Clinical decision support, imaging AI, and assistive diagnostics.",
    view: ["all", "tech"],
    topics: [
      {
        id: "med-1",
        title: "Early Sepsis Risk Warning with Uncertainty-Aware Models",
        whyTrending: "Clinical ML with confidence calibration is being accepted in translational healthcare venues.",
        methods: ["Temporal models", "Calibration curves", "Uncertainty estimation", "SHAP explanations"],
        difficulty: "Advanced",
        heat: "hot",
        keywords: ["sepsis", "clinical", "uncertainty", "medical", "risk"],
      },
      {
        id: "med-2",
        title: "Remote Rehabilitation Tracking via Wearable Motion Signals",
        whyTrending: "Remote care and rehabilitation analytics continue to trend in post-pandemic clinical tech research.",
        methods: ["IMU signal processing", "Sequence models", "Feature extraction", "Real-time dashboard"],
        difficulty: "Intermediate",
        heat: "rising",
        keywords: ["rehab", "wearable", "imu", "medical", "remote"],
      },
    ],
  },
  {
    key: "cybersecurity",
    label: "Cybersecurity",
    summary: "Threat intelligence, zero-trust models, and robust security analytics.",
    view: ["all", "tech", "saas"],
    topics: [
      {
        id: "cyber-1",
        title: "Graph-Based Fraud and Phishing Detection Pipeline",
        whyTrending: "Security graph learning papers are appearing frequently in both industry and academic tracks.",
        methods: ["Graph neural networks", "Anomaly scoring", "Email feature engineering", "SOC workflow integration"],
        difficulty: "Advanced",
        heat: "hot",
        keywords: ["security", "phishing", "fraud", "graph", "threat"],
      },
      {
        id: "cyber-2",
        title: "LLM-Assisted Incident Triage with Explainable Logs",
        whyTrending: "Security operations teams are adopting AI triage, increasing publication interest in practical frameworks.",
        methods: ["Prompt templates", "Playbook classification", "RAG", "Audit logging"],
        difficulty: "Intermediate",
        heat: "rising",
        keywords: ["incident", "llm", "security", "triage", "logs"],
      },
    ],
  },
  {
    key: "data_science",
    label: "Data Science",
    summary: "Forecasting, causal inference, and analytics decision engines.",
    view: ["all", "tech", "saas"],
    topics: [
      {
        id: "ds-1",
        title: "Causal Intervention Modeling for Student Success",
        whyTrending: "Institutions are demanding explainable outcome modeling beyond simple correlation dashboards.",
        methods: ["Causal graphs", "Do-calculus", "Counterfactual estimation", "A/B design"],
        difficulty: "Intermediate",
        heat: "hot",
        keywords: ["causal", "data", "intervention", "analytics", "student"],
      },
      {
        id: "ds-2",
        title: "Probabilistic Enrollment and Placement Forecasting",
        whyTrending: "Uncertainty-aware forecasting is now favored over deterministic reporting in analytics papers.",
        methods: ["Bayesian models", "Quantile regression", "Time-series cross-validation", "Scenario simulation"],
        difficulty: "Intermediate",
        heat: "rising",
        keywords: ["forecast", "timeseries", "bayesian", "placement", "enrollment"],
      },
    ],
  },
  {
    key: "robotics",
    label: "Robotics",
    summary: "Navigation, interaction safety, and autonomous systems.",
    view: ["all", "tech"],
    topics: [
      {
        id: "rob-1",
        title: "Vision-Language Indoor Navigation Assistant",
        whyTrending: "Vision-language robotics is a growing area with increasing workshop acceptance.",
        methods: ["VLM prompting", "SLAM", "Path planning", "Sim-to-real evaluation"],
        difficulty: "Advanced",
        heat: "rising",
        keywords: ["robot", "vision", "language", "navigation", "slam"],
      },
      {
        id: "rob-2",
        title: "Human-Aware Path Planning in Crowded Spaces",
        whyTrending: "Safety and social navigation are now central criteria in service robotics papers.",
        methods: ["Trajectory prediction", "Risk-aware planning", "Reinforcement learning", "Crowd simulation"],
        difficulty: "Advanced",
        heat: "fresh",
        keywords: ["robot", "path", "crowd", "safety", "trajectory"],
      },
    ],
  },
  {
    key: "quantum",
    label: "Quantum",
    summary: "Hybrid quantum-classical optimization and near-term algorithm design.",
    view: ["all", "tech"],
    topics: [
      {
        id: "quant-1",
        title: "Hybrid QAOA for Scheduling Optimization",
        whyTrending: "Hybrid optimization is one of the most publishable practical quantum directions today.",
        methods: ["QAOA", "Classical optimizer loop", "Circuit depth tuning", "Noise mitigation"],
        difficulty: "Advanced",
        heat: "rising",
        keywords: ["quantum", "qaoa", "optimization", "hybrid", "noise"],
      },
      {
        id: "quant-2",
        title: "Quantum-Inspired Kernels for Tabular Anomaly Detection",
        whyTrending: "Quantum-inspired classical methods are gaining traction due to easier reproducibility.",
        methods: ["Kernel engineering", "Feature map design", "SVM", "Ablation study"],
        difficulty: "Intermediate",
        heat: "fresh",
        keywords: ["quantum", "kernel", "anomaly", "tabular", "feature"],
      },
    ],
  },
  {
    key: "green_tech",
    label: "Green Tech",
    summary: "Sustainability analytics, clean energy optimization, and climate systems.",
    view: ["all", "tech", "saas"],
    topics: [
      {
        id: "green-1",
        title: "Carbon-Aware AI Inference Scheduling",
        whyTrending: "Green AI initiatives have increased acceptance for energy-cost aware computing papers.",
        methods: ["Carbon intensity APIs", "Workload scheduling", "Energy estimation", "Policy optimization"],
        difficulty: "Intermediate",
        heat: "hot",
        keywords: ["green", "carbon", "energy", "ai", "scheduling"],
      },
      {
        id: "green-2",
        title: "Smart Waste Segregation with Lightweight Vision",
        whyTrending: "City and campus pilot projects make this topic practical and publishable.",
        methods: ["MobileNet", "Dataset curation", "On-device inference", "IoT bin telemetry"],
        difficulty: "Beginner",
        heat: "rising",
        keywords: ["waste", "green", "vision", "iot", "sustainability"],
      },
    ],
  },
  {
    key: "fintech",
    label: "FinTech",
    summary: "Fraud prevention, risk scoring, and financial intelligence tooling.",
    view: ["all", "saas", "tech"],
    topics: [
      {
        id: "fin-1",
        title: "Real-Time Transaction Fraud Graph Engine",
        whyTrending: "Financial institutions are publishing graph-based fraud frameworks with high practical impact.",
        methods: ["Graph embeddings", "Stream processing", "Risk scoring", "Drift monitoring"],
        difficulty: "Advanced",
        heat: "hot",
        keywords: ["fintech", "fraud", "transaction", "graph", "risk"],
      },
      {
        id: "fin-2",
        title: "Explainable Alternative Credit Scoring",
        whyTrending: "Regulatory pressure is increasing interest in transparent credit decision systems.",
        methods: ["XGBoost", "SHAP", "Fairness checks", "Reject inference"],
        difficulty: "Intermediate",
        heat: "rising",
        keywords: ["credit", "fintech", "xgboost", "fairness", "explainable"],
      },
    ],
  },
  {
    key: "tech_law",
    label: "Tech Law",
    summary: "AI regulation mapping, compliance intelligence, and digital policy.",
    view: ["all", "saas"],
    topics: [
      {
        id: "law-1",
        title: "Automated AI Compliance Checker for Student Projects",
        whyTrending: "With new AI governance rules, compliance automation is becoming a high-demand research area.",
        methods: ["Policy extraction", "Rule engine", "Document parsing", "Risk taxonomy"],
        difficulty: "Intermediate",
        heat: "hot",
        keywords: ["law", "compliance", "governance", "policy", "regulation"],
      },
      {
        id: "law-2",
        title: "Cross-Jurisdiction Data Protection Benchmark for EdTech",
        whyTrending: "Comparative legal-tech studies are being accepted due to global data transfer complexity.",
        methods: ["Comparative framework", "Clause mapping", "Gap analysis", "Case synthesis"],
        difficulty: "Beginner",
        heat: "fresh",
        keywords: ["law", "privacy", "edtech", "gdpr", "dpdp"],
      },
    ],
  },
  {
    key: "photonics",
    label: "Photonics",
    summary: "Optical sensing, communication, and photonic acceleration systems.",
    view: ["all", "tech"],
    topics: [
      {
        id: "pho-1",
        title: "Adaptive Modulation in Free-Space Optical Networks",
        whyTrending: "High-bandwidth communication research is reviving interest in optical channel adaptation.",
        methods: ["Channel estimation", "Adaptive coding", "Optical link budget", "Simulation"],
        difficulty: "Advanced",
        heat: "rising",
        keywords: ["photonics", "optical", "modulation", "communication", "fiber"],
      },
      {
        id: "pho-2",
        title: "Integrated Photonic Sensor Arrays for Health Monitoring",
        whyTrending: "Biomedical photonics is growing due to compact sensing and low-latency diagnostics.",
        methods: ["Waveguide modeling", "Sensor calibration", "Signal denoising", "Biometric validation"],
        difficulty: "Intermediate",
        heat: "fresh",
        keywords: ["photonics", "sensor", "waveguide", "biomedical", "optical"],
      },
    ],
  },
];

const BRANCH_PROFILES: BranchProfile[] = [
  {
    key: "cse",
    label: "CSE / IT",
    categories: ["ai_ml", "data_science", "cybersecurity", "iot", "fintech", "tech_law", "quantum"],
  },
  {
    key: "ece",
    label: "ECE",
    categories: ["electronics", "iot", "robotics", "photonics", "ai_ml", "cybersecurity"],
  },
  {
    key: "eee",
    label: "EEE",
    categories: ["electronics", "green_tech", "iot", "robotics", "photonics"],
  },
  {
    key: "mechanical",
    label: "Mechanical",
    categories: ["robotics", "green_tech", "iot", "data_science"],
  },
  {
    key: "civil",
    label: "Civil",
    categories: ["green_tech", "iot", "data_science", "tech_law"],
  },
  {
    key: "medical",
    label: "Medical / Biotech",
    categories: ["medical", "ai_ml", "data_science", "iot", "photonics"],
  },
  {
    key: "law",
    label: "Law",
    categories: ["tech_law", "fintech", "cybersecurity"],
  },
  {
    key: "open",
    label: "Show All Categories",
    categories: CATEGORIES.map((c) => c.key),
  },
];

const getHeatWidth = (heat: Heat) => {
  if (heat === "hot") return "100%";
  if (heat === "rising") return "66%";
  return "38%";
};

const getHeatLabel = (heat: Heat) => {
  if (heat === "hot") return "🔥 Trending this week";
  if (heat === "rising") return "Trending upward";
  return "Fresh opportunity";
};

const getDifficultyClass = (difficulty: Difficulty) => {
  if (difficulty === "Beginner") return "text-emerald-300 border-emerald-400/25 bg-emerald-500/10";
  if (difficulty === "Intermediate") return "text-amber-300 border-amber-400/25 bg-amber-500/10";
  return "text-rose-300 border-rose-400/25 bg-rose-500/10";
};

const IEEEResearchIdeas = () => {
  const { data: dbPapers = [] } = useIEEEResearchPapers();
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [activeCategory, setActiveCategory] = useState<"all" | CategoryKey>("all");
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const branchProfile = useMemo(
    () => BRANCH_PROFILES.find((b) => b.key === selectedBranch) || null,
    [selectedBranch]
  );

  const availableCategories = useMemo(() => {
    if (!branchProfile) return [] as CategoryConfig[];
    return CATEGORIES.filter(
      (cat) =>
        branchProfile.categories.includes(cat.key) &&
        (viewFilter === "all" || cat.view.includes(viewFilter))
    );
  }, [branchProfile, viewFilter]);

  const visibleCategories = useMemo(() => {
    if (activeCategory === "all") return availableCategories;
    return availableCategories.filter((cat) => cat.key === activeCategory);
  }, [activeCategory, availableCategories]);

  const categorySignalCount = useMemo(() => {
    return (keywords: string[]) => {
      return (dbPapers || []).filter((p: any) => {
        const hay = `${p.title || ""} ${p.abstract || ""} ${p.publisher || ""} ${p.paper_type || ""}`.toLowerCase();
        return keywords.some((k) => hay.includes(k));
      }).length;
    };
  }, [dbPapers]);

  const updatedOn = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <Link to="/ieee" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to IEEE
        </Link>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl border border-border/30 p-6 md:p-8 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[11px] px-2.5 py-1 rounded-full border border-primary/30 text-primary bg-primary/10 inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Weekly Trend Intelligence
            </span>
            <span className="text-[11px] px-2.5 py-1 rounded-full border border-accent/30 text-accent bg-accent/10">
              Updated: {updatedOn}
            </span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-black text-foreground mb-2">Research Topic Compass</h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-3xl">
            Choose your branch first, then explore category-wise topic ideas with real reasons, methods, and difficulty levels.
          </p>
        </motion.div>

        {!branchProfile && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl border border-border/30 p-5 md:p-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Tell us your branch first</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Personalization is enabled. We will show categories relevant to your branch so you do not see unrelated topics.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {BRANCH_PROFILES.map((b) => (
                <button
                  key={b.key}
                  onClick={() => setSelectedBranch(b.key)}
                  className="text-left px-3.5 py-2.5 rounded-xl border border-border/30 bg-secondary/20 hover:bg-secondary/40 hover:border-primary/30 transition-colors"
                >
                  <p className="text-sm font-semibold text-foreground">{b.label}</p>
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {branchProfile && (
          <>
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl border border-border/30 p-4 md:p-5 mb-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[11px] text-muted-foreground">Branch profile:</span>
                <span className="text-[11px] px-2.5 py-1 rounded-full border border-primary/30 text-primary bg-primary/10">{branchProfile.label}</span>
                <button
                  onClick={() => {
                    setSelectedBranch("");
                    setActiveCategory("all");
                    setViewFilter("all");
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                >
                  Change branch
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <span className="text-[11px] px-2.5 py-1 rounded-full border border-border/40 text-muted-foreground inline-flex items-center gap-1 shrink-0">
                  <Filter className="h-3 w-3" /> View
                </span>
                {([
                  { key: "all", label: "All" },
                  { key: "tech", label: "Tech" },
                  { key: "saas", label: "SaaS" },
                ] as Array<{ key: ViewFilter; label: string }>).map((v) => (
                  <button
                    key={v.key}
                    onClick={() => {
                      setViewFilter(v.key);
                      setActiveCategory("all");
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors shrink-0 ${viewFilter === v.key
                      ? "bg-primary text-primary-foreground border-primary/40"
                      : "text-muted-foreground border-border/40 bg-secondary/20 hover:text-foreground"
                      }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mt-3 pb-1">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors shrink-0 ${activeCategory === "all"
                    ? "bg-accent text-accent-foreground border-accent/40"
                    : "text-muted-foreground border-border/40 bg-secondary/20 hover:text-foreground"
                    }`}
                >
                  All Categories
                </button>
                {availableCategories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors shrink-0 ${activeCategory === cat.key
                      ? "bg-accent text-accent-foreground border-accent/40"
                      : "text-muted-foreground border-border/40 bg-secondary/20 hover:text-foreground"
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </motion.section>

            {visibleCategories.length === 0 ? (
              <div className="glass rounded-2xl border border-border/30 p-8 text-center text-muted-foreground">
                No categories found for this branch and view filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleCategories.map((cat, index) => {
                  const signals = categorySignalCount(cat.topics.flatMap((t) => t.keywords));
                  return (
                    <motion.article
                      key={cat.key}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="glass rounded-2xl border border-border/30 p-5"
                    >
                      <div className="mb-3">
                        <h2 className="font-display text-xl font-bold text-foreground">{cat.label}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{cat.summary}</p>
                      </div>

                      <div className="mb-3 rounded-lg border border-border/20 bg-background/25 p-2.5">
                        <p className="text-[11px] text-muted-foreground mb-1">Category signal</p>
                        <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-orange-400"
                            style={{ width: `${Math.min(100, 20 + signals * 10)}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {signals > 0
                            ? `${signals} related papers detected in your IEEE repository.`
                            : "No strong local signal yet. Good chance for first-mover work."}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {cat.topics.map((topic) => {
                          const topicLocal = categorySignalCount(topic.keywords);
                          const isOpen = expandedTopic === topic.id;
                          return (
                            <div key={topic.id} className="rounded-xl border border-border/25 bg-background/30 p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-xs text-muted-foreground">Topic title</p>
                                  <h3 className="text-sm md:text-[15px] font-semibold text-foreground leading-snug">{topic.title}</h3>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded-full border ${getDifficultyClass(topic.difficulty)} shrink-0`}>
                                  {topic.difficulty}
                                </span>
                              </div>

                              <div className="mt-2">
                                <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400" style={{ width: getHeatWidth(topic.heat) }} />
                                </div>
                                <div className="flex items-center justify-between mt-1.5 text-[11px]">
                                  <span className="text-primary inline-flex items-center gap-1">
                                    {topic.heat === "hot" ? <Flame className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />} {getHeatLabel(topic.heat)}
                                  </span>
                                  <span className="text-muted-foreground">{topicLocal} local matches</span>
                                </div>
                              </div>

                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground">Why it is trending right now</p>
                                <p className="text-sm text-foreground/90 mt-0.5">{topic.whyTrending}</p>
                              </div>

                              <button
                                onClick={() => setExpandedTopic(isOpen ? null : topic.id)}
                                className="mt-2 text-xs px-2.5 py-1.5 rounded-lg border border-border/35 bg-secondary/20 text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
                              >
                                <Wrench className="h-3 w-3" />
                                Methods/tools/algorithms to use
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                              </button>

                              {isOpen && (
                                <div className="mt-2 rounded-lg border border-border/25 bg-background/35 p-2.5">
                                  <ul className="space-y-1.5">
                                    {topic.methods.map((m) => (
                                      <li key={m} className="text-sm text-foreground/90 flex items-start gap-2">
                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/80 shrink-0" />
                                        <span>{m}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-3 pt-3 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Use this as idea guidance, not guaranteed acceptance</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default IEEEResearchIdeas;
