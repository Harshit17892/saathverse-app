import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Briefcase, CalendarClock, Flag, Plus, Rocket, ShieldCheck, Users, WandSparkles } from "lucide-react";

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

const branchData: Record<string, { opportunities: Opportunity[]; requests: MatchRequest[] }> = {
  "engineering-technology": {
    opportunities: [
      { id: "op-eng-1", title: "Frontend Internship Sprint", type: "internship", deadline: "Apr 05", mode: "Remote", ctaLabel: "Apply", link: "#", tags: ["React", "UI"] },
      { id: "op-eng-2", title: "National AI Challenge 2026", type: "competition", deadline: "Apr 12", mode: "Hybrid", ctaLabel: "Register", link: "#", tags: ["AI", "Team"] },
      { id: "op-eng-3", title: "Web3 Buildathon", type: "hackathon", deadline: "Apr 20", mode: "On-site", ctaLabel: "Join", link: "#", tags: ["Solidity", "Pitch"] },
      { id: "op-eng-4", title: "Cloud Foundations Scholarship", type: "scholarship", deadline: "Apr 28", mode: "Remote", ctaLabel: "Apply", link: "#", tags: ["Cloud", "Certificate"] },
    ],
    requests: [
      { id: "rq-eng-1", title: "Need UI teammate for hackathon MVP", needed: "Figma + Tailwind", urgency: "High", scope: "This branch", postedBy: "Aarav", postedAt: "2m ago" },
      { id: "rq-eng-2", title: "Looking for ML partner for healthcare model", needed: "Python + Sklearn", urgency: "Medium", scope: "All branches", postedBy: "Priyanshi", postedAt: "8m ago" },
      { id: "rq-eng-3", title: "Open bounty: mobile app test automation", needed: "Appium / Detox", urgency: "Low", scope: "This branch", postedBy: "Club Tech Team", postedAt: "14m ago" },
    ],
  },
  medical: {
    opportunities: [
      { id: "op-med-1", title: "Clinical Research Internship", type: "internship", deadline: "Apr 09", mode: "On-site", ctaLabel: "Apply", link: "#", tags: ["Clinical", "Research"] },
      { id: "op-med-2", title: "Public Health Innovation Grant", type: "scholarship", deadline: "Apr 16", mode: "Hybrid", ctaLabel: "Apply", link: "#", tags: ["Grant", "Public Health"] },
      { id: "op-med-3", title: "Bioinformatics Mini Hackathon", type: "hackathon", deadline: "Apr 24", mode: "Remote", ctaLabel: "Join", link: "#", tags: ["Genomics", "Data"] },
    ],
    requests: [
      { id: "rq-med-1", title: "Need teammate for case presentation", needed: "Diagnostics + PPT", urgency: "High", scope: "This branch", postedBy: "Mehak", postedAt: "3m ago" },
      { id: "rq-med-2", title: "Looking for mentor: USMLE planning", needed: "Roadmap guidance", urgency: "Medium", scope: "All branches", postedBy: "Rudra", postedAt: "11m ago" },
    ],
  },
  default: {
    opportunities: [
      { id: "op-def-1", title: "Campus Innovation Fellowship", type: "internship", deadline: "Apr 08", mode: "Hybrid", ctaLabel: "Apply", link: "#", tags: ["Innovation", "Mentorship"] },
      { id: "op-def-2", title: "Inter-College Mega Challenge", type: "competition", deadline: "Apr 15", mode: "On-site", ctaLabel: "Register", link: "#", tags: ["Team", "Prize"] },
      { id: "op-def-3", title: "Student Builder Scholarship", type: "scholarship", deadline: "Apr 30", mode: "Remote", ctaLabel: "Apply", link: "#", tags: ["Scholarship", "Merit"] },
    ],
    requests: [
      { id: "rq-def-1", title: "Looking for teammate for branch project", needed: "Research + Execution", urgency: "Medium", scope: "This branch", postedBy: "Student", postedAt: "4m ago" },
      { id: "rq-def-2", title: "Open bounty: content + design support", needed: "Canva / Docs", urgency: "Low", scope: "All branches", postedBy: "Community Team", postedAt: "16m ago" },
    ],
  },
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

const LivePulse = ({ branchSlug, branchLabel }: { branchSlug?: string; branchLabel?: string }) => {
  const key = (branchSlug || "").replace(/-[a-f0-9]{8}$/i, "");
  const seed = useMemo(() => branchData[key] || branchData.default, [key]);

  const [tab, setTab] = useState<"opportunities" | "matchmaker">("opportunities");
  const [showComposer, setShowComposer] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [requests, setRequests] = useState<MatchRequest[]>(seed.requests);
  const [form, setForm] = useState({ title: "", needed: "", urgency: "Medium" as MatchRequest["urgency"], scope: "This branch" as MatchRequest["scope"] });

  useEffect(() => {
    setRequests(seed.requests);
    setShowAll(false);
  }, [seed]);

  const visibleOpportunities = showAll ? seed.opportunities : seed.opportunities.slice(0, 3);
  const visibleRequests = showAll ? requests : requests.slice(0, 3);

  const submitRequest = () => {
    const title = form.title.trim();
    const needed = form.needed.trim();
    if (!title || !needed) return;

    const item: MatchRequest = {
      id: `rq-local-${Date.now()}`,
      title,
      needed,
      urgency: form.urgency,
      scope: form.scope,
      postedBy: "You",
      postedAt: "just now",
    };
    setRequests((prev) => [item, ...prev]);
    setForm({ title: "", needed: "", urgency: "Medium", scope: "This branch" });
    setShowComposer(false);
    setTab("matchmaker");
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
                onClick={() => { setTab(item.key as "opportunities" | "matchmaker"); setShowAll(false); }}
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
                <span>Source: trusted feed + campus updates</span>
              </div>

              {visibleOpportunities.map((item) => (
                <div key={item.id} className="rounded-xl border border-border/30 bg-background/30 px-3.5 py-3">
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

              {seed.opportunities.length > 3 && (
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="w-full h-8 rounded-lg border border-border/30 text-xs text-primary hover:bg-primary/10 transition-colors"
                >
                  {showAll ? "Show less" : `Show ${seed.opportunities.length - 3} more opportunities`}
                </button>
              )}
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
                <button
                  onClick={() => setShowComposer((v) => !v)}
                  className="h-8 px-3 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-400/30 text-violet-200 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Post Request
                </button>
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

              {visibleRequests.map((item) => (
                <div key={item.id} className="rounded-xl border border-border/30 bg-background/30 px-3.5 py-3">
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

              {requests.length > 3 && (
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="w-full h-8 rounded-lg border border-border/30 text-xs text-primary hover:bg-primary/10 transition-colors"
                >
                  {showAll ? "Show less" : `Show ${requests.length - 3} more requests`}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 text-[10px] text-muted-foreground/90 flex items-center gap-1.5">
          <WandSparkles className="h-3 w-3 text-primary" />
          MVP mode: local post preview only. No database write yet.
        </div>
      </div>
    </div>
  );
};

export default LivePulse;
