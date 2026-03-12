import { motion } from "framer-motion";
import { ArrowUpRight, Globe, Rocket, Layers, Gift } from "lucide-react";

const cards = [
  { title: "IEEE", desc: "Research Made Easy", tag: "PROFESSIONAL ORG", icon: Globe, gradient: "from-primary/25 to-primary/5" },
  { title: "STARTUPS", desc: "Lets Make New", tag: "ENTREPRENEURSHIP", icon: Rocket, gradient: "from-accent/25 to-accent/5" },
  { title: "CLUBS", desc: "Join your tribe", tag: "COLLEGE CLUBS", icon: Layers, gradient: "from-primary/20 to-accent/10" },
  { title: "Student Benefits", desc: "Use it in a Best form", tag: "GENERAL", icon: Gift, gradient: "from-accent/20 to-primary/10" },
];

const ResourcesSection = () => {
  return (
    <section className="py-20 sm:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
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
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Resources
          </motion.span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-5">
            More to <span className="gradient-text">Explore</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -10, scale: 1.03 }}
              className="relative group cursor-pointer"
            >
              <div className={`relative bg-gradient-to-br ${card.gradient} rounded-xl sm:rounded-2xl overflow-hidden border border-border/30 group-hover:border-primary/30 transition-all h-full`}>
                <div className="h-24 sm:h-36 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
                  <card.icon className="h-8 w-8 sm:h-12 sm:w-12 text-foreground/20 group-hover:text-foreground/40 transition-colors" />
                </div>
                <div className="p-3 sm:p-5 relative">
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider gradient-text">{card.tag}</span>
                    <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground/30 group-hover:text-foreground transition-all" />
                  </div>
                  <h3 className="font-display text-sm sm:text-lg font-bold text-foreground mb-0.5 sm:mb-1">{card.title}</h3>
                  <p className="text-[10px] sm:text-sm text-muted-foreground">{card.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
