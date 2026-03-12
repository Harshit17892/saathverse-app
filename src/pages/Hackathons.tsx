import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Zap, Cpu, Globe, Sparkles, Star, Filter, UserPlus, Search as SearchIcon, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import HackathonCards from "@/components/hackathon/HackathonCards";
import HackathonCarousel from "@/components/hackathon/HackathonCarousel";
import CreateTeamModal from "@/components/hackathon/CreateTeamModal";
import FindTeamSection from "@/components/hackathon/FindTeamSection";
import MyTeamsSection from "@/components/hackathon/MyTeamsSection";
import { Button } from "@/components/ui/button";
import { useHackathons } from "@/hooks/use-supabase-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  globe: Globe, cpu: Cpu, sparkles: Sparkles, zap: Zap, star: Star, trophy: Trophy,
};

const hackFilters = ["All", "Open", "Upcoming", "Full"];
const mainTabs = [
  { id: "hackathons", label: "Hackathons", icon: Trophy },
  { id: "create", label: "Create Team", icon: UserPlus },
  { id: "find", label: "Find a Team", icon: SearchIcon },
  { id: "myteams", label: "My Teams", icon: Shield },
];

const HexGrid = () => (
  <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute border border-foreground rounded-lg"
        style={{
          width: 80 + Math.random() * 60,
          height: 80 + Math.random() * 60,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          rotate: `${Math.random() * 45}deg`,
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 30 + Math.random() * 20, repeat: Infinity, ease: "linear" }}
      />
    ))}
  </div>
);

const Hackathons = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("hackathons");
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const { data: dbHackathons = [], isLoading } = useHackathons();

  // Map DB data to component format
  const hackathons = dbHackathons.map((h: any) => ({
    id: h.id,
    title: h.title,
    tagline: h.tagline || "",
    date: h.date || "TBA",
    location: h.location || "TBA",
    participants: h.participants || 0,
    maxParticipants: h.max_participants || 100,
    prize: h.prize || "-",
    status: (h.status === "open" || h.status === "upcoming" || h.status === "full") ? h.status : "upcoming" as const,
    tags: h.tags || [],
    gradient: h.gradient || "from-primary to-purple-400",
    icon: iconMap[h.icon || "globe"] || Globe,
    link: h.link || null,
  }));

  const filtered = hackathons.filter((h: any) =>
    activeFilter === "All" ? true : h.status === activeFilter.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      <HexGrid />
      <div className="absolute top-40 left-10 w-[400px] h-[400px] rounded-full bg-primary/8 blur-[150px]" />
      <div className="absolute bottom-20 right-10 w-[350px] h-[350px] rounded-full bg-accent/8 blur-[150px]" />

      <div className="relative z-10 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6"
            >
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">Hackathon Hub</span>
            </motion.div>
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-foreground mb-3 sm:mb-4">
              Build. <span className="gradient-text">Compete.</span> Win.
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg">
              Join hackathons, find teammates, and turn your ideas into reality.
            </p>

            {/* 3D Trophy */}
            <motion.div className="mt-6 sm:mt-10 mx-auto w-24 h-24 sm:w-32 sm:h-32 relative hidden sm:block" style={{ perspective: 800 }}>
              <motion.div
                className="w-full h-full rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center glow-primary"
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <Trophy className="h-12 w-12 text-primary" />
              </motion.div>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute h-2 w-2 rounded-full bg-accent"
                  style={{ top: "50%", left: "50%" }}
                  animate={{
                    x: [0, Math.cos((i * 2 * Math.PI) / 3) * 80, 0],
                    y: [0, Math.sin((i * 2 * Math.PI) / 3) * 80, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{ duration: 3, delay: i * 1, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Hackathon Carousel */}
          <HackathonCarousel />

          {/* Main Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-center justify-center mb-8"
          >
            <div className="grid grid-cols-2 sm:inline-flex sm:items-center gap-2 sm:gap-2 p-1.5 rounded-2xl glass border border-border/30 w-full sm:w-auto">
              {mainTabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (tab.id === "create") {
                      setCreateTeamOpen(true);
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
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
          </motion.div>

          {/* Tab: Hackathons */}
          {activeTab === "hackathons" && (
            <>
              {/* Sub-filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 mb-10"
              >
                <Filter className="h-4 w-4 text-muted-foreground mr-2" />
                {hackFilters.map((f) => (
                  <motion.button
                    key={f}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeFilter === f
                        ? "bg-primary text-primary-foreground glow-primary"
                        : "glass text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </motion.button>
                ))}
              </motion.div>

              {isLoading ? (
                <div className="text-center py-20">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Zap className="h-8 w-8 text-primary mx-auto" />
                  </motion.div>
                  <p className="text-muted-foreground mt-4">Loading hackathons...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">No hackathons yet</h3>
                  <p className="text-muted-foreground">Check back soon for exciting competitions!</p>
                </div>
              ) : (
                <HackathonCards hackathons={filtered} />
              )}
            </>
          )}

          {/* Tab: Find a Team */}
          {activeTab === "find" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">Find a Team</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Browse open teams looking for members</p>
                </div>
                <Button size="sm" onClick={() => setCreateTeamOpen(true)} className="glow-primary w-full sm:w-auto">
                  <UserPlus className="h-4 w-4" /> Create Your Own
                </Button>
              </div>
              <FindTeamSection />
            </motion.div>
          )}

          {/* Tab: My Teams */}
          {activeTab === "myteams" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground">My Teams</h2>
                <p className="text-sm text-muted-foreground">Manage your teams and review join requests</p>
              </div>
              <MyTeamsSection />
            </motion.div>
          )}

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 glass rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            {[
              { label: "Active Hackathons", value: String(hackathons.filter((h: any) => h.status === "open").length || 0), icon: Trophy },
              { label: "Participants", value: `${hackathons.reduce((a: number, h: any) => a + h.participants, 0)}+`, icon: Users },
              { label: "Total Hackathons", value: String(hackathons.length), icon: Zap },
              { label: "Spots Available", value: `${hackathons.reduce((a: number, h: any) => a + (h.maxParticipants - h.participants), 0)}`, icon: Cpu },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="font-display text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={createTeamOpen}
        onClose={() => setCreateTeamOpen(false)}
        onTeamCreated={() => {
          setActiveTab("find");
        }}
      />
    </div>
  );
};

export default Hackathons;
