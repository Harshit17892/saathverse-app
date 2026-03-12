import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Users, Rocket, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

const StartupChat = () => {
  const { startupId } = useParams<{ startupId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [startup, setStartup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const profileCache = useRef<Record<string, { name: string; avatar: string | null }>>({});

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch profile info for a user_id, with caching
  const getProfile = useCallback(async (userId: string) => {
    if (profileCache.current[userId]) return profileCache.current[userId];
    const { data } = await supabase
      .from("profiles")
      .select("full_name, photo_url")
      .eq("user_id", userId)
      .maybeSingle();
    const info = { name: data?.full_name || "Unknown", avatar: data?.photo_url || null };
    profileCache.current[userId] = info;
    return info;
  }, []);

  // Load startup info + check access
  useEffect(() => {
    if (!startupId || !user) return;

    const load = async () => {
      // Fetch startup
      const { data: s } = await supabase
        .from("startup_ideas")
        .select("*")
        .eq("id", startupId)
        .maybeSingle();

      if (!s) {
        toast.error("Startup not found");
        navigate("/startup");
        return;
      }
      setStartup(s);

      // Check access: founder or approved member
      const isFounder = s.user_id === user.id;
      if (!isFounder) {
        const { data: membership } = await supabase
          .from("startup_members")
          .select("status")
          .eq("startup_id", startupId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (!membership || membership.status !== "approved") {
          setHasAccess(false);
          setLoading(false);
          return;
        }
      }
      setHasAccess(true);

      // Fetch members for sidebar
      const { data: mems } = await supabase
        .from("startup_members")
        .select("user_id, role, status")
        .eq("startup_id", startupId)
        .eq("status", "approved");

      const memberProfiles = await Promise.all(
        [{ user_id: s.user_id, role: "founder", status: "approved" }, ...(mems || [])].map(async (m) => {
          const prof = await getProfile(m.user_id);
          return { ...m, name: prof.name, avatar: prof.avatar };
        })
      );
      setMembers(memberProfiles);

      // Fetch messages
      const { data: msgs } = await supabase
        .from("startup_messages")
        .select("*")
        .eq("startup_id", startupId)
        .order("created_at", { ascending: true });

      if (msgs) {
        const enriched = await Promise.all(
          msgs.map(async (msg: any) => {
            const prof = await getProfile(msg.user_id);
            return { ...msg, sender_name: prof.name, sender_avatar: prof.avatar };
          })
        );
        setMessages(enriched);
      }

      setLoading(false);
      setTimeout(scrollToBottom, 100);
    };

    load();
  }, [startupId, user, navigate, getProfile, scrollToBottom]);

  // Realtime subscription
  useEffect(() => {
    if (!startupId || !hasAccess) return;

    const channel = supabase
      .channel(`startup-chat-${startupId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "startup_messages",
        filter: `startup_id=eq.${startupId}`,
      }, async (payload) => {
        const msg = payload.new as any;
        // Don't duplicate own messages
        if (msg.user_id === user?.id) return;
        const prof = await getProfile(msg.user_id);
        setMessages((prev) => [...prev, { ...msg, sender_name: prof.name, sender_avatar: prof.avatar }]);
        setTimeout(scrollToBottom, 50);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [startupId, hasAccess, user?.id, getProfile, scrollToBottom]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !startupId || sending) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    // Optimistic update
    const optimistic: ChatMessage = {
      id: crypto.randomUUID(),
      content,
      user_id: user.id,
      created_at: new Date().toISOString(),
      sender_name: profileCache.current[user.id]?.name || "You",
      sender_avatar: profileCache.current[user.id]?.avatar || null,
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(scrollToBottom, 50);

    const { error } = await supabase.from("startup_messages").insert({
      startup_id: startupId,
      user_id: user.id,
      content,
    });

    if (error) {
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
    setSending(false);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
  messages.forEach((msg) => {
    const date = formatDate(msg.created_at);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === date) last.messages.push(msg);
    else groupedMessages.push({ date, messages: [msg] });
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
            <Rocket className="h-8 w-8 text-primary" />
          </motion.div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4 px-4">
          <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20">
            <Users className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Only approved members and the founder can access this chat room.
          </p>
          <Button variant="outline" onClick={() => navigate("/startup")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Startups
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/startup")} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/10">
                <Rocket className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-display font-bold text-foreground">{startup?.name}</h1>
                <p className="text-[11px] text-muted-foreground">{members.length} member{members.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            {/* Member avatars */}
            <div className="flex items-center -space-x-2">
              {members.slice(0, 5).map((m, i) => (
                <Avatar key={m.user_id} className="h-7 w-7 border-2 border-background">
                  <AvatarImage src={m.avatar || undefined} />
                  <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                    {m.name?.slice(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
              ))}
              {members.length > 5 && (
                <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-[9px] text-muted-foreground">+{members.length - 5}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
              <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">No messages yet. Start the conversation! 🚀</p>
            </div>
          )}

          {groupedMessages.map((group) => (
            <div key={group.date}>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-[10px] text-muted-foreground font-medium px-2">{group.date}</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>
              <div className="space-y-3">
                {group.messages.map((msg) => {
                  const isOwn = msg.user_id === user?.id;
                  const isFounder = msg.user_id === startup?.user_id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}
                    >
                      {!isOwn && (
                        <Link to={`/profile/${msg.user_id}`}>
                          <Avatar className="h-8 w-8 shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all">
                            <AvatarImage src={msg.sender_avatar || undefined} />
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                              {msg.sender_name?.slice(0, 2).toUpperCase() || "??"}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                      )}
                      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                        {!isOwn && (
                          <div className="flex items-center gap-1.5 mb-0.5 px-1">
                            <span className="text-[10px] font-medium text-foreground">{msg.sender_name}</span>
                            {isFounder && <Crown className="h-2.5 w-2.5 text-accent" />}
                          </div>
                        )}
                        <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted/60 text-foreground border border-border/30 rounded-bl-md"
                        }`}>
                          {msg.content}
                        </div>
                        <span className={`text-[9px] text-muted-foreground mt-0.5 px-1 block ${isOwn ? "text-right" : ""}`}>
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-xl border-t border-border/50 px-4 py-3">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-muted/40 border-border/50 focus-visible:ring-primary/30"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newMessage.trim() || sending}
              className="shrink-0 bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StartupChat;
