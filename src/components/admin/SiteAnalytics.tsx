import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Activity, GitBranch, Code, Heart, MapPin,
  ArrowUpRight, ArrowDownRight, Briefcase, GraduationCap,
  MessageSquare, UserPlus, Layers, Globe, BookOpen, Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SiteData {
  totalStudents: number;
  totalAlumni: number;
  totalConnections: number;
  totalClubMembers: number;
  totalHackathonTeams: number;
  totalStartups: number;
  branchDistribution: { name: string; count: number; color: string }[];
  topSkills: { skill: string; count: number }[];
  genderSplit: { label: string; count: number; color: string }[];
  yearDistribution: { year: string; count: number }[];
  clubPopularity: { name: string; members: number }[];
  statusBreakdown: { status: string; count: number }[];
}

const branchColors = [
  "from-blue-500/70 to-blue-400/40",
  "from-emerald-500/70 to-emerald-400/40",
  "from-purple-500/70 to-purple-400/40",
  "from-amber-500/70 to-amber-400/40",
  "from-pink-500/70 to-pink-400/40",
  "from-cyan-500/70 to-cyan-400/40",
  "from-red-500/70 to-red-400/40",
  "from-indigo-500/70 to-indigo-400/40",
  "from-teal-500/70 to-teal-400/40",
  "from-orange-500/70 to-orange-400/40",
];

const genderColors: Record<string, string> = {
  male: "from-blue-500/60 to-blue-400/30",
  female: "from-pink-500/60 to-pink-400/30",
  other: "from-purple-500/60 to-purple-400/30",
  unknown: "from-slate-500/60 to-slate-400/30",
};

const MiniBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
  <div className="h-2 w-full rounded-full bg-secondary/30 overflow-hidden">
    <motion.div
      initial={{ width: 0 }} animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`h-full rounded-full bg-gradient-to-r ${color}`}
    />
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }: {
  icon: any; label: string; value: string | number; color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/50 backdrop-blur-xl p-5 group hover:border-primary/30 transition-all duration-500"
  >
    <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${color}`} />
    <div className="flex items-start justify-between mb-3">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
        <Icon className="h-5 w-5" style={{ color: "inherit" }} />
      </div>
    </div>
    <p className="text-2xl font-bold text-foreground font-display">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </motion.div>
);

// Donut chart component
const DonutChart = ({ data, size = 120 }: { data: { label: string; count: number; color: string }[]; size?: number }) => {
  const total = data.reduce((acc, d) => acc + d.count, 0);
  if (total === 0) return <p className="text-xs text-muted-foreground text-center py-6">No data</p>;

  const colorMap: Record<string, string> = {
    "from-blue-500/60 to-blue-400/30": "#3b82f6",
    "from-pink-500/60 to-pink-400/30": "#ec4899",
    "from-purple-500/60 to-purple-400/30": "#a855f7",
    "from-slate-500/60 to-slate-400/30": "#64748b",
  };

  let cumulativePercent = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
        {data.map((d, i) => {
          const percent = d.count / total;
          const offset = cumulativePercent * circumference;
          const strokeLen = percent * circumference;
          cumulativePercent += percent;
          const strokeColor = colorMap[d.color] || ["#3b82f6", "#ec4899", "#a855f7", "#64748b"][i % 4];
          return (
            <circle
              key={d.label}
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth="12"
              strokeDasharray={`${strokeLen} ${circumference - strokeLen}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-1000"
              transform="rotate(-90 50 50)"
            />
          );
        })}
        <text x="50" y="48" textAnchor="middle" className="fill-foreground text-lg font-bold" fontSize="14">{total}</text>
        <text x="50" y="60" textAnchor="middle" className="fill-muted-foreground" fontSize="7">total</text>
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => {
          const strokeColor = colorMap[d.color] || ["#3b82f6", "#ec4899", "#a855f7", "#64748b"][i % 4];
          return (
            <div key={d.label} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: strokeColor }} />
              <span className="text-xs text-foreground capitalize">{d.label}</span>
              <span className="text-xs text-muted-foreground ml-auto">{d.count} ({Math.round((d.count / total) * 100)}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function SiteAnalytics() {
  const { activeCollegeId } = useAuth();
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "engagement">("overview");

  useEffect(() => {
    fetchSiteAnalytics();
  }, [activeCollegeId]);

  const fetchSiteAnalytics = async () => {
    setLoading(true);
    try {
      // Parallel fetches
      const studentsQ = supabase.from("students").select("id, name, branch_id, skills, status, graduation_year");
      const profilesQ = supabase.from("profiles").select("id, branch, skills, gender, year_of_study, is_alumni");
      const alumniQ = supabase.from("alumni").select("id, department");
      const connectionsQ = supabase.from("connections").select("id, status");
      const clubMembersQ = supabase.from("club_members").select("id, club_id, is_active");
      const clubsQ = supabase.from("clubs").select("id, name, members");
      const hackTeamsQ = supabase.from("hackathon_teams").select("id");
      const startupsQ = supabase.from("startup_ideas").select("id");
      const branchesQ = supabase.from("branches").select("id, name, student_count, color");

      if (activeCollegeId) {
        studentsQ.eq("college_id", activeCollegeId);
        profilesQ.eq("college_id", activeCollegeId);
        alumniQ.eq("college_id", activeCollegeId);
        connectionsQ.eq("college_id", activeCollegeId);
        clubMembersQ.eq("college_id", activeCollegeId);
        clubsQ.eq("college_id", activeCollegeId);
        hackTeamsQ.eq("college_id", activeCollegeId);
        startupsQ.eq("college_id", activeCollegeId);
        branchesQ.eq("college_id", activeCollegeId);
      }

      const [
        { data: students },
        { data: profiles },
        { data: alumni },
        { data: connections },
        { data: clubMembers },
        { data: clubs },
        { data: hackTeams },
        { data: startups },
        { data: branches },
      ] = await Promise.all([
        studentsQ, profilesQ, alumniQ, connectionsQ, clubMembersQ, clubsQ, hackTeamsQ, startupsQ, branchesQ,
      ]);

      // Branch distribution from branches table
      const branchDistribution = (branches || [])
        .map((b: any, i: number) => ({
          name: b.name,
          count: b.student_count || 0,
          color: branchColors[i % branchColors.length],
        }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 12);

      // Skills aggregation from profiles
      const skillMap: Record<string, number> = {};
      (profiles || []).forEach((p: any) => {
        (p.skills || []).forEach((s: string) => {
          if (s) skillMap[s] = (skillMap[s] || 0) + 1;
        });
      });
      const topSkills = Object.entries(skillMap)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

      // Gender split from profiles
      const genderMap: Record<string, number> = {};
      (profiles || []).forEach((p: any) => {
        const g = (p.gender || "unknown").toLowerCase();
        genderMap[g] = (genderMap[g] || 0) + 1;
      });
      const genderSplit = Object.entries(genderMap)
        .map(([label, count]) => ({
          label,
          count,
          color: genderColors[label] || genderColors.unknown,
        }))
        .sort((a, b) => b.count - a.count);

      // Year distribution from profiles
      const yearMap: Record<string, number> = {};
      (profiles || []).forEach((p: any) => {
        const y = p.year_of_study || "Unknown";
        yearMap[y] = (yearMap[y] || 0) + 1;
      });
      const yearDistribution = Object.entries(yearMap)
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => {
          const order = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Unknown"];
          return order.indexOf(a.year) - order.indexOf(b.year);
        });

      // Club popularity
      const clubPopularity = (clubs || [])
        .map((c: any) => ({ name: c.name, members: c.members || 0 }))
        .sort((a: any, b: any) => b.members - a.members)
        .slice(0, 10);

      // Status breakdown
      const statusMap: Record<string, number> = {};
      (students || []).forEach((s: any) => {
        const st = s.status || "active";
        statusMap[st] = (statusMap[st] || 0) + 1;
      });
      const statusBreakdown = Object.entries(statusMap)
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count);

      const acceptedConnections = (connections || []).filter((c: any) => c.status === "accepted").length;

      setData({
        totalStudents: (students || []).length,
        totalAlumni: (alumni || []).length,
        totalConnections: acceptedConnections,
        totalClubMembers: (clubMembers || []).filter((m: any) => m.is_active).length,
        totalHackathonTeams: (hackTeams || []).length,
        totalStartups: (startups || []).length,
        branchDistribution,
        topSkills,
        genderSplit,
        yearDistribution,
        clubPopularity,
        statusBreakdown,
      });
    } catch (e) {
      console.error("Site analytics error:", e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
        </motion.div>
        <p className="text-muted-foreground text-sm">Loading site analytics...</p>
      </div>
    );
  }

  if (!data) return <div className="p-12 text-center text-muted-foreground">No data available</div>;

  const maxBranch = Math.max(...data.branchDistribution.map(b => b.count), 1);
  const maxSkill = data.topSkills[0]?.count || 1;
  const maxYear = Math.max(...data.yearDistribution.map(y => y.count), 1);
  const maxClub = data.clubPopularity[0]?.members || 1;

  return (
    <div className="space-y-6">
      {/* Tab Toggle */}
      <div className="flex items-center gap-2">
        {(["overview", "engagement"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${
              tab === t
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-secondary/30 text-muted-foreground border border-border/20 hover:bg-secondary/50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Students" value={data.totalStudents} color="text-blue-400" />
        <StatCard icon={GraduationCap} label="Alumni" value={data.totalAlumni} color="text-emerald-400" />
        <StatCard icon={UserPlus} label="Connections Made" value={data.totalConnections} color="text-purple-400" />
        <StatCard icon={Layers} label="Active Club Members" value={data.totalClubMembers} color="text-amber-400" />
        <StatCard icon={Globe} label="Hackathon Teams" value={data.totalHackathonTeams} color="text-cyan-400" />
        <StatCard icon={Briefcase} label="Startup Ideas" value={data.totalStartups} color="text-pink-400" />
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gender Split */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-xl p-5"
          >
            <div className="flex items-center gap-2 mb-5">
              <Heart className="h-4 w-4 text-pink-400" />
              <h3 className="text-sm font-semibold text-foreground">Gender Distribution</h3>
            </div>
            <DonutChart data={data.genderSplit} />
          </motion.div>

          {/* Year Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-foreground">Students by Year</h3>
            </div>
            <div className="flex items-end gap-2 h-32 mb-2">
              {data.yearDistribution.map((y, i) => (
                <motion.div
                  key={y.year}
                  initial={{ height: 0 }} animate={{ height: `${(y.count / maxYear) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="flex-1 rounded-t-lg bg-gradient-to-t from-indigo-500/60 to-indigo-400/20 relative group cursor-pointer min-h-[4px]"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border/50 rounded-lg px-2 py-1 text-[10px] text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {y.count} students
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-2">
              {data.yearDistribution.map((y) => (
                <div key={y.year} className="flex-1 text-center text-[10px] text-muted-foreground truncate">{y.year}</div>
              ))}
            </div>
          </motion.div>

          {/* Branch Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-xl p-5 lg:col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Students by Branch</h3>
              <span className="text-[10px] text-muted-foreground ml-auto">{data.branchDistribution.length} branches</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
              {data.branchDistribution.map((b, i) => (
                <div key={b.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                  <span className="text-xs text-foreground w-32 truncate" title={b.name}>{b.name}</span>
                  <div className="flex-1">
                    <MiniBar value={b.count} max={maxBranch} color={b.color} />
                  </div>
                  <span className="text-xs font-medium text-foreground w-8 text-right">{b.count}</span>
                </div>
              ))}
              {data.branchDistribution.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4 col-span-2">No branch data</p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {tab === "engagement" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Code className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-foreground">Most Popular Skills</h3>
            </div>
            <div className="space-y-2.5">
              {data.topSkills.map((s, i) => (
                <div key={s.skill} className="flex items-center gap-3">
                  <span className={`text-xs font-bold w-5 text-right ${i < 3 ? "text-primary" : "text-muted-foreground"}`}>{i + 1}</span>
                  <span className="text-xs text-foreground w-28 truncate" title={s.skill}>{s.skill}</span>
                  <div className="flex-1">
                    <MiniBar value={s.count} max={maxSkill} color="from-emerald-500/60 to-teal-400/30" />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{s.count}</span>
                </div>
              ))}
              {data.topSkills.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No skills data</p>
              )}
            </div>
          </motion.div>

          {/* Club Popularity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">Most Popular Clubs</h3>
            </div>
            <div className="space-y-2.5">
              {data.clubPopularity.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className={`text-xs font-bold w-5 text-right ${i < 3 ? "text-amber-400" : "text-muted-foreground"}`}>{i + 1}</span>
                  <span className="text-xs text-foreground w-28 truncate" title={c.name}>{c.name}</span>
                  <div className="flex-1">
                    <MiniBar value={c.members} max={maxClub} color="from-amber-500/60 to-yellow-400/30" />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{c.members}</span>
                </div>
              ))}
              {data.clubPopularity.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No club data</p>
              )}
            </div>
          </motion.div>

          {/* Student Status Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-foreground">Student Status</h3>
            </div>
            <div className="space-y-3">
              {data.statusBreakdown.map((s) => {
                const statusColors: Record<string, string> = {
                  active: "from-emerald-500/60 to-green-400/30",
                  alumni: "from-blue-500/60 to-indigo-400/30",
                  inactive: "from-slate-500/60 to-gray-400/30",
                };
                return (
                  <div key={s.status} className="flex items-center gap-3">
                    <span className="text-xs text-foreground w-20 capitalize">{s.status}</span>
                    <div className="flex-1">
                      <MiniBar value={s.count} max={data.totalStudents || 1} color={statusColors[s.status] || "from-primary/60 to-accent/30"} />
                    </div>
                    <span className="text-xs font-medium text-foreground w-8 text-right">{s.count}</span>
                    <span className="text-[10px] text-muted-foreground w-10 text-right">
                      {data.totalStudents > 0 ? Math.round((s.count / data.totalStudents) * 100) : 0}%
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Platform Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="relative rounded-2xl border border-border/20 bg-card/30 backdrop-blur-xl p-5 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hex-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M15 0 L30 8 L30 22 L15 30 L0 22 L0 8 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hex-grid)" />
              </svg>
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Engagement Metrics</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-xl bg-secondary/20 border border-border/20">
                  <p className="text-lg font-bold text-foreground">{data.topSkills.length}</p>
                  <p className="text-[10px] text-muted-foreground">Unique Skills</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-secondary/20 border border-border/20">
                  <p className="text-lg font-bold text-foreground">{data.clubPopularity.length}</p>
                  <p className="text-[10px] text-muted-foreground">Active Clubs</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-secondary/20 border border-border/20">
                  <p className="text-lg font-bold text-foreground">
                    {data.totalStudents > 0 ? Math.round((data.totalConnections / data.totalStudents) * 100) : 0}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">Connection Rate</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-secondary/20 border border-border/20">
                  <p className="text-lg font-bold text-foreground">
                    {data.totalStudents > 0 ? (data.totalClubMembers / data.totalStudents).toFixed(1) : "0"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Clubs / Student</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
