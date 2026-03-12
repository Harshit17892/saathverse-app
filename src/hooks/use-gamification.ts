import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GamificationData {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalLogins: number;
  xpToNextLevel: number;
  levelProgress: number;
}

export const useGamification = () => {
  const { user } = useAuth();
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  const calcXpForLevel = (level: number) => ((level - 1) * (level - 1)) * 100;
  const calcNextLevelXp = (level: number) => (level * level) * 100;

  const fetchData = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data: gam } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (gam) {
        const nextXp = calcNextLevelXp(gam.level);
        const currentLevelXp = calcXpForLevel(gam.level);
        const progress = Math.min(100, ((gam.xp - currentLevelXp) / (nextXp - currentLevelXp)) * 100);
        setData({
          xp: gam.xp,
          level: gam.level,
          currentStreak: gam.current_streak,
          longestStreak: gam.longest_streak,
          totalLogins: gam.total_logins,
          xpToNextLevel: nextXp - gam.xp,
          levelProgress: Math.max(0, progress),
        });
      } else {
        setData({ xp: 0, level: 1, currentStreak: 0, longestStreak: 0, totalLogins: 0, xpToNextLevel: 100, levelProgress: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkStreak = async () => {
    if (!user) return;
    try {
      const { data: result } = await supabase.rpc("update_login_streak", { _user_id: user.id });
      if (result && result[0]?.xp_earned > 0) {
        fetchData();
        return result[0];
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const awardXp = async (amount: number, action: string, description?: string) => {
    if (!user) return;
    try {
      await supabase.rpc("award_xp", {
        _user_id: user.id,
        _amount: amount,
        _action: action,
        _description: description || null,
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  return { data, loading, checkStreak, awardXp, refetch: fetchData };
};

export const useLeaderboard = (limit = 20) => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("user_gamification")
        .select("user_id, xp, level, current_streak, longest_streak")
        .order("xp", { ascending: false })
        .limit(limit);

      if (data) {
        const userIds = data.map((d: any) => d.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, photo_url, branch")
          .in("user_id", userIds.length ? userIds : ["_none_"]);

        const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
        setLeaders(data.map((d: any, i: number) => ({
          rank: i + 1,
          ...d,
          name: profileMap.get(d.user_id)?.full_name || "Unknown",
          avatar: profileMap.get(d.user_id)?.photo_url || null,
          branch: profileMap.get(d.user_id)?.branch || null,
        })));
      }
      setLoading(false);
    };
    fetch();
  }, [limit]);

  return { leaders, loading };
};

export const useRewards = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const [{ data: rew }, { data: red }] = await Promise.all([
      supabase.from("rewards").select("*").eq("is_active", true).order("xp_cost"),
      user
        ? supabase.from("reward_redemptions").select("*").eq("user_id", user.id).order("redeemed_at", { ascending: false })
        : Promise.resolve({ data: [] }),
    ]);
    setRewards(rew || []);
    setRedemptions(red || []);
    setLoading(false);
  };

  const redeem = async (rewardId: string, xpCost: number) => {
    if (!user) return { error: "Not logged in" };
    
    // Insert redemption
    const { error } = await supabase.from("reward_redemptions").insert({
      user_id: user.id,
      reward_id: rewardId,
      xp_spent: xpCost,
    });
    if (error) return { error: error.message };

    // Deduct XP
    await supabase.rpc("award_xp", {
      _user_id: user.id,
      _amount: -xpCost,
      _action: "reward_redeem",
      _description: "Redeemed reward",
    });

    // Decrease remaining quantity
    await supabase.from("rewards")
      .update({ remaining_quantity: supabase.rpc as any })
      .eq("id", rewardId);

    fetch();
    return { error: null };
  };

  useEffect(() => { fetch(); }, [user]);

  return { rewards, redemptions, loading, redeem, refetch: fetch };
};
