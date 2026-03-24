import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles } from "lucide-react";

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

const SkillGalaxy = ({ branchSlug }: { branchSlug?: string }) => {
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const nodes = generateSkillNodes(branchSlug);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/30 glass">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />

      <div className="relative px-6 pt-5 pb-2 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-primary uppercase tracking-widest">Skill Galaxy</span>
        <span className="text-[10px] text-muted-foreground ml-auto">Tap a skill to explore</span>
      </div>

      <div className="relative w-full aspect-[2/1] min-h-[280px]">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
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
                stroke={isActive ? "hsl(var(--accent))" : "hsl(var(--primary))"}
                strokeOpacity={isActive ? 0.6 : 0.15}
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
              fill="hsl(var(--accent))"
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
                  fill={isActive ? "hsl(var(--accent))" : "hsl(var(--primary))"}
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
                  fontSize="2.2"
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
                      fill="hsl(var(--accent))"
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
    </div>
  );
};

export default SkillGalaxy;
