import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Search, Users, Rocket, GraduationCap, Brain, Trophy, Zap } from "lucide-react";
import { useRef, MouseEvent } from "react";

/* ── 3D Tilt Card ── */
const TiltCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouse = (e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative group cursor-default ${className}`}
    >
      {children}
    </motion.div>
  );
};

const features = [
  {
    icon: Search,
    label: "Student Search",
    title: "Find anyone on campus",
    desc: "Search by name, skills, branch — instantly connect with the right people.",
    gradient: "from-primary/20 to-primary/5",
    span: "col-span-1 sm:col-span-2 row-span-1",
  },
  {
    icon: Trophy,
    label: "Hackathons",
    title: "Build winning teams",
    desc: "Discover hackathons, form teams with complementary skills.",
    gradient: "from-accent/20 to-accent/5",
    span: "col-span-1 row-span-1",
  },
  {
    icon: Rocket,
    label: "Startups",
    title: "Launch with AI scoring",
    desc: "Submit your idea, get AI-powered feasibility analysis before pitching.",
    gradient: "from-primary/15 to-accent/10",
    span: "col-span-1 row-span-2",
  },
  {
    icon: Users,
    label: "Clubs",
    title: "Join & manage clubs",
    desc: "Events, registrations, member management — all in one dashboard.",
    gradient: "from-accent/15 to-primary/10",
    span: "col-span-1 row-span-1",
  },
  {
    icon: GraduationCap,
    label: "Alumni Network",
    title: "Connect with alumni",
    desc: "Find mentors, explore career paths from verified graduates.",
    gradient: "from-primary/20 to-transparent",
    span: "col-span-1 row-span-1",
  },
  {
    icon: Brain,
    label: "IEEE & Research",
    title: "Research hub",
    desc: "Find conferences, papers, and research collaborators on campus.",
    gradient: "from-accent/20 to-transparent",
    span: "col-span-1 sm:col-span-2 row-span-1",
  },
];

const LandingFeatures = () => {
  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/[0.03] blur-[200px] rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 sm:mb-20"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
          >
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary tracking-wider uppercase">Features</span>
          </motion.div>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
            Everything Your{" "}
            <span className="gradient-text">Campus Needs</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            From finding teammates to launching startups — one platform, zero friction.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5" style={{ perspective: "1200px" }}>
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 40, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={f.span}
            >
              <TiltCard className="h-full">
                <div className={`relative h-full rounded-2xl border border-border/40 bg-gradient-to-br ${f.gradient} backdrop-blur-sm p-6 sm:p-8 overflow-hidden transition-all duration-500 group-hover:border-primary/30`}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-primary/[0.08] to-transparent" />

                  <motion.div
                    className="relative z-10 w-12 h-12 rounded-xl bg-card/80 border border-border/30 flex items-center justify-center mb-4"
                    style={{ transform: "translateZ(30px)" }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <f.icon className="w-5 h-5 text-accent" />
                  </motion.div>

                  <span className="relative z-10 text-[10px] font-bold text-primary uppercase tracking-widest">{f.label}</span>
                  <h3 className="relative z-10 font-display text-lg sm:text-xl font-bold text-foreground mt-2 mb-2">{f.title}</h3>
                  <p className="relative z-10 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>

                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-primary/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
