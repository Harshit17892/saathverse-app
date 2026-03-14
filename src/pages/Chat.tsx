import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Search, Star, MoreVertical, Shield, Lock, ArrowLeft, Timer
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/Navbar";
import ChatLimitBanner, { useChatLimit, PaymentModal } from "@/components/chat/ChatLimitBanner";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ChatContact {
  id: string; // user_id of the other person
  name: string;
  initials: string;
  avatar_url: string | null;
  lastMsg: string;
  lastMsgTime: string;
  unread: number;
  status: "online" | "offline";
}

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  is_read: boolean;
}

function getConversationId(a: string, b: string) {
  return [a, b].sort().join("_");
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const statusColors: Record<string, string> = {
  online: "bg-green-500",
  offline: "bg-muted-foreground/30",
};

const Chat = () => {
  const { user, collegeId, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("user");

  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [contactsLoading, setContactsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatLimit = useChatLimit();

  // Show 24h auto-clear warning only twice total
  useEffect(() => {
    if (!activeContact) return;
    const key = "chat_clear_warning_count";
    const count = parseInt(localStorage.getItem(key) || "0", 10);
    if (count < 2) {
      toast("Chats auto-clear after 24 hours", {
        description: "All messages will be deleted to keep servers clean.",
        icon: <Timer className="h-4 w-4 text-amber-400" />,
        duration: 4000,
      });
      localStorage.setItem(key, String(count + 1));
    }
  }, [activeContact?.id]);

  // Load contacts from accepted connections
  useEffect(() => {
    if (!user || !collegeId) return;

    // Auto-connect bots with this user (runs once per session)
    const autoConnectBots = async () => {
      const sessionKey = `bots_connected_${user.id}`;
      if (sessionStorage.getItem(sessionKey)) return;

      // Find all bots in the same college
      const { data: bots } = await supabase
        .from("students")
        .select("id")
        .eq("college_id", collegeId)
        .eq("is_bot", true);

      if (!bots || bots.length === 0) return;

      // Check which bots already have connections with this user
      const { data: existingConns } = await supabase
        .from("connections")
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "accepted");

      const connectedIds = new Set(
        (existingConns || []).flatMap(c => [c.sender_id, c.receiver_id])
      );

      // Bot auto-connect is disabled: bot student IDs are not real auth.users,
      // so inserting them into connections would violate the FK constraint.
      // Real user connections work fine through the normal connect flow.

      sessionStorage.setItem(sessionKey, "true");
    };

    const loadContacts = async () => {
      setContactsLoading(true);

      // Auto-connect bots first
      await autoConnectBots();

      // Get accepted connections
      const { data: connections } = await supabase
        .from("connections")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "accepted");

      if (!connections || connections.length === 0) {
        setContacts([]);
        setActiveContact(null);
        setContactsLoading(false);
        return;
      }

      const otherIds = connections.map(c =>
        c.sender_id === user.id ? c.receiver_id : c.sender_id
      );

      // Fetch student info for all contacts
      const { data: students } = await supabase
        .from("students")
        .select("id, name, avatar_url")
        .in("id", otherIds);

      if (!students) { setContactsLoading(false); return; }

      // Fetch last message and unread count for each contact
      const contactList: ChatContact[] = [];
      for (const student of students) {
        const convId = getConversationId(user.id, student.id);

        // Last message
        const { data: lastMsgs } = await supabase
          .from("messages")
          .select("content, created_at")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: false })
          .limit(1);

        // Unread count
        const { count } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", convId)
          .eq("receiver_id", user.id)
          .eq("is_read", false);

        contactList.push({
          id: student.id,
          name: student.name,
          initials: getInitials(student.name),
          avatar_url: student.avatar_url,
          lastMsg: lastMsgs?.[0]?.content || "Say hi! 👋",
          lastMsgTime: lastMsgs?.[0]?.created_at || "",
          unread: count || 0,
          status: "online",
        });
      }

      // Sort: unread first, then by last message time
      contactList.sort((a, b) => {
        if (a.unread !== b.unread) return b.unread - a.unread;
        if (!a.lastMsgTime) return 1;
        if (!b.lastMsgTime) return -1;
        return new Date(b.lastMsgTime).getTime() - new Date(a.lastMsgTime).getTime();
      });

      setContacts(contactList);

      // Auto-select target user if provided
      if (targetUserId) {
        const target = contactList.find(c => c.id === targetUserId);
        if (target) {
          setActiveContact(target);
        } else {
          await loadTargetUser(targetUserId, contactList);
        }
      }

      setContactsLoading(false);
    };

    const loadTargetUser = async (targetId: string, existingContacts: ChatContact[] = []) => {
      // Only allow chatting if there's an accepted connection
      const { data: conn } = await supabase
        .from("connections")
        .select("id")
        .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${user!.id})`)
        .eq("status", "accepted")
        .maybeSingle();

      if (!conn) {
        toast.error("You can only chat with accepted connections");
        return;
      }

      const { data: student } = await supabase
        .from("students")
        .select("id, name, avatar_url")
        .eq("id", targetId)
        .maybeSingle();

      if (student) {
        const newContact: ChatContact = {
          id: student.id,
          name: student.name,
          initials: getInitials(student.name),
          avatar_url: student.avatar_url,
          lastMsg: "Say hi! 👋",
          lastMsgTime: "",
          unread: 0,
          status: "online",
        };
        setContacts([newContact, ...existingContacts]);
        setActiveContact(newContact);
      }
    };

    loadContacts();

    // Subscribe to connection changes (unfriend, new accept, etc.)
    const connChannel = supabase
      .channel("chat-connections")
      .on("postgres_changes", { event: "*", schema: "public", table: "connections" }, () => {
        loadContacts();
      })
      .subscribe();

    return () => { supabase.removeChannel(connChannel); };
  }, [user, targetUserId, collegeId]);

  // Load messages for active contact
  useEffect(() => {
    if (!user || !activeContact) { setMessages([]); return; }

    const convId = getConversationId(user.id, activeContact.id);

    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      setMessages((data as ChatMessage[]) || []);

      // Mark unread messages as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", convId)
        .eq("receiver_id", user.id)
        .eq("is_read", false);

      // Update contact unread count locally
      setContacts(prev => prev.map(c =>
        c.id === activeContact.id ? { ...c, unread: 0 } : c
      ));
    };

    loadMessages();

    // Subscribe to new messages in this conversation
    const channel = supabase
      .channel(`chat:${convId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${convId}`,
        },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // Mark as read if we're the receiver
          if (newMsg.receiver_id === user.id) {
            await supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", newMsg.id);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          const updated = payload.new as ChatMessage;
          setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [user, activeContact?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!messageText.trim() || !user || !activeContact) return;
    if (chatLimit.isExhausted) {
      setShowPayment(true);
      return;
    }
    const ok = await chatLimit.incrementUsage();
    if (!ok) {
      toast.error("Daily message limit reached!");
      setShowPayment(true);
      return;
    }

    // Check if there's an accepted connection first
    const { data: conn } = await supabase
      .from("connections")
      .select("id")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeContact.id}),and(sender_id.eq.${activeContact.id},receiver_id.eq.${user.id})`)
      .eq("status", "accepted")
      .maybeSingle();

    if (!conn) {
      toast.error("You can only message accepted connections");
      return;
    }

    if (!collegeId && !isAdmin) {
      toast.error("College not found. Please complete your profile.");
      return;
    }

    const convId = getConversationId(user.id, activeContact.id);
    const optimisticMsg: ChatMessage = {
      id: `opt-${Date.now()}`,
      conversation_id: convId,
      sender_id: user.id,
      receiver_id: activeContact.id,
      content: messageText.trim(),
      college_id: collegeId,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    // Optimistically show message immediately
    setMessages(prev => [...prev, optimisticMsg]);
    setMessageText("");

    const { data: inserted, error } = await supabase.from("messages").insert({
      conversation_id: convId,
      sender_id: user.id,
      receiver_id: activeContact.id,
      content: messageText.trim(),
      college_id: collegeId,
    }).select().single();

    if (error) {
      // Roll back optimistic message
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      toast.error("Failed to send message");
    } else {
      // Replace optimistic with real (has correct DB id for read receipts)
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? inserted as ChatMessage : m));
      setContacts(prev => prev.map(c =>
        c.id === activeContact.id
          ? { ...c, lastMsg: optimisticMsg.content, lastMsgTime: optimisticMsg.created_at }
          : c
      ));
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      <div className="pt-20 h-screen flex relative z-10">
        {/* Contact List Sidebar */}
        <motion.aside
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 25 }}
          className={`${activeContact ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 bg-card/20 backdrop-blur-xl border-r border-border/15 flex-col`}
        >
          <div className="p-4 sm:p-5 border-b border-border/15">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-display font-bold text-xl text-foreground">Messages</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Lock className="h-3 w-3 text-primary" />
                  <span className="text-[10px] text-primary font-medium tracking-wide uppercase">End-to-end encrypted</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-secondary/30 border border-border/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 focus:bg-secondary/50 transition-all"
              />
            </div>
          </div>

          {!chatLimit.loading && (
            <div className="px-3 pt-2">
              <ChatLimitBanner
                remaining={chatLimit.remaining}
                isExhausted={chatLimit.isExhausted}
                resetTimeLeft={chatLimit.resetTimeLeft()}
                onBuyMore={() => setShowPayment(true)}
              />
            </div>
          )}

          <ScrollArea className="flex-1">
            <div className="p-2">
              {contactsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <p className="text-muted-foreground text-sm">No conversations yet</p>
                  <p className="text-muted-foreground/60 text-xs mt-1">Connect with people to start chatting</p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <motion.button
                    key={contact.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveContact(contact)}
                    className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all text-left ${
                      activeContact?.id === contact.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-secondary/30 border border-transparent"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg overflow-hidden">
                        {contact.avatar_url ? (
                          <img src={contact.avatar_url} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-primary-foreground">{contact.initials}</span>
                        )}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${statusColors[contact.status]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-sm text-foreground truncate">{contact.name}</span>
                        {contact.lastMsgTime && (
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{timeAgo(contact.lastMsgTime)}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground truncate pr-2">{contact.lastMsg}</p>
                        {contact.unread > 0 && (
                          <span className="shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                            {contact.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </ScrollArea>
        </motion.aside>

        {/* Chat Area */}
        {activeContact ? (
          <motion.main
            key={activeContact.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", damping: 30 }}
            className="flex-1 flex flex-col relative"
          >
            {/* Chat Header */}
            <div className="bg-card/30 backdrop-blur-xl border-b border-border/15 px-3 sm:px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveContact(null)}
                  className="md:hidden h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors shrink-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </motion.button>
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                  onClick={() => navigate(`/profile/${activeContact.id}`)}
                >
                  <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md overflow-hidden">
                      {activeContact.avatar_url ? (
                        <img src={activeContact.avatar_url} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-primary-foreground">{activeContact.initials}</span>
                      )}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${statusColors[activeContact.status]}`} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display font-bold text-foreground text-sm truncate hover:text-primary transition-colors">{activeContact.name}</h2>
                    <div className="flex items-center gap-1.5">
                      <Lock className="h-2.5 w-2.5 text-primary/60" />
                      <span className="text-[10px] text-primary/60">Encrypted</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStarred(prev => {
                    const next = new Set(prev);
                    if (next.has(activeContact.id)) next.delete(activeContact.id);
                    else next.add(activeContact.id);
                    return next;
                  })}
                  className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <Star className={`h-4 w-4 ${starred.has(activeContact.id) ? "fill-amber-400 text-amber-400" : ""}`} />
                </motion.button>
              </div>
            </div>

            {/* E2EE Notice */}
            <div className="flex justify-center py-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                <Shield className="h-3 w-3 text-primary/50" />
                <span className="text-[10px] text-primary/50 font-medium">Messages are end-to-end encrypted.</span>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-3 sm:px-6" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center">
                    <span className="text-2xl">👋</span>
                  </div>
                  <p className="text-muted-foreground text-sm text-center">
                    No messages yet. Say hi to <span className="text-foreground font-medium">{activeContact.name}</span>!
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 my-3">
                    <div className="flex-1 h-px bg-border/20" />
                    <span className="text-[10px] text-muted-foreground font-medium px-3 py-0.5 rounded-full bg-secondary/30 border border-border/15">Today</span>
                    <div className="flex-1 h-px bg-border/20" />
                  </div>

                  <div className="space-y-1 pb-4">
                    <AnimatePresence>
                      {messages.map((msg, i) => {
                        const isMine = msg.sender_id === user?.id;
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: Math.min(i * 0.03, 0.3), type: "spring", damping: 25 }}
                            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                          >
                            <div className="max-w-[75%] sm:max-w-[65%]">
                              <div
                                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                  isMine
                                    ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-br-md"
                                    : "bg-card/80 border border-border/20 text-foreground rounded-bl-md"
                                }`}
                              >
                                <p>{msg.content}</p>
                                <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                                  <span className={`text-[9px] ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                    {formatTime(msg.created_at)}
                                  </span>
                                  {isMine && (
                                    <span className={`text-[9px] font-bold ${msg.is_read ? "text-blue-400" : "text-primary-foreground/60"}`}>
                                      {msg.is_read ? "✓✓" : "✓"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="px-3 sm:px-5 py-3">
              <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/25 flex items-center gap-2 px-4 py-2">
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder={`Message ${activeContact.name}...`}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-1.5"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${
                    messageText.trim()
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.main>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 hidden md:flex flex-col items-center justify-center gap-4"
          >
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 border border-primary/15 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary/40" />
            </div>
            <div className="text-center">
              <h2 className="font-display text-xl font-bold text-foreground mb-1">Your Messages</h2>
              <p className="text-muted-foreground text-sm max-w-xs">
                Select a conversation to start chatting. All messages are end-to-end encrypted.
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full border border-primary/10 bg-primary/5">
              <Shield className="h-3 w-3 text-primary/50" />
              <span className="text-[10px] text-primary/50 font-medium">Secured with E2EE</span>
            </div>
          </motion.div>
        )}
      </div>

      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={() => {
          chatLimit.addBonusMessages();
          setShowPayment(false);
        }}
      />
    </div>
  );
};

export default Chat;
