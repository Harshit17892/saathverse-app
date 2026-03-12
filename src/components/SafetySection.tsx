import { motion } from "framer-motion";
import { Shield, Lock, EyeOff, MessageCircle, Users, Brain, FileText, Award } from "lucide-react";

const safetyFeatures = [
  {
    icon: Lock,
    title: "End-to-End Chats",
    desc: "Private conversations that stay private. Your messages are secured and only visible to you and the recipient.",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: EyeOff,
    title: "Girls Can Hide Photos",
    desc: "Female students can choose to hide their profile pictures for extra privacy and safety on the platform.",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    icon: Users,
    title: "Create Teams Safely",
    desc: "Form hackathon teams, startup groups, and club squads with verified campus students only.",
    gradient: "from-primary/15 to-accent/10",
  },
  {
    icon: Brain,
    title: "AI Startup Scoring",
    desc: "Get your startup idea scored by AI — clarity, feasibility, market potential — before pitching to anyone.",
    gradient: "from-accent/15 to-primary/10",
  },
  {
    icon: FileText,
    title: "Research & Conferences",
    desc: "Discover IEEE conferences, find research papers, and connect with academic communities on campus.",
    gradient: "from-primary/20 to-accent/5",
  },
  {
    icon: Award,
    title: "College Verified",
    desc: "Every account is verified with a college email. No outsiders, no spam — just your campus community.",
    gradient: "from-accent/20 to-primary/5",
  },
];

const SafetySection = () => {
  return (
    <section className="py-16 sm:py-28 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[900px] h-[500px] sm:h-[900px] rounded-full bg-primary/3 blur-[200px]" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-semibold text-accent uppercase tracking-widest mb-6 border border-accent/20"
          >
            <Shield className="h-3.5 w-3.5" />
            Safe & Secure
          </motion.span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-4 sm:mb-5">
            Your Privacy,{" "}
            <span className="gradient-text">Our Priority</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-lg px-2">
            Built with safety-first design. Every feature is crafted to protect students while keeping the experience seamless.
          </p>
        </motion.div>

        {/* Safety cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {safetyFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group cursor-pointer"
            >
              <div className={`relative bg-gradient-to-br ${f.gradient} rounded-2xl p-5 sm:p-7 border border-border/30 backdrop-blur-sm h-full group-hover:border-primary/30 transition-all duration-300`}>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-card/80 flex items-center justify-center border border-border/50 mb-4 sm:mb-5 group-hover:border-primary/30 transition-colors">
                  <f.icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-16 glass rounded-2xl p-6 sm:p-8 border border-primary/15 text-center"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-foreground">100% Private</div>
                <div className="text-[10px] text-muted-foreground">No data shared</div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-border" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/15 flex items-center justify-center">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-foreground">Campus Only</div>
                <div className="text-[10px] text-muted-foreground">Verified students</div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-border" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-foreground">Secure Chat</div>
                <div className="text-[10px] text-muted-foreground">End-to-end</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SafetySection;
