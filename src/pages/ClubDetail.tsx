import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Calendar, MapPin, Clock, ArrowLeft,
  Instagram, Linkedin, Star, Send, Check, Loader2,
  Info, UserPlus, Ticket, MessageSquare, Pin
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useClubBySlug } from "@/hooks/use-supabase-data";
import { categoryColors } from "@/data/clubsData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type TabType = "about" | "members" | "events" | "posts";

const roleColors: Record<string, string> = {
  President: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Vice President": "bg-gray-400/20 text-gray-300 border-gray-400/30",
  Secretary: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  default: "bg-primary/20 text-primary border-primary/30",
};

const ClubDetail = () => {
  const { clubSlug } = useParams();
  const { data: club, isLoading } = useClubBySlug(clubSlug);
  const { user, profile, collegeId } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>("about");
  const [members, setMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [joinStatus, setJoinStatus] = useState<"none" | "pending" | "member">("none");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
  const [showPayModal, setShowPayModal] = useState<any>(null);

  // Fetch membership status
  useEffect(() => {
    if (!club?.id || !user) return;
    const checkStatus = async () => {
      const { data: memberRow } = await supabase
        .from("club_members")
        .select("id")
        .eq("club_id", club.id)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();
      if (memberRow) { setJoinStatus("member"); return; }

      const { data: reqRow } = await supabase
        .from("club_join_requests")
        .select("id, status")
        .eq("club_id", club.id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (reqRow?.status === "pending") setJoinStatus("pending");
      else setJoinStatus("none");
    };
    checkStatus();
  }, [club?.id, user]);

  // Fetch members
  useEffect(() => {
    if (!club?.id) return;
    supabase
      .from("club_members")
      .select("*")
      .eq("club_id", club.id)
      .eq("is_active", true)
      .then(({ data }) => setMembers(data || []));
  }, [club?.id]);

  // Fetch events
  useEffect(() => {
    if (!club?.id) return;
    supabase
      .from("club_events")
      .select("*")
      .eq("club_id", club.id)
      .eq("is_active", true)
      .order("date", { ascending: true })
      .then(({ data }) => setEvents(data || []));
  }, [club?.id]);

  // Fetch user's registrations
  useEffect(() => {
    if (!club?.id || !user) return;
    supabase
      .from("club_event_registrations")
      .select("event_id")
      .eq("club_id", club.id)
      .eq("user_id", user.id)
      .then(({ data }) => {
        setRegisteredEvents(new Set((data || []).map((r: any) => r.event_id)));
      });
  }, [club?.id, user]);

  const handleJoinRequest = async () => {
    if (!user || !club || !profile) return;
    setSubmitting(true);
    const { error } = await supabase.from("club_join_requests").insert({
      club_id: club.id,
      user_id: user.id,
      student_name: profile.full_name || "Unknown",
      message: joinMessage || null,
      college_id: collegeId,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setJoinStatus("pending");
      setShowJoinModal(false);
      setJoinMessage("");
      toast({ title: "Request sent!", description: "The club leader will review it." });
    }
  };

  const handleRegister = async (event: any) => {
    if (!user || !club || !profile) return;
    if (event.is_free) {
      const { error } = await supabase.from("club_event_registrations").insert({
        event_id: event.id,
        club_id: club.id,
        user_id: user.id,
        student_name: profile.full_name || "Unknown",
        paid: true,
        payment_mode: "free",
        college_id: collegeId,
      });
      if (!error) {
        setRegisteredEvents(prev => new Set([...prev, event.id]));
        toast({ title: "Registered!", description: `You're in for ${event.name}` });
      }
    } else {
      setShowPayModal(event);
    }
  };

  const handlePaidRegister = async (mode: "at_venue" | "online") => {
    if (!user || !club || !profile || !showPayModal) return;
    if (mode === "online") {
      toast({ title: "Coming Soon", description: "Online payment will be available soon." });
      return;
    }
    const { error } = await supabase.from("club_event_registrations").insert({
      event_id: showPayModal.id,
      club_id: club.id,
      user_id: user.id,
      student_name: profile.full_name || "Unknown",
      paid: false,
      payment_mode: "at_venue",
      college_id: collegeId,
    });
    if (!error) {
      setRegisteredEvents(prev => new Set([...prev, showPayModal.id]));
      setShowPayModal(null);
      toast({ title: "Registered!", description: "Pay at the venue on event day." });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Users className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center mt-20">
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">Club Not Found</h1>
          <Link to="/clubs" className="text-accent hover:underline">← Back to Clubs</Link>
        </div>
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: any; count?: number }[] = [
    { key: "about", label: "About", icon: Info },
    { key: "members", label: "Members", icon: Users, count: members.length },
    { key: "events", label: "Events", icon: Calendar, count: events.length },
    { key: "posts", label: "Posts", icon: MessageSquare },
  ];

  const upcomingEvents = events.filter(e => !e.date || new Date(e.date) >= new Date());
  const pastEvents = events.filter(e => e.date && new Date(e.date) < new Date());

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* BANNER */}
      <section className="relative pt-20 overflow-hidden">
        <div className={`h-64 md:h-80 bg-gradient-to-br ${club.banner_gradient || "from-blue-600/40 to-primary/30"} relative`}>
          <div className="absolute inset-0 bg-background/30" />
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10 -mt-20">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-6px] rounded-full border-2 border-dashed border-accent/40" />
              <div className="w-24 h-24 rounded-full bg-card border-2 border-accent/60 flex items-center justify-center shadow-[0_0_40px_hsl(var(--accent)/0.3)]">
                <span className="font-display text-4xl font-bold text-foreground">{club.logo_letter || club.name?.charAt(0)}</span>
              </div>
            </div>

            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2">{club.name}</h1>
            <p className="text-muted-foreground text-lg mb-4">{club.tagline}</p>

            <div className="flex items-center gap-8 mb-6 text-sm">
              <div className="text-center">
                <span className="font-display text-xl font-bold text-foreground">{members.length || club.members || 0}</span>
                <p className="text-muted-foreground text-xs">Members</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <span className="font-display text-xl font-bold text-foreground">{club.founded || "—"}</span>
                <p className="text-muted-foreground text-xs">Founded</p>
              </div>
              {club.category && (
                <>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <span className="font-display text-xl font-bold text-foreground">{club.category}</span>
                    <p className="text-muted-foreground text-xs">Category</p>
                  </div>
                </>
              )}
            </div>

            {/* Join Button */}
            <div className="flex gap-3">
              {!user ? (
                <Link to="/signup">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm">
                    Login to Join
                  </motion.button>
                </Link>
              ) : joinStatus === "member" ? (
                <Badge className="px-6 py-2.5 text-sm bg-green-500/20 text-green-400 border-green-500/30">
                  <Check className="h-4 w-4 mr-1" /> Member ✓
                </Badge>
              ) : joinStatus === "pending" ? (
                <Badge className="px-6 py-2.5 text-sm bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  Request Pending ⏳
                </Badge>
              ) : (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setShowJoinModal(true)}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> Request to Join
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="container mx-auto px-6 mt-10">
        <div className="flex items-center gap-1 p-1 rounded-xl glass max-w-xl mx-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}>
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="container mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* ABOUT TAB */}
          {activeTab === "about" && (
            <motion.div key="about" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass rounded-2xl p-8 max-w-3xl mx-auto space-y-6">
                <p className="text-foreground/90 leading-relaxed">{club.description || "No description available."}</p>

                {club.advisor && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-bold text-muted-foreground">FA</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{club.advisor}</p>
                      <p className="text-xs text-muted-foreground">Faculty Advisor</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {club.instagram && (
                    <a href={club.instagram} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-accent transition-colors">
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                  {club.linkedin && (
                    <a href={club.linkedin} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-accent transition-colors">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                </div>

                {club.focus_tags && club.focus_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {club.focus_tags.map((tag: string) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* MEMBERS TAB */}
          {activeTab === "members" && (
            <motion.div key="members" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {members.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">Team coming soon</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
                  {members.map((m) => (
                    <motion.div key={m.id} whileHover={{ y: -4 }}
                      className="glass rounded-xl p-4 text-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-3">
                        <span className="text-lg font-bold text-primary-foreground">
                          {m.avatar_initials || m.name?.substring(0, 2).toUpperCase() || "??"}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                      <Badge variant="outline" className={`mt-1 text-[10px] ${roleColors[m.role] || roleColors.default}`}>
                        {m.role}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* EVENTS TAB */}
          {activeTab === "events" && (
            <motion.div key="events" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto space-y-8">
              {events.length === 0 ? (
                <div className="text-center py-20">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No events yet</p>
                </div>
              ) : (
                <>
                  {upcomingEvents.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-accent" /> Upcoming Events
                      </h3>
                      {upcomingEvents.map(ev => (
                        <EventCard key={ev.id} event={ev} isRegistered={registeredEvents.has(ev.id)}
                          onRegister={() => handleRegister(ev)} />
                      ))}
                    </div>
                  )}
                  {pastEvents.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-border/40" />
                        <span className="text-xs text-muted-foreground">Past Events</span>
                        <div className="flex-1 h-px bg-border/40" />
                      </div>
                      {pastEvents.map(ev => (
                        <EventCard key={ev.id} event={ev} isRegistered={registeredEvents.has(ev.id)} isPast />
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* POSTS TAB */}
          {activeTab === "posts" && (
            <motion.div key="posts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center py-20">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Posts coming soon</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* JOIN REQUEST MODAL */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="glass border-border/40">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Join {club.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Textarea
              placeholder="Why do you want to join? (optional, max 200 chars)"
              maxLength={200}
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              className="bg-secondary/30 border-border/30 min-h-[100px]"
            />
            <p className="text-[11px] text-muted-foreground text-right">{joinMessage.length}/200</p>
            <Button onClick={handleJoinRequest} disabled={submitting}
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PAYMENT MODAL */}
      <Dialog open={!!showPayModal} onOpenChange={() => setShowPayModal(null)}>
        <DialogContent className="glass border-border/40">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Register for {showPayModal?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-accent">₹{showPayModal?.price}</p>
              <p className="text-xs text-muted-foreground">Registration Fee</p>
            </div>
            <Button onClick={() => handlePaidRegister("at_venue")}
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <Ticket className="h-4 w-4 mr-2" /> Pay at Venue
            </Button>
            <Button variant="outline" onClick={() => handlePaidRegister("online")}
              className="w-full border-border/40">
              Pay Online (Coming Soon)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, isRegistered, onRegister, isPast }: {
  event: any; isRegistered: boolean; onRegister?: () => void; isPast?: boolean;
}) => {
  const spotsLeft = Math.max(0, (event.total_spots || 0) - (event.registered_count || 0));
  const progress = event.total_spots ? ((event.registered_count || 0) / event.total_spots) * 100 : 0;

  return (
    <motion.div whileHover={{ x: 3 }}
      className={`glass rounded-xl p-5 ${isPast ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-display text-lg font-bold text-foreground">{event.name}</h4>
          {event.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
            {event.date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(event.date).toLocaleDateString()}</span>}
            {event.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>}
            {event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>}
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{event.registered_count || 0}/{event.total_spots || 0} registered</span>
              <span className="text-muted-foreground">{spotsLeft} spots left</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className={event.is_free ? "border-green-500/30 text-green-400" : "border-amber-500/30 text-amber-400"}>
            {event.is_free ? "FREE" : `₹${event.price}`}
          </Badge>
          {!isPast && (
            isRegistered ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Check className="h-3 w-3 mr-1" /> Registered
              </Badge>
            ) : spotsLeft > 0 && onRegister ? (
              <Button size="sm" onClick={onRegister}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs">
                Register
              </Button>
            ) : (
              <Badge variant="outline" className="border-destructive/30 text-destructive">Full</Badge>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ClubDetail;
