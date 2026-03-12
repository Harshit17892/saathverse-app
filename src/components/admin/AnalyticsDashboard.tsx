import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Activity, Flame, TrendingUp, Trophy, ArrowUpRight,
  ArrowDownRight, Zap, Calendar, BarChart3, Eye, MessageSquare,
  UserPlus, Layers, Globe, Rocket,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AnalyticsData {
  totalStudents: number;
  activeToday: number;
  totalXpAwarded: number;
  avgStreak: number;
  topStudents: { name: string; xp: number; level: number; streak: number }[];
  recentActions: { action: string; count: number; icon: any }[];
  dailyLogins: { date: string; count: number }[];
  levelDistribution: { level: number; label: string; count: number }[];
  topActions: { action: string; total_xp: number; count: number }[];
  redemptionCount: number;
  totalRewardsRedeemed: number;
}

const levelLabels: Record<number, string> = {
  1: "Freshman", 2: "Sophomore", 3: "Junior", 4: "Senior", 5: "Scholar",
  6: "Expert", 7: "Master", 8: "Legend", 9: "Mythic", 10: "Immortal",
};

const StatCard = ({ icon: Icon, label, value, change, color }: {
  icon: any; label: string; value: string | number; change?: number; color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/50 backdrop-blur-xl p-5 group hover:border-primary/30 transition-all duration-500"
  >
    {/* Glow */}
    <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${color}`} />
    <div className="flex items-start justify-between mb-3">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
        <Icon className="h-5 w-5" style={{ color: "inherit" }} />
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${change >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
          {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <p className="text-2xl font-bold text-foreground font-display">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </motion.div>
);

const MiniBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
  <div className="h-2 w-full rounded-full bg-secondary/30 overflow-hidden">
    <motion.div
      initial={{ width: 0 }} animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`h-full rounded-full ${color}`}
    />
  </div>
);

export default function AnalyticsDashboard() {
  const { activeCollegeId } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [activeCollegeId, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch students
      const studentsQ = supabase.from("students").select("id, name, xp_points, status");
      if (activeCollegeId) studentsQ.eq("college_id", activeCollegeId);
      const { data: students } = await studentsQ;

      // Fetch gamification data
      const gamQ = supabase.from("user_gamification").select("*");
      if (activeCollegeId) gamQ.eq("college_id", activeCollegeId);
      const { data: gamification } = await gamQ;

      // Fetch XP transactions
      const xpQ = supabase.from("xp_transactions").select("*").order("created_at", { ascending: false }).limit(1000);
      const { data: xpTransactions } = await xpQ;

      // Fetch redemptions
      const redQ = supabase.from("reward_redemptions").select("*");
      const { data: redemptions } = await redQ;

      const today = new Date().toISOString().split("T")[0];
      const activeToday = (gamification || []).filter((g: any) => g.last_active_date === today).length;
      const totalXp = (gamification || []).reduce((acc: number, g: any) => acc + (g.xp || 0), 0);
      const avgStreak = (gamification || []).length > 0
        ? Math.round((gamification || []).reduce((acc: number, g: any) => acc + (g.current_streak || 0), 0) / (gamification || []).length)
        : 0;

      // Top students by XP
      const topStudents = (gamification || [])
        .sort((a: any, b: any) => (b.xp || 0) - (a.xp || 0))
        .slice(0, 10)
        .map((g: any) => {
          const student = (students || []).find((s: any) => s.id === g.user_id);
          return {
            name: student?.name || "Unknown",
            xp: g.xp || 0,
            level: g.level || 1,
            streak: g.current_streak || 0,
          };
        });

      // Action breakdown
      const actionMap: Record<string, { count: number; total_xp: number }> = {};
      (xpTransactions || []).forEach((t: any) => {
        if (!actionMap[t.action]) actionMap[t.action] = { count: 0, total_xp: 0 };
        actionMap[t.action].count++;
        actionMap[t.action].total_xp += t.amount || 0;
      });
      const topActions = Object.entries(actionMap)
        .map(([action, data]) => ({ action, ...data }))
        .sort((a, b) => b.total_xp - a.total_xp);

      // Level distribution
      const levelMap: Record<number, number> = {};
      (gamification || []).forEach((g: any) => {
        const lvl = g.level || 1;
        levelMap[lvl] = (levelMap[lvl] || 0) + 1;
      });
      const levelDistribution = Object.entries(levelMap)
        .map(([level, count]) => ({ level: Number(level), label: levelLabels[Number(level)] || `Lvl ${level}`, count }))
        .sort((a, b) => a.level - b.level);

      // Daily logins (last 14 days)
      const dailyMap: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyMap[d.toISOString().split("T")[0]] = 0;
      }
      (gamification || []).forEach((g: any) => {
        if (g.last_active_date && dailyMap[g.last_active_date] !== undefined) {
          dailyMap[g.last_active_date]++;
        }
      });
      const dailyLogins = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

      // Action icons mapping
      const actionIcons: Record<string, any> = {
        daily_login: Flame, connection: UserPlus, club_join: Layers,
        hackathon_team: Globe, startup_create: Rocket, message_sent: MessageSquare,
        profile_view: Eye, event_attend: Calendar,
      };
      const recentActions = topActions.slice(0, 6).map(a => ({
        action: a.action.replace(/_/g, " "),
        count: a.count,
        icon: actionIcons[a.action] || Activity,
      }));

      setData({
        totalStudents: (students || []).length,
        activeToday,
        totalXpAwarded: totalXp,
        avgStreak,
        topStudents,
        recentActions,
        dailyLogins,
        levelDistribution,
        topActions,
        redemptionCount: (redemptions || []).length,
        totalRewardsRedeemed: (redemptions || []).reduce((acc: number, r: any) => acc + (r.xp_spent || 0), 0),
      });
    } catch (e) {
      console.error("Analytics fetch error:", e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
        </motion.div>
        <p className="text-muted-foreground text-sm">Loading analytics...</p>
      </div>
    );
  }

  if (!data) return <div className="p-12 text-center text-muted-foreground">No data available</div>;

  const maxXp = data.topStudents[0]?.xp || 1;
  const maxLevel = Math.max(...data.levelDistribution.map(l => l.count), 1);
  const maxDaily = Math.max(...data.dailyLogins.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Time Range Toggle */}
      <div className="flex items-center gap-2">
        {(["7d", "30d", "all"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
              timeRange === range
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-secondary/30 text-muted-foreground border border-border/20 hover:bg-secondary/50"
            }`}
          >
            {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "All Time"}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={data.totalStudents} color="text-blue-400" />
        <StatCard icon={Activity} label="Active Today" value={data.activeToday} color="text-emerald-400" />
        <StatCard icon={Zap} label="Total XP Awarded" value={data.totalXpAwarded.toLocaleString()} color="text-amber-400" />
        <StatCard icon={Flame} label="Avg Streak" value={`${data.avgStreak} days`} color="text-orange-400" />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="Rewards Redeemed" value={data.redemptionCount} color="text-purple-400" />
        <StatCard icon={TrendingUp} label="XP Spent on Rewards" value={data.totalRewardsRedeemed.toLocaleString()} color="text-pink-400" />
        <StatCard icon={BarChart3} label="Unique Levels" value={data.levelDistribution.length} color="text-cyan-400" />
        <StatCard icon={Calendar} label="Top Action" value={data.topActions[0]?.action.replace(/_/g, " ") || "—"} color="text-indigo-400" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Daily Active Users</h3>
          </div>
          <div className="flex items-end gap-1 h-32">
            {data.dailyLogins.map((d, i) => (
              <motion.div
                key={d.date}
                initial={{ height: 0 }} animate={{ height: `${(d.count / maxDaily) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="flex-1 rounded-t-md bg-gradient-to-t from-primary/60 to-primary/20 relative group cursor-pointer min-h-[4px]"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border/50 rounded-lg px-2 py-1 text-[10px] text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {d.count} users • {new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">
              {new Date(data.dailyLogins[0]?.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {new Date(data.dailyLogins[data.dailyLogins.length - 1]?.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
            </span>
          </div>
        </motion.div>

        {/* Level Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-foreground">Level Distribution</h3>
          </div>
          <div className="space-y-2.5">
            {data.levelDistribution.map((l) => (
              <div key={l.level} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20 truncate">{l.label}</span>
                <div className="flex-1">
                  <MiniBar value={l.count} max={maxLevel} color="bg-gradient-to-r from-amber-500/70 to-orange-500/50" />
                </div>
                <span className="text-xs font-medium text-foreground w-8 text-right">{l.count}</span>
              </div>
            ))}
            {data.levelDistribution.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No level data yet</p>
            )}
          </div>
        </motion.div>

        {/* Top Students Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-foreground">Top Students by XP</h3>
          </div>
          <div className="space-y-2">
            {data.topStudents.map((s, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <span className={`text-xs font-bold w-5 ${i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-400" : "text-muted-foreground"}`}>
                  #{i + 1}
                </span>
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-[10px] font-bold text-foreground">
                  {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{s.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">Lvl {s.level}</span>
                    <span className="text-[10px] text-orange-400">🔥 {s.streak}d</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary">{s.xp.toLocaleString()} XP</span>
              </div>
            ))}
            {data.topStudents.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No XP data yet</p>
            )}
          </div>
        </motion.div>

        {/* Action Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-foreground">XP by Activity Type</h3>
          </div>
          <div className="space-y-3">
            {data.topActions.slice(0, 8).map((a, i) => {
              const Icon = data.recentActions.find(r => r.action === a.action.replace(/_/g, " "))?.icon || Activity;
              const maxActionXp = data.topActions[0]?.total_xp || 1;
              return (
                <div key={a.action} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-foreground capitalize">{a.action.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground">{a.count}×</span>
                      <span className="text-xs font-medium text-primary">{a.total_xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                  <MiniBar value={a.total_xp} max={maxActionXp} color="bg-gradient-to-r from-primary/60 to-accent/40" />
                </div>
              );
            })}
            {data.topActions.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No activity data yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Neural Network Background Decoration */}
      <div className="relative rounded-2xl border border-border/20 bg-card/30 backdrop-blur-xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative">
          <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Platform Health Summary
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Real-time overview of student engagement and platform activity</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{data.totalStudents > 0 ? Math.round((data.activeToday / data.totalStudents) * 100) : 0}%</p>
              <p className="text-[10px] text-muted-foreground">DAU Rate</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{data.totalStudents > 0 ? Math.round(data.totalXpAwarded / data.totalStudents) : 0}</p>
              <p className="text-[10px] text-muted-foreground">Avg XP / Student</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{data.avgStreak}</p>
              <p className="text-[10px] text-muted-foreground">Avg Login Streak</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{data.redemptionCount}</p>
              <p className="text-[10px] text-muted-foreground">Rewards Claimed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
