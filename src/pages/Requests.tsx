import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserPlus, UserCheck, Clock, Search,
  MessageCircle, Sparkles, CheckCircle2, XCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConnectionWithStudent {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  student: {
    id: string;
    name: string;
    avatar_url: string | null;
    bio: string | null;
    skills: string[] | null;
    graduation_year: number | null;
    branch_name: string | null;
  } | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 200, damping: 20 } },
};

const FloatingOrb = ({ delay, size, x, y }: { delay: number; size: number; x: string; y: string }) => (
  <motion.div
    className="absolute rounded-full bg-primary/8 blur-3xl"
    style={{ width: size, height: size, left: x, top: y }}
    animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
    transition={{ duration: 5, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

const OrbitalRing = ({ size, duration, delay }: { size: number; duration: number; delay: number }) => (
  <motion.div
    className="absolute border border-primary/10 rounded-full"
    style={{ width: size, height: size, top: "50%", left: "50%", marginTop: -size / 2, marginLeft: -size / 2 }}
    animate={{ rotate: 360 }}
    transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
  />
);

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function yearFromGrad(grad: number | null) {
  if (!grad) return "";
  const diff = grad - new Date().getFullYear();
  if (diff <= 0) return "Final Year";
  if (diff === 1) return "3rd Year";
  if (diff === 2) return "2nd Year";
  return "1st Year";
}

const RequestCard = ({
  conn,
  type,
  onAccept,
  onDecline,
}: {
  conn: ConnectionWithStudent;
  type: "received" | "sent" | "accepted";
  onAccept?: () => void;
  onDecline?: () => void;
}) => {
  const student = conn.student;
  if (!student) return null;

  const initials = getInitials(student.name);
  const year = yearFromGrad(student.graduation_year);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass rounded-2xl border border-border/30 p-5 relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <motion.div
            className="absolute -inset-1.5 rounded-full border border-primary/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <Avatar className="h-12 w-12 ring-2 ring-primary/10">
            {student.avatar_url && <AvatarImage src={student.avatar_url} />}
            <AvatarFallback className="bg-primary/10 text-primary font-display font-bold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3
              className="font-display font-semibold text-foreground text-sm truncate cursor-pointer hover:text-primary transition-colors"
              onClick={() => window.location.href = `/profile/${student.id}`}
            >
              {student.name}
            </h3>
            <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(conn.created_at)}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-1.5">
            {student.branch_name || "Unknown"} {year && `• ${year}`}
          </p>
          {student.bio && (
            <p className="text-xs text-foreground/60 mb-2.5 line-clamp-1">{student.bio}</p>
          )}

          {student.skills && student.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {student.skills.slice(0, 3).map((skill: string) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-[10px] px-2 py-0 h-5 bg-secondary/60 border border-border/30 text-muted-foreground"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {type === "received" && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAccept}
                  className="flex items-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Accept
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onDecline}
                  className="flex items-center gap-1.5 text-xs font-medium bg-secondary/60 text-muted-foreground px-4 py-1.5 rounded-lg border border-border/30 hover:text-foreground transition-colors"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Decline
                </motion.button>
              </>
            )}
            {type === "sent" && (
              <span className="text-[11px] font-medium flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                Pending
              </span>
            )}
            {type === "accepted" && (
              <>
                <span className="text-[11px] font-medium flex items-center gap-1 text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Connected
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => window.location.href = `/chat?user=${student.id}`}
                  className="ml-auto h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Requests = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("received");
  const [searchQuery, setSearchQuery] = useState("");
  const [received, setReceived] = useState<ConnectionWithStudent[]>([]);
  const [sent, setSent] = useState<ConnectionWithStudent[]>([]);
  const [accepted, setAccepted] = useState<ConnectionWithStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch all connections involving the user
    const { data: connections, error } = await supabase
      .from("connections")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error || !connections) {
      console.error("Error fetching connections:", error);
      setLoading(false);
      return;
    }

    // Gather all student IDs we need to look up
    const studentIds = new Set<string>();
    connections.forEach(c => {
      const otherId = c.sender_id === user.id ? c.receiver_id : c.sender_id;
      studentIds.add(otherId);
    });

    // Fetch student details for all relevant users
    let studentsMap: Record<string, any> = {};
    if (studentIds.size > 0) {
      const { data: students } = await supabase
        .from("students")
        .select("id, name, avatar_url, bio, skills, graduation_year, branch_id")
        .in("id", Array.from(studentIds));

      // Also fetch branch names
      const branchIds = (students || []).filter(s => s.branch_id).map(s => s.branch_id!);
      let branchMap: Record<string, string> = {};
      if (branchIds.length > 0) {
        const { data: branches } = await supabase
          .from("branches")
          .select("id, name")
          .in("id", branchIds);
        (branches || []).forEach(b => { branchMap[b.id] = b.name; });
      }

      (students || []).forEach(s => {
        studentsMap[s.id] = {
          ...s,
          branch_name: s.branch_id ? (branchMap[s.branch_id] || null) : null,
        };
      });
    }

    // Categorize connections
    const receivedList: ConnectionWithStudent[] = [];
    const sentList: ConnectionWithStudent[] = [];
    const acceptedList: ConnectionWithStudent[] = [];

    connections.forEach(c => {
      const otherId = c.sender_id === user.id ? c.receiver_id : c.sender_id;
      const enriched: ConnectionWithStudent = {
        ...c,
        student: studentsMap[otherId] || null,
      };

      if (c.status === "accepted") {
        acceptedList.push(enriched);
      } else if (c.status === "pending") {
        if (c.receiver_id === user.id) {
          receivedList.push(enriched);
        } else {
          sentList.push(enriched);
        }
      }
    });

    setReceived(receivedList);
    setSent(sentList);
    setAccepted(acceptedList);
    setLoading(false);
  };

  useEffect(() => {
    fetchConnections();
  }, [user]);

  const handleAccept = async (connId: string) => {
    const { error } = await supabase
      .from("connections")
      .update({ status: "accepted" })
      .eq("id", connId);
    if (error) {
      toast.error("Failed to accept request");
    } else {
      toast.success("Connection accepted!");
      fetchConnections();
    }
  };

  const handleDecline = async (connId: string) => {
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("id", connId);
    if (error) {
      toast.error("Failed to decline request");
    } else {
      toast("Request declined");
      fetchConnections();
    }
  };

  const tabs = [
    { id: "received", label: "Received", icon: UserPlus, count: received.length },
    { id: "sent", label: "Sent", icon: Clock, count: sent.length },
    { id: "accepted", label: "Accepted", icon: UserCheck, count: accepted.length },
  ];

  const getFilteredList = (list: ConnectionWithStudent[]) => {
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(c => c.student?.name.toLowerCase().includes(q));
  };

  const getContent = () => {
    let list: ConnectionWithStudent[] = [];
    let type: "received" | "sent" | "accepted" = "received";

    switch (activeTab) {
      case "received": list = received; type = "received"; break;
      case "sent": list = sent; type = "sent"; break;
      case "accepted": list = accepted; type = "accepted"; break;
    }

    const filtered = getFilteredList(list);

    if (loading) {
      return (
        <div className="col-span-full text-center py-16 text-muted-foreground">
          Loading...
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <div className="col-span-full text-center py-16">
          <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {searchQuery ? "No matching results" : `No ${activeTab} requests yet`}
          </p>
        </div>
      );
    }

    return filtered.map((conn) => (
      <RequestCard
        key={conn.id}
        conn={conn}
        type={type}
        onAccept={() => handleAccept(conn.id)}
        onDecline={() => handleDecline(conn.id)}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      <FloatingOrb delay={0} size={350} x="10%" y="25%" />
      <FloatingOrb delay={2} size={250} x="75%" y="55%" />
      <FloatingOrb delay={4} size={200} x="45%" y="80%" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 pt-24 pb-16 container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative"
        >
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-8 w-40 h-40 pointer-events-none">
            <OrbitalRing size={140} duration={12} delay={0} />
            <OrbitalRing size={100} duration={8} delay={1} />
            <OrbitalRing size={60} duration={6} delay={0.5} />
            <motion.div
              className="absolute inset-0 m-auto h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/20"
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <Users className="h-5 w-5 text-primary" />
            </motion.div>
          </div>

          <div className="pt-20">
            <motion.h1
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Connection{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                Requests
              </span>
            </motion.h1>
            <motion.p
              className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Grow your network. Accept requests, discover people, and build your tribe.
            </motion.p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            { label: "Pending", value: received.length, icon: Clock, color: "from-yellow-500/20 to-yellow-600/5" },
            { label: "Accepted", value: accepted.length, icon: UserCheck, color: "from-green-500/20 to-green-600/5" },
            { label: "Sent", value: sent.length, icon: UserPlus, color: "from-primary/20 to-primary/5" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.08 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="glass rounded-xl border border-border/30 p-4 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color}`} />
              <div className="relative flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-secondary/50 flex items-center justify-center">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs + Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6"
        >
          <div className="flex gap-1 glass rounded-xl p-1 border border-border/30 overflow-x-auto w-full md:w-auto">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[10px] rounded-full h-4 min-w-4 flex items-center justify-center px-1 ${
                    activeTab === tab.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary/30 border-border/30 focus:border-primary/50 h-9 text-sm"
            />
          </div>
        </motion.div>

        {/* Cards Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {getContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Requests;
