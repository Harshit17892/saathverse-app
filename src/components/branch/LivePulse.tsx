import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Briefcase, CalendarClock, ChevronLeft, ChevronRight, Flag, Plus, Rocket, ShieldCheck, Users, WandSparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Opportunity = {
  id: string;
  title: string;
  type: "internship" | "competition" | "scholarship" | "hackathon" | "event";
  deadline: string;
  mode: "Remote" | "Hybrid" | "On-site";
  ctaLabel: string;
  link: string;
  tags: string[];
};

type MatchRequest = {
  id: string;
  title: string;
  needed: string;
  urgency: "Low" | "Medium" | "High";
  scope: "This branch" | "All branches";
  postedBy: string;
  postedAt: string;
};

const typePill: Record<Opportunity["type"], string> = {
  internship: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30",
  competition: "bg-violet-500/15 text-violet-300 border-violet-400/30",
  scholarship: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  hackathon: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  event: "bg-pink-500/15 text-pink-300 border-pink-400/30",
};

const urgencyPill: Record<MatchRequest["urgency"], string> = {
  Low: "text-cyan-300 border-cyan-400/30 bg-cyan-500/10",
  Medium: "text-amber-300 border-amber-400/30 bg-amber-500/10",
  High: "text-rose-300 border-rose-400/30 bg-rose-500/10",
};

const allowedTypes: Opportunity["type"][] = ["internship", "competition", "scholarship", "hackathon", "event"];
const allowedModes: Opportunity["mode"][] = ["Remote", "Hybrid", "On-site"];
const allowedUrgency: MatchRequest["urgency"][] = ["Low", "Medium", "High"];

const toRelativeTime = (iso: string) => {
  const now = Date.now();
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "just now";
  const diffMin = Math.max(1, Math.floor((now - then) / 60000));
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
};

const formatDeadline = (value: string | null) => {
  if (!value) return "Open";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
};

const LivePulse = ({ branchSlug, branchLabel }: { branchSlug?: string; branchLabel?: string }) => {
  const { collegeId, user, profile } = useAuth();

  const [tab, setTab] = useState<"opportunities" | "matchmaker">("opportunities");
  const [showComposer, setShowComposer] = useState(false);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState({ title: "", needed: "", urgency: "Medium" as MatchRequest["urgency"], scope: "This branch" as MatchRequest["scope"] });
  const opportunitiesRef = useRef<HTMLDivElement | null>(null);
  const requestsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const resolveBranch = async () => {
      if (!collegeId || !branchSlug) {
        setBranchId(null);
        return;
      }

      const { data: bySlug } = await supabase
        .from("branches")
        .select("id")
        .eq("college_id", collegeId)
        .ilike("slug", `${branchSlug}%`)
        .maybeSingle();

      if (bySlug?.id) {
        setBranchId(bySlug.id);
        return;
      }

      if (!branchLabel) {
        setBranchId(null);
        return;
      }

      const { data: byName } = await supabase
        .from("branches")
        .select("id")
        .eq("college_id", collegeId)
        .eq("name", branchLabel)
        .maybeSingle();

      setBranchId(byName?.id || null);
    };

    resolveBranch();
  }, [collegeId, branchLabel, branchSlug]);

  const refreshBoard = useCallback(async () => {
    if (!collegeId) {
      setOpportunities([]);
      setRequests([]);
      return;
    }

    setLoading(true);

    let oppQuery = supabase
      .from("branch_opportunities")
      .select("id, title, opportunity_type, deadline, mode, cta_label, link, tags")
      .eq("college_id", collegeId)
      .eq("is_active", true)
      .order("deadline", { ascending: true })
      .order("created_at", { ascending: false });

    if (branchId) oppQuery = oppQuery.or(`branch_id.eq.${branchId},branch_id.is.null`);
    else oppQuery = oppQuery.is("branch_id", null);

    let reqQuery = supabase
      .from("branch_match_requests")
      .select("id, title, needed, urgency, scope, posted_by_name, created_at")
      .eq("college_id", collegeId)
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (branchId) reqQuery = reqQuery.or(`branch_id.eq.${branchId},branch_id.is.null`);
    else reqQuery = reqQuery.is("branch_id", null);

    const [{ data: oppRows, error: oppErr }, { data: reqRows, error: reqErr }] = await Promise.all([oppQuery, reqQuery]);

    if (oppErr) {
      console.error("[ActionBoard] opportunities fetch error:", oppErr);
      toast.error("Could not load opportunities");
    }

    if (reqErr) {
      console.error("[ActionBoard] requests fetch error:", reqErr);
      toast.error("Could not load match requests");
    }

    setOpportunities(
      (oppRows || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        type: allowedTypes.includes(r.opportunity_type) ? r.opportunity_type : "event",
        deadline: formatDeadline(r.deadline),
        mode: allowedModes.includes(r.mode) ? r.mode : "Remote",
        ctaLabel: r.cta_label || "Apply",
        link: r.link || "#",
        tags: Array.isArray(r.tags) ? r.tags : [],
      }))
    );

    setRequests(
      (reqRows || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        needed: r.needed,
        urgency: allowedUrgency.includes(r.urgency) ? r.urgency : "Medium",
        scope: r.scope === "All branches" ? "All branches" : "This branch",
        postedBy: r.posted_by_name || "Student",
        postedAt: toRelativeTime(r.created_at),
      }))
    );

    setLoading(false);
  }, [branchId, collegeId]);

  useEffect(() => {
    refreshBoard();
  }, [refreshBoard]);

  useEffect(() => {
    if (!collegeId) return;
    const channel = supabase
      .channel(`branch-action-board-${collegeId}-${branchId || "all"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "branch_opportunities", filter: `college_id=eq.${collegeId}` },
        () => refreshBoard()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "branch_match_requests", filter: `college_id=eq.${collegeId}` },
        () => refreshBoard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [branchId, collegeId, refreshBoard]);

  const scrollRail = (target: "opportunities" | "requests", dir: -1 | 1) => {
    const ref = target === "opportunities" ? opportunitiesRef : requestsRef;
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const submitRequest = () => {
    const post = async () => {
      const title = form.title.trim();
      const needed = form.needed.trim();
      if (!title || !needed) {
        toast.error("Please add title and skills needed");
        return;
      }

      if (!user) {
        toast.error("Please log in to post a request");
        return;
      }

      if (!collegeId) {
        toast.error("No active college selected");
        return;
      }

      if (form.scope === "This branch" && !branchId) {
        toast.error("Branch not resolved. Try again in a moment.");
        return;
      }

      setPosting(true);

      const { data, error } = await supabase
        .from("branch_match_requests")
        .insert({
          college_id: collegeId,
          branch_id: form.scope === "This branch" ? branchId : null,
          title,
          needed,
          urgency: form.urgency,
          scope: form.scope,
          posted_by: user.id,
          posted_by_name: profile?.full_name || user.email?.split("@")[0] || "You",
        })
        .select("id, title, needed, urgency, scope, posted_by_name, created_at")
        .single();

      if (error) {
        console.error("[ActionBoard] post request error:", error);
        toast.error(error.message || "Could not publish request");
        setPosting(false);
        return;
      }

      setRequests((prev) => [
        {
          id: data.id,
          title: data.title,
          needed: data.needed,
          urgency: allowedUrgency.includes(data.urgency as MatchRequest["urgency"]) ? (data.urgency as MatchRequest["urgency"]) : "Medium",
          scope: data.scope === "All branches" ? "All branches" : "This branch",
          postedBy: data.posted_by_name || "You",
          postedAt: toRelativeTime(data.created_at),
        },
        ...prev,
      ]);

      setForm({ title: "", needed: "", urgency: "Medium", scope: "This branch" });
      setShowComposer(false);
      setTab("matchmaker");
      setPosting(false);
      toast.success("Request published");
    };

    post();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/30 glass">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(34,211,238,0.11),transparent_35%),radial-gradient(circle_at_80%_15%,rgba(168,85,247,0.11),transparent_30%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

      <div className="relative px-5 pt-5 pb-3 flex items-center gap-2">
        <div className="h-8 w-8 rounded-xl border border-cyan-400/30 bg-cyan-500/10 flex items-center justify-center">
          <Rocket className="h-4 w-4 text-cyan-300" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Branch Action Board</p>
          <p className="text-[10px] text-muted-foreground">{branchLabel || "Branch"} · Live collaboration + curated opportunities</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-300 border border-emerald-400/20 bg-emerald-500/10 rounded-full px-2 py-1">
          <ShieldCheck className="h-3 w-3" />
          Auto-filter active
        </div>
      </div>

      <div className="relative px-5 pb-5">
        <div className="mb-4 p-1 rounded-xl border border-border/30 bg-background/30 flex gap-1">
          {[
            { key: "opportunities", label: "Opportunities", icon: Briefcase },
            { key: "matchmaker", label: "Matchmaker", icon: Users },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { setTab(item.key as "opportunities" | "matchmaker"); }}
                className={`flex-1 h-9 rounded-lg text-xs font-semibold transition-all border ${active ? "bg-cyan-500/15 border-cyan-400/30 text-cyan-200" : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" /> {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {tab === "opportunities" ? (
            <motion.div
              key="opportunities"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-2.5"
            >
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><CalendarClock className="h-3 w-3" /> Auto-refresh window: 6h</span>
                <div className="flex items-center gap-2">
                  <span>Source: database (college scoped)</span>
                  <button onClick={() => scrollRail("opportunities", -1)} className="h-6 w-6 rounded-md border border-border/30 hover:bg-secondary/50 inline-flex items-center justify-center"><ChevronLeft className="h-3.5 w-3.5" /></button>
                  <button onClick={() => scrollRail("opportunities", 1)} className="h-6 w-6 rounded-md border border-border/30 hover:bg-secondary/50 inline-flex items-center justify-center"><ChevronRight className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              <div ref={opportunitiesRef} className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {opportunities.map((item) => (
                  <div key={item.id} className="min-w-[290px] md:min-w-[340px] snap-start rounded-xl border border-border/30 bg-background/30 px-3.5 py-3">
                    <div className="flex items-start gap-2">
                      <div className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${typePill[item.type]}`}>{item.type}</div>
                      <div className="ml-auto text-[10px] text-amber-300 border border-amber-400/20 bg-amber-500/10 rounded-full px-2 py-0.5">Deadline: {item.deadline}</div>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-foreground leading-snug">{item.title}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border border-border/40 text-muted-foreground">{tag}</span>
                      ))}
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-primary/30 text-primary">{item.mode}</span>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="h-8 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-200 text-xs font-semibold inline-flex items-center">
                        {item.ctaLabel}
                      </a>
                      <button className="h-8 px-3 rounded-lg bg-secondary/40 hover:bg-secondary/60 border border-border/30 text-xs text-foreground transition-colors">
                        Save
                      </button>
                    </div>
                  </div>
                ))}
                {!loading && opportunities.length === 0 && (
                  <div className="min-w-full rounded-xl border border-dashed border-border/40 bg-background/20 px-4 py-8 text-center text-xs text-muted-foreground">
                    No opportunities added yet for this branch.
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="matchmaker"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">Live student asks and open bounties</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowComposer((v) => !v)}
                    className="h-8 px-3 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-400/30 text-violet-200 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Post Request
                  </button>
                  <button onClick={() => scrollRail("requests", -1)} className="h-6 w-6 rounded-md border border-border/30 hover:bg-secondary/50 inline-flex items-center justify-center"><ChevronLeft className="h-3.5 w-3.5" /></button>
                  <button onClick={() => scrollRail("requests", 1)} className="h-6 w-6 rounded-md border border-border/30 hover:bg-secondary/50 inline-flex items-center justify-center"><ChevronRight className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              <AnimatePresence>
                {showComposer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl border border-violet-400/25 bg-violet-500/10 p-3 space-y-2"
                  >
                    <input
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Need teammate for..."
                      className="w-full h-9 px-3 rounded-lg bg-background/40 border border-border/30 text-sm outline-none focus:border-violet-400/40"
                    />
                    <input
                      value={form.needed}
                      onChange={(e) => setForm((p) => ({ ...p, needed: e.target.value }))}
                      placeholder="Skills needed (e.g., UI + Docs)"
                      className="w-full h-9 px-3 rounded-lg bg-background/40 border border-border/30 text-sm outline-none focus:border-violet-400/40"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={form.urgency}
                        onChange={(e) => setForm((p) => ({ ...p, urgency: e.target.value as MatchRequest["urgency"] }))}
                        className="h-9 px-2 rounded-lg bg-background/40 border border-border/30 text-xs outline-none"
                      >
                        <option value="Low">Low urgency</option>
                        <option value="Medium">Medium urgency</option>
                        <option value="High">High urgency</option>
                      </select>
                      <select
                        value={form.scope}
                        onChange={(e) => setForm((p) => ({ ...p, scope: e.target.value as MatchRequest["scope"] }))}
                        className="h-9 px-2 rounded-lg bg-background/40 border border-border/30 text-xs outline-none"
                      >
                        <option value="This branch">This branch</option>
                        <option value="All branches">All branches</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={submitRequest} className="h-8 px-3 rounded-lg bg-violet-500/30 hover:bg-violet-500/40 border border-violet-300/30 text-xs font-semibold text-violet-100">
                        Publish
                      </button>
                      <button onClick={() => setShowComposer(false)} className="h-8 px-3 rounded-lg bg-secondary/40 border border-border/30 text-xs text-foreground">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={requestsRef} className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {requests.map((item) => (
                  <div key={item.id} className="min-w-[290px] md:min-w-[340px] snap-start rounded-xl border border-border/30 bg-background/30 px-3.5 py-3">
                    <div className="flex items-center gap-2">
                      <Flag className="h-3.5 w-3.5 text-violet-300" />
                      <p className="text-sm font-semibold text-foreground leading-snug">{item.title}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Need: {item.needed}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${urgencyPill[item.urgency]}`}>{item.urgency}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-border/40 text-muted-foreground">{item.scope}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{item.postedBy} · {item.postedAt}</span>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button className="h-8 px-3 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-400/30 text-violet-200 text-xs font-semibold">
                        Join
                      </button>
                      <button className="h-8 px-3 rounded-lg bg-secondary/40 hover:bg-secondary/60 border border-border/30 text-xs text-foreground">
                        Message
                      </button>
                    </div>
                  </div>
                ))}
                {!loading && requests.length === 0 && (
                  <div className="min-w-full rounded-xl border border-dashed border-border/40 bg-background/20 px-4 py-8 text-center text-xs text-muted-foreground">
                    No active requests yet. Be the first to post.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 text-[10px] text-muted-foreground/90 flex items-center gap-1.5">
          <WandSparkles className="h-3 w-3 text-primary" />
          Live mode: connected to database with college-wise tenant filtering.
        </div>
      </div>
    </div>
  );
};

export default LivePulse;
