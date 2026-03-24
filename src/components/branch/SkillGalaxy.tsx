import { motion } from "framer-motion";
import { useState } from "react";
import { Radar, Sparkles, TrendingUp } from "lucide-react";

interface SkillNode {
  name: string;
  count: number;
  x: number;
  y: number;
  size: number;
}

const branchSkillMap: Record<string, Array<{ name: string; count: number }>> = {
  "engineering-technology": [
    { name: "React", count: 42 },
    { name: "Python", count: 38 },
    { name: "Java", count: 35 },
    { name: "ML/AI", count: 30 },
    { name: "Node.js", count: 28 },
    { name: "C++", count: 25 },
    { name: "AWS", count: 22 },
    { name: "Docker", count: 20 },
    { name: "TypeScript", count: 18 },
    { name: "Go", count: 15 },
    { name: "Figma", count: 14 },
    { name: "SQL", count: 24 },
    { name: "Rust", count: 12 },
    { name: "K8s", count: 10 },
  ],
  medical: [
    { name: "Anatomy", count: 40 },
    { name: "Physiology", count: 36 },
    { name: "Pathology", count: 33 },
    { name: "Pharmacology", count: 28 },
    { name: "Diagnostics", count: 27 },
    { name: "Biostats", count: 21 },
    { name: "Clinical Skills", count: 24 },
    { name: "Case Review", count: 23 },
    { name: "Public Health", count: 20 },
    { name: "Bioethics", count: 18 },
    { name: "Research", count: 16 },
    { name: "Patient Comm", count: 26 },
    { name: "Emergency Care", count: 14 },
    { name: "Radiology", count: 12 },
  ],
  science: [
    { name: "Physics", count: 34 },
    { name: "Chemistry", count: 32 },
    { name: "Mathematics", count: 36 },
    { name: "Biology", count: 30 },
    { name: "Lab Work", count: 24 },
    { name: "Data Analysis", count: 22 },
    { name: "Scientific Writing", count: 18 },
    { name: "Experiment Design", count: 20 },
    { name: "Statistics", count: 23 },
    { name: "Simulation", count: 16 },
    { name: "Instrumentation", count: 15 },
    { name: "Computing", count: 19 },
    { name: "Research", count: 21 },
    { name: "Presentation", count: 14 },
  ],
  commerce: [
    { name: "Accounting", count: 38 },
    { name: "Finance", count: 35 },
    { name: "Economics", count: 33 },
    { name: "Taxation", count: 30 },
    { name: "Auditing", count: 27 },
    { name: "Business Law", count: 24 },
    { name: "MS Excel", count: 28 },
    { name: "Power BI", count: 20 },
    { name: "Analytics", count: 19 },
    { name: "Corporate Comm", count: 18 },
    { name: "Budgeting", count: 17 },
    { name: "Compliance", count: 16 },
    { name: "Banking", count: 22 },
    { name: "Tally", count: 14 },
  ],
};

const defaultSkills = [
  { name: "Communication", count: 28 },
  { name: "Leadership", count: 24 },
  { name: "Problem Solving", count: 30 },
  { name: "Research", count: 22 },
  { name: "Teamwork", count: 26 },
  { name: "Presentation", count: 20 },
  { name: "Critical Thinking", count: 25 },
  { name: "Networking", count: 18 },
  { name: "Planning", count: 17 },
  { name: "Creativity", count: 21 },
  { name: "Writing", count: 16 },
  { name: "Interview Prep", count: 15 },
  { name: "Portfolio", count: 14 },
  { name: "Mentorship", count: 13 },
];

const generateSkillNodes = (branchSlug?: string): SkillNode[] => {
  const normalized = (branchSlug || "").replace(/-[a-f0-9]{8}$/i, "");
  const skills = branchSkillMap[normalized] || defaultSkills;

  const maxCount = Math.max(...skills.map(s => s.count));
  const positions = [
    [50, 30], [25, 50], [75, 50], [40, 65], [60, 35],
    [15, 35], [85, 40], [30, 80], [70, 75], [50, 55],
    [20, 65], [80, 25], [55, 85], [45, 15],
  ];

  return skills.map((s, i) => ({
    name: s.name,
    count: s.count,
    x: positions[i][0],
    y: positions[i][1],
    size: 20 + (s.count / maxCount) * 40,
  }));
};

const connections: [number, number][] = [
  [0, 4], [0, 8], [1, 3], [1, 5], [2, 6], [2, 4],
  [3, 9], [4, 8], [5, 10], [6, 11], [7, 3], [8, 12],
  [9, 13], [10, 7], [11, 2], [12, 13],
];

const branchThemes: Record<string, {
  panel: string;
  glowA: string;
  glowB: string;
  line: string;
  node: string;
  nodeActive: string;
  badge: string;
}> = {
  "engineering-technology": {
    panel: "from-cyan-500/12 via-transparent to-violet-500/10",
    glowA: "rgba(34,211,238,0.20)",
    glowB: "rgba(168,85,247,0.18)",
    line: "#67e8f9",
    node: "#22d3ee",
    nodeActive: "#a78bfa",
    badge: "text-cyan-200 border-cyan-400/30 bg-cyan-500/10",
  },
  medical: {
    panel: "from-rose-500/12 via-transparent to-orange-500/10",
    glowA: "rgba(251,113,133,0.20)",
    glowB: "rgba(251,146,60,0.18)",
    line: "#fb7185",
    node: "#fb7185",
    nodeActive: "#fb923c",
    badge: "text-rose-200 border-rose-400/30 bg-rose-500/10",
  },
  science: {
    panel: "from-blue-500/12 via-transparent to-emerald-500/10",
    glowA: "rgba(59,130,246,0.20)",
    glowB: "rgba(16,185,129,0.18)",
    line: "#60a5fa",
    node: "#3b82f6",
    nodeActive: "#10b981",
    badge: "text-blue-200 border-blue-400/30 bg-blue-500/10",
  },
  commerce: {
    panel: "from-amber-500/12 via-transparent to-sky-500/10",
    glowA: "rgba(245,158,11,0.20)",
    glowB: "rgba(14,165,233,0.18)",
    line: "#fbbf24",
    node: "#f59e0b",
    nodeActive: "#38bdf8",
    badge: "text-amber-200 border-amber-400/30 bg-amber-500/10",
  },
  default: {
    panel: "from-primary/12 via-transparent to-accent/10",
    glowA: "rgba(124,58,237,0.20)",
    glowB: "rgba(59,130,246,0.18)",
    line: "#a78bfa",
    node: "#8b5cf6",
    nodeActive: "#22d3ee",
    badge: "text-primary border-primary/30 bg-primary/10",
  },
};

const getSkillTier = (count: number): "Emerging" | "Strong" | "Hot" => {
  if (count >= 32) return "Hot";
  if (count >= 20) return "Strong";
  return "Emerging";
};

const SkillGalaxy = ({ branchSlug }: { branchSlug?: string }) => {
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const normalized = (branchSlug || "").replace(/-[a-f0-9]{8}$/i, "");
  const nodes = generateSkillNodes(normalized);
  const theme = branchThemes[normalized] || branchThemes.default;
  const focused = nodes[activeNode ?? 0];
  const totalDensity = nodes.reduce((sum, n) => sum + n.count, 0);
  const avgDensity = Math.round(totalDensity / nodes.length);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/30 glass">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.panel}`} />
      <div
        className="absolute -top-16 -left-16 h-56 w-56 rounded-full blur-3xl"
        style={{ backgroundColor: theme.glowA }}
      />
      <div
        className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full blur-3xl"
        style={{ backgroundColor: theme.glowB }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

      <div className="relative px-5 pt-4 pb-2 flex items-start gap-2">
        <div className="h-8 w-8 rounded-lg border border-border/40 bg-background/40 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Skill Galaxy</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Tap a node to inspect branch strength map</p>
        </div>
        <div className="ml-auto text-[10px] px-2 py-1 rounded-full border border-border/40 bg-background/40 text-muted-foreground">
          {nodes.length} skills
        </div>
      </div>

      <div className="relative px-5 pb-2 flex items-center gap-2">
        <span className={`text-[10px] px-2 py-1 rounded-full border ${theme.badge}`}>Avg Density: {avgDensity}</span>
        <span className="text-[10px] px-2 py-1 rounded-full border border-border/40 bg-background/40 text-muted-foreground inline-flex items-center gap-1">
          <Radar className="w-3 h-3" /> Live map
        </span>
      </div>

      <div className="relative w-full aspect-[2/1] min-h-[250px]">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={theme.node} stopOpacity="0.65" />
              <stop offset="100%" stopColor={theme.node} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Connections */}
          {connections.map(([a, b], i) => {
            const isActive = activeNode === a || activeNode === b;
            return (
              <motion.line
                key={`conn-${i}`}
                x1={nodes[a].x}
                y1={nodes[a].y}
                x2={nodes[b].x}
                y2={nodes[b].y}
                stroke={isActive ? theme.nodeActive : theme.line}
                strokeOpacity={isActive ? 0.72 : 0.18}
                strokeWidth={isActive ? 0.4 : 0.2}
                animate={{
                  strokeOpacity: isActive ? [0.4, 0.8, 0.4] : [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
              />
            );
          })}

          {/* Traveling particles on connections */}
          {connections.slice(0, 6).map(([a, b], i) => (
            <motion.circle
              key={`particle-${i}`}
              r="0.4"
              fill={theme.nodeActive}
              opacity={0.7}
              animate={{
                cx: [nodes[a].x, nodes[b].x],
                cy: [nodes[a].y, nodes[b].y],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: i * 0.8,
              }}
            />
          ))}

          {/* Nodes */}
          {nodes.map((node, i) => {
            const isActive = activeNode === i;
            const r = node.size / 10;
            return (
              <g key={i}>
                {/* Pulse ring */}
                {isActive && (
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={r + 2}
                    fill="none"
                    stroke="hsl(var(--accent))"
                    strokeWidth="0.15"
                    animate={{ r: [r + 1, r + 4], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                {/* Glow */}
                <circle cx={node.x} cy={node.y} r={r * 2} fill="url(#nodeGlow)" opacity={isActive ? 0.5 : 0.2} />

                {/* Main node */}
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={r}
                  fill={isActive ? theme.nodeActive : theme.node}
                  opacity={isActive ? 0.9 : 0.5}
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveNode(i)}
                  onMouseLeave={() => setActiveNode(null)}
                  whileHover={{ scale: 1.3 }}
                  animate={{
                    y: [0, -0.5, 0, 0.5, 0],
                  }}
                  transition={{ duration: 4 + i * 0.3, repeat: Infinity }}
                  style={{ originX: `${node.x}px`, originY: `${node.y}px` }}
                />

                {/* Label */}
                <text
                  x={node.x}
                  y={node.y + r + 2.5}
                  textAnchor="middle"
                  fill={isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))"}
                  fontSize="2"
                  fontWeight={isActive ? "700" : "500"}
                  className="pointer-events-none select-none"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {node.name}
                </text>

                {/* Count badge */}
                {isActive && (
                  <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}>
                    <rect
                      x={node.x - 4}
                      y={node.y - r - 4.5}
                      width="8"
                      height="3"
                      rx="1"
                      fill={theme.nodeActive}
                      opacity="0.9"
                    />
                    <text
                      x={node.x}
                      y={node.y - r - 2.2}
                      textAnchor="middle"
                      fill="hsl(var(--accent-foreground))"
                      fontSize="1.8"
                      fontWeight="700"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {node.count} students
                    </text>
                  </motion.g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="relative px-5 pb-4 pt-1">
        <div className="rounded-xl border border-border/35 bg-background/35 px-3 py-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{focused.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{focused.count} students · {getSkillTier(focused.count)} momentum</p>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-full border ${theme.badge} inline-flex items-center gap-1 shrink-0`}>
            <TrendingUp className="w-3 h-3" />
            {getSkillTier(focused.count)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SkillGalaxy;
