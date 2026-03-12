import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Trophy, Star, Zap, Gift, Crown, TrendingUp,
  ChevronRight, Sparkles, Target, Calendar, Award, Coffee,
  BookOpen, Ticket, Shirt, DoorOpen, UtensilsCrossed, GraduationCap, Loader2, Check
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGamification, useLeaderboard, useRewards } from "@/hooks/use-gamification";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const iconMap: Record<string, any> = {
  coffee: Coffee, "book-open": BookOpen, crown: Crown, ticket: Ticket,
  shirt: Shirt, "door-open": DoorOpen, utensils: UtensilsCrossed,
  "graduation-cap": GraduationCap, gift: Gift,
};

const levelTitles: Record<number, string> = {
  1: "Freshman", 2: "Explorer", 3: "Achiever", 4: "Champion",
  5: "Legend", 6: "Master", 7: "Grandmaster", 8: "Titan",
  9: "Mythic", 10: "Immortal",
};

const tabs = [
  { id: "overview", label: "Overview", icon: Zap },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "rewards", label: "Rewards Store", icon: Gift },
  { id: "history", label: "My Rewards", icon: Award },
];

const Gamification = () => {
  const { user } = useAuth();
  const { data: gam, loading: gamLoading, checkStreak } = useGamification();
  const { leaders, loading: leadLoading } = useLeaderboard();
  const { rewards, redemptions, loading: rewLoading, refetch: refetchRewards } = useRewards();
  const [activeTab, setActiveTab] = useState("overview");
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const handleRedeem = async (reward: any) => {
    if (!user || !gam) return;
    if (gam.xp < reward.xp_cost) {
      toast.error(`Need ${reward.xp_cost - gam.xp} more XP!`);
      return;
    }
    setRedeemingId(reward.id);
    try {
      // Insert redemption
      const { error } = await supabase.from("reward_redemptions").insert({
        user_id: user.id,
        reward_id: reward.id,
        xp_spent: reward.xp_cost,
        coupon_code: reward.coupon_code,
      });
      if (error) throw error;

      // Deduct XP
      await supabase.rpc("award_xp", {
        _user_id: user.id,
        _amount: -reward.xp_cost,
        _action: "reward_redeem",
        _description: `Redeemed: ${reward.title}`,
      });

      toast.success(`🎉 Redeemed "${reward.title}"!${reward.coupon_code ? ` Code: ${reward.coupon_code}` : ""}`);
      refetchRewards();
    } catch (err: any) {
      toast.error(err.message || "Redemption failed");
    } finally {
      setRedeemingId(null);
    }
  };

  const myRank = leaders.findIndex(l => l.user_id === user?.id) + 1;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      <div className="absolute top-40 left-10 w-[400px] h-[400px] rounded-full bg-primary/8 blur-[150px]" />
      <div className="absolute bottom-20 right-10 w-[350px] h-[350px] rounded-full bg-accent/8 blur-[150px]" />

      <div className="relative z-10 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-4"
            >
              <Flame className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium text-accent">Gamification Hub</span>
            </motion.div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-3">
              Level Up. <span className="gradient-text">Earn Rewards.</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
              Earn XP, maintain streaks, climb the leaderboard, and redeem awesome rewards!
            </p>
          </motion.div>

          {/* Stats Cards */}
          {gam && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8"
            >
              {[
                { icon: Star, label: "Level", value: gam.level, sub: levelTitles[Math.min(gam.level, 10)] || "Immortal", color: "text-yellow-400" },
                { icon: Zap, label: "Total XP", value: gam.xp.toLocaleString(), sub: `${gam.xpToNextLevel} to next level`, color: "text-primary" },
                { icon: Flame, label: "Streak", value: `${gam.currentStreak}🔥`, sub: `Best: ${gam.longestStreak} days`, color: "text-orange-400" },
                { icon: Trophy, label: "Rank", value: myRank ? `#${myRank}` : "-", sub: `of ${leaders.length} students`, color: "text-accent" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="glass rounded-2xl p-4 border border-border/30 text-center"
                >
                  <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                  <div className="font-display text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{stat.sub}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* XP Progress Bar */}
          {gam && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-4 sm:p-5 border border-border/30 mb-8"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Level {gam.level}</span>
                <span className="text-sm font-medium text-foreground">Level {gam.level + 1}</span>
              </div>
              <Progress value={gam.levelProgress} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {gam.xpToNextLevel} XP to reach {levelTitles[Math.min(gam.level + 1, 10)] || "next level"}
              </p>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex items-center justify-center mb-8">
            <div className="grid grid-cols-2 sm:inline-flex gap-1.5 p-1.5 rounded-2xl glass border border-border/30 w-full sm:w-auto">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground glow-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* How to earn XP */}
              <div className="glass rounded-2xl p-5 sm:p-6 border border-border/30">
                <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> How to Earn XP
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { action: "Daily Login", xp: "10-50", icon: Calendar, desc: "Log in daily, streak bonus increases!" },
                    { action: "Connect with Student", xp: "+20", icon: Zap, desc: "Send/accept connection requests" },
                    { action: "Join a Club", xp: "+30", icon: Star, desc: "Become a member of any club" },
                    { action: "Create Hackathon Team", xp: "+25", icon: Trophy, desc: "Create or join a hackathon team" },
                    { action: "Submit Startup Idea", xp: "+50", icon: Sparkles, desc: "Share your startup idea" },
                    { action: "Complete Profile", xp: "+40", icon: Target, desc: "Fill out all profile fields" },
                  ].map((item, i) => (
                    <motion.div
                      key={item.action}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/20"
                    >
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.action}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                      </div>
                      <Badge className="bg-accent/15 text-accent border-accent/30 text-xs shrink-0">
                        {item.xp} XP
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Streak Calendar Visual */}
              <div className="glass rounded-2xl p-5 sm:p-6 border border-border/30">
                <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-400" /> Streak Tracker
                </h3>
                <div className="flex items-center gap-2 justify-center flex-wrap">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const isActive = gam && i < gam.currentStreak;
                    return (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1, type: "spring" }}
                        className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
                          isActive
                            ? "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/30"
                            : "bg-secondary/40 text-muted-foreground border border-border/30"
                        }`}
                      >
                        {isActive ? "🔥" : i + 1}
                      </motion.div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  {gam && gam.currentStreak > 0
                    ? `${gam.currentStreak} day streak! Keep it going for bonus XP!`
                    : "Log in daily to start your streak!"}
                </p>
              </div>
            </motion.div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {leadLoading ? (
                <div className="text-center py-16">
                  <Loader2 className="h-8 w-8 text-primary mx-auto animate-spin" />
                </div>
              ) : leaders.length === 0 ? (
                <div className="text-center py-16">
                  <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No rankings yet. Start earning XP!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Top 3 */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {leaders.slice(0, 3).map((leader, i) => {
                      const podiumOrder = [1, 0, 2];
                      const l = leaders[podiumOrder[i]];
                      if (!l) return null;
                      const colors = ["from-yellow-400 to-amber-500", "from-gray-300 to-gray-400", "from-amber-600 to-orange-700"];
                      const sizes = ["h-20 sm:h-24", "h-16 sm:h-20", "h-14 sm:h-18"];
                      return (
                        <motion.div
                          key={l.user_id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.15 }}
                          className={`glass rounded-2xl p-4 border border-border/30 text-center ${i === 0 ? "ring-2 ring-yellow-400/30" : ""}`}
                        >
                          <div className={`mx-auto mb-2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${colors[podiumOrder[i]]} flex items-center justify-center text-white font-bold text-lg`}>
                            {l.avatar ? (
                              <img src={l.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                            ) : (
                              l.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
                            )}
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-foreground truncate">{l.name}</p>
                          <p className="text-[10px] text-muted-foreground">{l.branch || "Student"}</p>
                          <div className="mt-2">
                            <span className="text-sm sm:text-base font-bold gradient-text">{l.xp.toLocaleString()} XP</span>
                          </div>
                          <Badge className="mt-1 text-[9px] bg-primary/10 text-primary border-primary/20">Lv.{l.level}</Badge>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Rest of leaderboard */}
                  {leaders.slice(3).map((l, i) => (
                    <motion.div
                      key={l.user_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-xl glass border transition-all ${
                        l.user_id === user?.id ? "border-primary/40 bg-primary/5" : "border-border/20"
                      }`}
                    >
                      <span className="text-sm font-bold text-muted-foreground w-8 text-center">#{l.rank}</span>
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-border/40 flex items-center justify-center text-xs font-bold text-foreground overflow-hidden shrink-0">
                        {l.avatar ? (
                          <img src={l.avatar} className="w-full h-full object-cover" alt="" />
                        ) : (
                          l.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{l.name}</p>
                        <p className="text-xs text-muted-foreground">{l.branch || "Student"} · Lv.{l.level}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold gradient-text">{l.xp.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">XP</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Rewards Store Tab */}
          {activeTab === "rewards" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="glass rounded-2xl p-4 border border-accent/20 mb-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent/15 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Your Balance: <span className="gradient-text font-bold">{gam?.xp.toLocaleString() || 0} XP</span></p>
                  <p className="text-xs text-muted-foreground">Spend XP to redeem coupons and rewards</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward, i) => {
                  const Icon = iconMap[reward.icon] || Gift;
                  const canAfford = gam && gam.xp >= reward.xp_cost;
                  const soldOut = reward.remaining_quantity !== null && reward.remaining_quantity <= 0;
                  return (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ y: -4 }}
                      className="glass rounded-2xl border border-border/30 hover:border-primary/30 transition-all overflow-hidden group"
                    >
                      <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <Badge className="bg-accent/15 text-accent border-accent/30 font-bold">
                            {reward.xp_cost} XP
                          </Badge>
                        </div>
                        <h3 className="font-display text-base font-bold text-foreground mb-1">{reward.title}</h3>
                        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{reward.description}</p>
                        {reward.remaining_quantity !== null && (
                          <p className="text-[10px] text-muted-foreground mb-3">
                            {reward.remaining_quantity} / {reward.total_quantity} remaining
                          </p>
                        )}
                        <Button
                          size="sm"
                          className="w-full glow-primary text-xs"
                          disabled={!canAfford || soldOut || redeemingId === reward.id}
                          onClick={() => handleRedeem(reward)}
                        >
                          {redeemingId === reward.id ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Redeeming...</>
                          ) : soldOut ? (
                            "Sold Out"
                          ) : !canAfford ? (
                            `Need ${reward.xp_cost - (gam?.xp || 0)} more XP`
                          ) : (
                            <><Gift className="h-3.5 w-3.5" /> Redeem</>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* My Rewards History Tab */}
          {activeTab === "history" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {redemptions.length === 0 ? (
                <div className="text-center py-16">
                  <Gift className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">No redemptions yet</h3>
                  <p className="text-sm text-muted-foreground">Earn XP and redeem awesome rewards!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {redemptions.map((red, i) => {
                    const reward = rewards.find((r: any) => r.id === red.reward_id);
                    const Icon = reward ? (iconMap[reward.icon] || Gift) : Gift;
                    return (
                      <motion.div
                        key={red.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-4 rounded-xl glass border border-border/30"
                      >
                        <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{reward?.title || "Reward"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(red.redeemed_at).toLocaleDateString()} · -{red.xp_spent} XP
                          </p>
                        </div>
                        {red.coupon_code && (
                          <Badge className="bg-green-500/15 text-green-400 border-green-500/30 font-mono text-xs">
                            {red.coupon_code}
                          </Badge>
                        )}
                        <Check className="h-4 w-4 text-green-400 shrink-0" />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gamification;
