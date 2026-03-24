import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, TrendingUp } from "lucide-react";

interface SkillStat {
  name: string;
  count: number;
}

interface SkillWithMeta extends SkillStat {
  index: number;
  tier: SkillTier;
}

const branchSkillMap: Record<string, SkillStat[]> = {
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

const getBranchSkills = (branchSlug?: string): SkillStat[] => {
  const normalized = (branchSlug || "").replace(/-[a-f0-9]{8}$/i, "");
  return branchSkillMap[normalized] || defaultSkills;
};

const branchThemes: Record<string, {
  panel: string;
  glowA: string;
  glowB: string;
  hexBase: string;
  hexActive: string;
  badge: string;
}> = {
  "engineering-technology": {
    panel: "from-cyan-500/12 via-transparent to-violet-500/10",
    glowA: "rgba(34,211,238,0.20)",
    glowB: "rgba(168,85,247,0.18)",
    hexBase: "#22d3ee",
    hexActive: "#a78bfa",
    badge: "text-cyan-200 border-cyan-400/30 bg-cyan-500/10",
  },
  medical: {
    panel: "from-rose-500/12 via-transparent to-orange-500/10",
    glowA: "rgba(251,113,133,0.20)",
    glowB: "rgba(251,146,60,0.18)",
    hexBase: "#fb7185",
    hexActive: "#fb923c",
    badge: "text-rose-200 border-rose-400/30 bg-rose-500/10",
  },
  science: {
    panel: "from-blue-500/12 via-transparent to-emerald-500/10",
    glowA: "rgba(59,130,246,0.20)",
    glowB: "rgba(16,185,129,0.18)",
    hexBase: "#3b82f6",
    hexActive: "#10b981",
    badge: "text-blue-200 border-blue-400/30 bg-blue-500/10",
  },
  commerce: {
    panel: "from-amber-500/12 via-transparent to-sky-500/10",
    glowA: "rgba(245,158,11,0.20)",
    glowB: "rgba(14,165,233,0.18)",
    hexBase: "#f59e0b",
    hexActive: "#38bdf8",
    badge: "text-amber-200 border-amber-400/30 bg-amber-500/10",
  },
  default: {
    panel: "from-primary/12 via-transparent to-accent/10",
    glowA: "rgba(124,58,237,0.20)",
    glowB: "rgba(59,130,246,0.18)",
    hexBase: "#8b5cf6",
    hexActive: "#22d3ee",
    badge: "text-primary border-primary/30 bg-primary/10",
  },
};

type SkillTier = "Emerging" | "Strong" | "Hot";

const getSkillTier = (count: number): SkillTier => {
  if (count >= 32) return "Hot";
  if (count >= 20) return "Strong";
  return "Emerging";
};

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
};

const SkillGalaxy = ({ branchSlug }: { branchSlug?: string }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const normalized = (branchSlug || "").replace(/-[a-f0-9]{8}$/i, "");
  const skills = getBranchSkills(normalized);
  const theme = branchThemes[normalized] || branchThemes.default;
  const focused = skills[activeIndex] || skills[0];
  const totalDensity = skills.reduce((sum, s) => sum + s.count, 0);
  const avgDensity = Math.round(totalDensity / skills.length);
  const maxCount = Math.max(...skills.map(s => s.count));
  const minCount = Math.min(...skills.map(s => s.count));

  useEffect(() => {
    setActiveIndex(0);
  }, [normalized]);

  const rows = useMemo(() => chunk(skills, 4), [skills]);

  const laneMap = useMemo(() => {
    const lanes: Record<SkillTier, SkillWithMeta[]> = {
      Hot: [],
      Strong: [],
      Emerging: [],
    };
    skills.forEach((skill, index) => {
      lanes[getSkillTier(skill.count)].push({
        ...skill,
        index,
        tier: getSkillTier(skill.count),
      });
    });
    return lanes;
  }, [skills]);

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
          <p className="text-[10px] text-muted-foreground mt-0.5">Hex heatmap + quick skill lanes</p>
        </div>
        <div className="ml-auto text-[10px] px-2 py-1 rounded-full border border-border/40 bg-background/40 text-muted-foreground">
          {skills.length} skills
        </div>
      </div>

      <div className="relative px-5 pb-2 flex items-center gap-2">
        <span className={`text-[10px] px-2 py-1 rounded-full border ${theme.badge}`}>Avg Density: {avgDensity}</span>
        <span className="text-[10px] px-2 py-1 rounded-full border border-border/40 bg-background/40 text-muted-foreground inline-flex items-center gap-1">
          Heatmap View
        </span>
      </div>

      <div className="relative px-3 sm:px-5 pt-1 pb-3">
        <div className="relative rounded-2xl border border-border/35 bg-background/25 px-2 sm:px-3 py-4 sm:py-5 overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundColor: theme.hexBase }} />
          <div className="relative space-y-1.5 sm:space-y-2">
            {rows.map((row, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className="flex justify-center gap-2 sm:gap-3"
                style={{ marginLeft: rowIndex % 2 ? "2rem" : "0" }}
              >
                {row.map((skill, colIndex) => {
                  const index = rowIndex * 4 + colIndex;
                  const isActive = activeIndex === index;
                  const ratio = (skill.count - minCount) / Math.max(maxCount - minCount, 1);

                  return (
                    <motion.button
                      key={skill.name}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      whileHover={{ y: -2, scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative h-16 w-16 sm:h-20 sm:w-20 text-left p-0 border-0 cursor-pointer"
                      style={{
                        clipPath: "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)",
                        backgroundColor: isActive ? theme.hexActive : theme.hexBase,
                        opacity: isActive ? 1 : 0.35 + ratio * 0.55,
                        boxShadow: isActive
                          ? `0 0 0 2px rgba(255,255,255,0.22), 0 10px 25px ${theme.glowA}`
                          : `0 4px 16px ${theme.glowB}`,
                      }}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center px-1 text-center">
                        <span className="text-[10px] leading-tight font-semibold text-white/95 line-clamp-2">{skill.name}</span>
                        <span className="mt-1 text-[9px] font-medium text-white/80">{skill.count}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative px-5 pb-2">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Quick-Filter Pill Lanes</p>
      </div>

      <div className="relative px-3 sm:px-5 pb-3 space-y-2.5">
        {(["Hot", "Strong", "Emerging"] as SkillTier[]).map((lane) => (
          <div key={lane} className="rounded-xl border border-border/30 bg-background/25 px-2 py-2">
            <div className="flex items-center justify-between gap-2 px-1 pb-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-foreground/80">{lane}</span>
              <span className="text-[10px] text-muted-foreground">{laneMap[lane].length} skills</span>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex gap-1.5 min-w-max">
                {laneMap[lane].map((skill) => {
                  const selected = activeIndex === skill.index;
                  return (
                    <button
                      key={`${lane}-${skill.name}`}
                      type="button"
                      onClick={() => setActiveIndex(skill.index)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors ${selected
                        ? `text-white border-transparent`
                        : "text-muted-foreground border-border/40 bg-background/45 hover:text-foreground"
                        }`}
                      style={selected ? { backgroundColor: theme.hexActive } : undefined}
                    >
                      {skill.name} · {skill.count}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
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
