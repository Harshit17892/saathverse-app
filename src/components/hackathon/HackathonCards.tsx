import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Calendar, Users, MapPin, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Hackathon {
  id: number;
  title: string;
  tagline: string;
  date: string;
  location: string;
  participants: number;
  maxParticipants: number;
  prize: string;
  status: "open" | "upcoming" | "full";
  tags: string[];
  gradient: string;
  icon: React.ComponentType<{ className?: string }>;
  link?: string | null;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  open: { label: "Open", class: "bg-green-500/10 text-green-400 border-green-500/20" },
  upcoming: { label: "Coming Soon", class: "bg-accent/10 text-accent border-accent/20" },
  full: { label: "Full", class: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const HackathonCards = ({ hackathons }: { hackathons: Hackathon[] }) => (
  <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <AnimatePresence mode="popLayout">
      {hackathons.map((hack, i) => (
        <motion.div
          key={hack.id}
          layout
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ delay: i * 0.08 }}
          whileHover={{ y: -8, transition: { duration: 0.3 } }}
          className="glass rounded-2xl overflow-hidden group cursor-pointer border border-border/30 hover:border-primary/30 transition-colors"
          onClick={() => {
            if (hack.link) window.open(hack.link, "_blank", "noopener,noreferrer");
          }}
        >
          <div className={`h-1.5 bg-gradient-to-r ${hack.gradient}`} />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border/30 flex items-center justify-center"
              >
                <hack.icon className="h-6 w-6 text-primary" />
              </motion.div>
              <Badge className={`text-[10px] border ${statusConfig[hack.status].class} bg-transparent`}>
                {statusConfig[hack.status].label}
              </Badge>
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
              {hack.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{hack.tagline}</p>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {hack.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground border border-border/30">
                  {tag}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary/60" />
                {hack.date}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary/60" />
                {hack.location}
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary/60" />
                {hack.participants}/{hack.maxParticipants}
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-accent/80" />
                <span className="font-semibold text-accent">{hack.prize}</span>
              </div>
            </div>
            <div className="mb-4">
              <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${hack.gradient}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(hack.participants / hack.maxParticipants) * 100}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {hack.maxParticipants - hack.participants} spots left
              </p>
            </div>
            <Button
              disabled={hack.status === "full"}
              className={`w-full group/btn ${hack.status === "full" ? "opacity-50" : "glow-primary"}`}
              onClick={() => {
                if (hack.link) {
                  window.open(hack.link, "_blank", "noopener,noreferrer");
                }
              }}
            >
              {hack.status === "full" ? "Waitlist" : hack.status === "upcoming" ? "Notify Me" : "Register Now"}
              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  </motion.div>
);

export default HackathonCards;
