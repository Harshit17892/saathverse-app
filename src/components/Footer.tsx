import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Github, Twitter, Mail, Heart, Zap, Globe, Layers, Rocket, Radio, Shield } from "lucide-react";
import saathverseLogo from "@/assets/saathverse-logo-new.png";

const navLinks = [
  { label: "Hackathons", to: "/hackathons", icon: Globe },
  { label: "Startups", to: "/startup", icon: Rocket },
  { label: "Clubs", to: "/clubs", icon: Layers },
  { label: "IEEE", to: "/ieee", icon: Radio },
  { label: "Alumni", to: "/alumni", icon: Shield },
];

const platformLinks = [
  { label: "Gamification", to: "/gamification" },
  { label: "Profile", to: "/profile" },
  { label: "Chat", to: "/chat" },
  { label: "Discover", to: "/discover" },
];

const Footer = () => {
  return (
    <footer className="relative border-t border-border/20 overflow-hidden">
      {/* Background effects - hidden on mobile for performance */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.02] via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] rounded-full bg-primary/3 blur-[200px] hidden md:block" />

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        {/* Main footer */}
        <div className="py-8 sm:py-12 md:py-16">
          {/* Mobile Layout */}
          <div className="md:hidden space-y-8">
            {/* Brand row */}
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 blur-md opacity-60" />
                <img src={saathverseLogo} alt="SaathVerse" className="relative h-9 w-9 rounded-xl object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-display text-base font-bold gradient-text">SaathVerse</span>
                <p className="text-[10px] text-muted-foreground -mt-0.5">Campus. Connected.</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">
                  Connect, collaborate, compete, and grow together.
                </p>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2.5">
              {[
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Github, href: "#", label: "GitHub" },
                { icon: Mail, href: "mailto:support@saathverse.com", label: "Email" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="h-9 w-9 rounded-xl glass border border-border/30 flex items-center justify-center text-muted-foreground active:scale-95 transition-transform"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Links grid - 3 columns on mobile */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-2.5">Explore</h4>
                <div className="space-y-2">
                  {navLinks.map((link) => (
                    <Link key={link.to} to={link.to} className="flex items-center gap-1.5 text-[11px] text-muted-foreground active:text-foreground transition-colors">
                      <link.icon className="h-3 w-3 text-primary/50" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-2.5">Platform</h4>
                <div className="space-y-2">
                  {platformLinks.map((link) => (
                    <Link key={link.to} to={link.to} className="block text-[11px] text-muted-foreground active:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-2.5">Legal</h4>
                <div className="space-y-2">
                  <Link to="/terms" className="block text-[11px] text-muted-foreground active:text-foreground transition-colors">Terms</Link>
                  <Link to="/privacy" className="block text-[11px] text-muted-foreground active:text-foreground transition-colors">Privacy</Link>
                  <a href="mailto:support@saathverse.com" className="block text-[11px] text-muted-foreground active:text-foreground transition-colors">Contact</a>
                </div>
                {/* Status */}
                <div className="mt-4 flex items-center gap-1.5">
                  <div className="relative">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <div className="absolute inset-0 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <span className="text-[9px] text-muted-foreground">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-12 gap-10">
            {/* Brand */}
            <div className="md:col-span-4 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 blur-md opacity-60" />
                  <img src={saathverseLogo} alt="SaathVerse" className="relative h-10 w-10 rounded-xl object-cover" />
                </div>
                <div>
                  <span className="font-display text-lg font-bold gradient-text">SaathVerse</span>
                  <p className="text-[10px] text-muted-foreground -mt-0.5">Campus. Connected.</p>
                </div>
              </motion.div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                The all-in-one campus platform for students to connect, collaborate, compete, and grow together.
              </p>
              <div className="flex items-center gap-3 pt-2">
                {[
                  { icon: Twitter, href: "#", label: "Twitter" },
                  { icon: Github, href: "#", label: "GitHub" },
                  { icon: Mail, href: "mailto:support@saathverse.com", label: "Email" },
                ].map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ y: -3, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="h-9 w-9 rounded-xl glass border border-border/30 hover:border-primary/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Explore</h4>
              <div className="space-y-2.5">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={link.to} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                      <link.icon className="h-3.5 w-3.5 text-primary/50 group-hover:text-primary transition-colors" />
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Platform</h4>
              <div className="space-y-2.5">
                {platformLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div className="md:col-span-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Legal</h4>
              <div className="space-y-2.5 mb-6">
                <Link to="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
                <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
                <a href="mailto:support@saathverse.com" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Us</a>
              </div>

              {/* Status indicator */}
              <div className="glass rounded-xl p-3 border border-border/20">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <span className="text-[11px] text-muted-foreground">All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/20 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            © {new Date().getFullYear()} SaathVerse. All rights reserved.
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1.5">
            Built with <Heart className="h-3 w-3 text-accent" /> for students
            <span className="text-primary">·</span>
            Powered by <Zap className="h-3 w-3 text-primary" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
