import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, Calendar, UserPlus, Settings, BarChart3, Ticket,
  Check, X, Loader2, Plus, Search, Trash2, ToggleLeft,
  Clock, MapPin, ChevronRight, Save
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type Tab = "overview" | "members" | "requests" | "events" | "registrations" | "settings";

const ROLES = ["President", "Vice President", "Secretary", "Treasurer", "Tech Lead", "Design Lead", "Events Head", "Marketing Head", "Member"];

const GRADIENT_PRESETS = [
  "from-blue-600/40 to-primary/30",
  "from-purple-600/40 to-pink-500/30",
  "from-green-600/40 to-emerald-500/30",
  "from-amber-600/40 to-orange-500/30",
  "from-red-600/40 to-rose-500/30",
  "from-cyan-600/40 to-blue-500/30",
];

const ClubLeaderDashboard = () => {
  const { user, profile, collegeId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [club, setClub] = useState<any>(null);

  // Data
  const [members, setMembers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);

  // Modals
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  // Add Member form
  const [memberSearch, setMemberSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState("Member");

  // Event form
  const [eventForm, setEventForm] = useState<any>({});
  const [eventDate, setEventDate] = useState<Date | undefined>();

  // Settings form
  const [settingsForm, setSettingsForm] = useState<any>({});

  // Transfer leadership
  const [transferTargetUserId, setTransferTargetUserId] = useState<string>("");
  const [transferConfirmText, setTransferConfirmText] = useState<string>("");
  const [transferring, setTransferring] = useState(false);

  // Registrations filter
  const [regEventFilter, setRegEventFilter] = useState<string>("all");

  // Check if user is a club leader
  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data } = await supabase
        .from("club_members")
        .select("*, clubs(*)")
        .eq("user_id", user.id)
        .in("role", ["President", "Vice President"])
        .eq("is_active", true);

      if (!data || data.length === 0) {
        navigate("/");
        return;
      }

      const clubs = data.map((d: any) => d.clubs).filter(Boolean);
      setMyClubs(clubs);
      setSelectedClubId(clubs[0]?.id || null);
      setLoading(false);
    };
    check();
  }, [user, navigate]);

  // Load club data when selected
  useEffect(() => {
    if (!selectedClubId) return;
    const loadData = async () => {
      const [clubRes, membersRes, reqRes, eventsRes] = await Promise.all([
        supabase.from("clubs").select("*").eq("id", selectedClubId).single(),
        supabase.from("club_members").select("*").eq("club_id", selectedClubId).order("joined_at"),
        supabase.from("club_join_requests").select("*").eq("club_id", selectedClubId).eq("status", "pending").order("created_at", { ascending: false }),
        supabase.from("club_events").select("*").eq("club_id", selectedClubId).order("date", { ascending: false }),
      ]);
      setClub(clubRes.data);
      setMembers(membersRes.data || []);
      setRequests(reqRes.data || []);
      setEvents(eventsRes.data || []);
      setSettingsForm({
        tagline: clubRes.data?.tagline || "",
        description: clubRes.data?.description || "",
        instagram: clubRes.data?.instagram || "",
        linkedin: clubRes.data?.linkedin || "",
        focus_tags: clubRes.data?.focus_tags?.join(", ") || "",
        advisor: clubRes.data?.advisor || "",
      });

      // Load registrations for all events
      const eventIds = (eventsRes.data || []).map((e: any) => e.id);
      if (eventIds.length > 0) {
        const { data: regs } = await supabase
          .from("club_event_registrations")
          .select("*, club_events(name)")
          .in("event_id", eventIds);
        setRegistrations(regs || []);
      }
    };
    loadData();
  }, [selectedClubId]);

  const pendingCount = requests.length;
  const activeMembers = members.filter(m => m.is_active);
  const currentPresident = members.find(m => m.role === "President" && m.is_active);
  const transferCandidates = members.filter(m => m.is_active && m.user_id !== currentPresident?.user_id);
  const upcomingEvents = events.filter(e => !e.date || new Date(e.date) >= new Date());
  const totalRegs = registrations.length;

  // Search profiles for adding members
  useEffect(() => {
    if (memberSearch.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, branch, photo_url")
        .eq("college_id", collegeId!)
        .ilike("full_name", `%${memberSearch}%`)
        .limit(5);
      setSearchResults(data || []);
    }, 300);
    return () => clearTimeout(t);
  }, [memberSearch, collegeId]);

  const handleAddMember = async () => {
    if (!selectedProfile || !selectedClubId || !club) return;
    // Check if President role already exists
    if (selectedRole === "President") {
      const existing = members.find(m => m.role === "President" && m.is_active);
      if (existing) {
        toast({ title: "Error", description: "A President already exists for this club.", variant: "destructive" });
        return;
      }
    }
    const { error } = await supabase.from("club_members").insert({
      club_id: selectedClubId,
      user_id: selectedProfile.user_id,
      name: selectedProfile.full_name || "Unknown",
      role: selectedRole,
      avatar_initials: (selectedProfile.full_name || "??").substring(0, 2).toUpperCase(),
      added_by: user!.id,
      college_id: collegeId,
    });
    if (error) {
      toast({ title: "Error", description: error.code === "23505" ? "Already a member" : error.message, variant: "destructive" });
    } else {
      toast({ title: "Member added!" });
      setShowAddMember(false);
      setMemberSearch("");
      setSelectedProfile(null);
      setSelectedRole("Member");
      // Refresh
      const { data } = await supabase.from("club_members").select("*").eq("club_id", selectedClubId).order("joined_at");
      setMembers(data || []);
    }
  };

  const handleRemoveMember = async (id: string) => {
    await supabase.from("club_members").delete().eq("id", id);
    setMembers(prev => prev.filter(m => m.id !== id));
    toast({ title: "Member removed" });
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await supabase.from("club_members").update({ is_active: !current }).eq("id", id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, is_active: !current } : m));
  };

  const handleApproveRequest = async (req: any) => {
    await supabase.from("club_join_requests").update({ status: "approved" }).eq("id", req.id);
    await supabase.from("club_members").insert({
      club_id: req.club_id,
      user_id: req.user_id,
      name: req.student_name,
      role: "Member",
      avatar_initials: (req.student_name || "??").substring(0, 2).toUpperCase(),
      college_id: collegeId,
    });
    setRequests(prev => prev.filter(r => r.id !== req.id));
    const { data } = await supabase.from("club_members").select("*").eq("club_id", selectedClubId!).order("joined_at");
    setMembers(data || []);
    toast({ title: "Request approved!" });
  };

  const handleRejectRequest = async (id: string) => {
    await supabase.from("club_join_requests").update({ status: "rejected" }).eq("id", id);
    setRequests(prev => prev.filter(r => r.id !== id));
    toast({ title: "Request rejected" });
  };

  const handleSaveEvent = async () => {
    const payload = {
      ...eventForm,
      club_id: selectedClubId,
      date: eventDate ? format(eventDate, "yyyy-MM-dd") : null,
      is_free: eventForm.is_free !== false,
      price: eventForm.is_free !== false ? null : Number(eventForm.price) || 0,
      total_spots: Number(eventForm.total_spots) || 50,
      college_id: collegeId,
      created_by: user!.id,
    };
    if (editingEvent) payload.id = editingEvent.id;

    const { error } = await supabase.from("club_events").upsert(payload);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingEvent ? "Event updated" : "Event created!" });
      setShowEventForm(false);
      setEditingEvent(null);
      setEventForm({});
      setEventDate(undefined);
      const { data } = await supabase.from("club_events").select("*").eq("club_id", selectedClubId!).order("date", { ascending: false });
      setEvents(data || []);
    }
  };

  const handleToggleEventActive = async (id: string, current: boolean) => {
    await supabase.from("club_events").update({ is_active: !current }).eq("id", id);
    setEvents(prev => prev.map(e => e.id === id ? { ...e, is_active: !current } : e));
  };

  const handleSaveSettings = async () => {
    const { error } = await supabase.from("clubs").update({
      tagline: settingsForm.tagline,
      description: settingsForm.description,
      instagram: settingsForm.instagram,
      linkedin: settingsForm.linkedin,
      focus_tags: settingsForm.focus_tags ? settingsForm.focus_tags.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      advisor: settingsForm.advisor,
    }).eq("id", selectedClubId!);
    if (!error) toast({ title: "Settings saved!" });
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const handleTogglePaid = async (regId: string, current: boolean) => {
    await supabase.from("club_event_registrations").update({ paid: !current }).eq("id", regId);
    setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, paid: !current } : r));
  };

  const handleTransferLeadership = async () => {
    if (!selectedClubId) return;

    if (!currentPresident || currentPresident.user_id !== user?.id) {
      toast({ title: "Error", description: "Only the current President can transfer leadership.", variant: "destructive" });
      return;
    }
    if (!transferTargetUserId) {
      toast({ title: "Error", description: "Please select a new leader.", variant: "destructive" });
      return;
    }
    if (transferTargetUserId === user?.id) {
      toast({ title: "Error", description: "You are already the President.", variant: "destructive" });
      return;
    }
    if (transferConfirmText.trim().toUpperCase() !== "TRANSFER") {
      toast({ title: "Confirmation required", description: "Type TRANSFER to confirm.", variant: "destructive" });
      return;
    }

    setTransferring(true);
    try {
      const { data, error } = await supabase.rpc("transfer_club_leadership", {
        p_club_id: selectedClubId,
        p_new_leader_user_id: transferTargetUserId,
      });
      if (error) throw error;
      const payload = data as any;
      if (!payload?.success) {
        toast({ title: "Transfer failed", description: "Unexpected response.", variant: "destructive" });
      } else {
        toast({ title: "Leadership transferred", description: "Redirecting to clubs..." });
        navigate("/clubs");
      }
    } catch (e: any) {
      toast({ title: "Transfer failed", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setTransferring(false);
    }
  };

  const openEditEvent = (ev: any) => {
    setEditingEvent(ev);
    setEventForm({ name: ev.name, description: ev.description, time: ev.time, location: ev.location, is_free: ev.is_free, price: ev.price, total_spots: ev.total_spots, banner_gradient: ev.banner_gradient });
    setEventDate(ev.date ? new Date(ev.date) : undefined);
    setShowEventForm(true);
  };

  const tabs: { key: Tab; label: string; icon: any; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "members", label: "Members", icon: Users },
    { key: "requests", label: "Requests", icon: UserPlus, badge: pendingCount },
    { key: "events", label: "Events", icon: Calendar },
    { key: "registrations", label: "Registrations", icon: Ticket },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const inputClass = "bg-secondary/30 border-border/30 focus:border-primary/50";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Club Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your club</p>
          </div>
          {myClubs.length > 1 && (
            <select
              className="bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground"
              value={selectedClubId || ""}
              onChange={(e) => setSelectedClubId(e.target.value)}
            >
              {myClubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          {club && <Badge variant="outline" className="text-accent border-accent/30">{club.name}</Badge>}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 p-1 rounded-xl glass mb-8">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.key ? "bg-primary text-primary-foreground shadow-md shadow-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}>
              <t.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
              {t.badge !== undefined && t.badge > 0 && (
                <span className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full">{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Members", value: activeMembers.length, icon: Users },
              { label: "Pending Requests", value: pendingCount, icon: UserPlus },
              { label: "Upcoming Events", value: upcomingEvents.length, icon: Calendar },
              { label: "Total Registrations", value: totalRegs, icon: Ticket },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  <s.icon className="h-4 w-4 text-accent" />
                </div>
                <p className="font-display text-3xl font-bold text-foreground">{s.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* MEMBERS */}
        {activeTab === "members" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowAddMember(true)} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" /> Add Member
              </Button>
            </div>
            <div className="glass rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 p-4 border-b border-border/20 text-xs uppercase tracking-wider text-muted-foreground">
                <span>Member</span><span>Role</span><span>Joined</span><span>Active</span><span></span>
              </div>
              {members.map(m => (
                <div key={m.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 p-4 border-b border-border/10 items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">{m.avatar_initials || "??"}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{m.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{m.role}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(m.joined_at).toLocaleDateString()}</span>
                  <Switch checked={m.is_active} onCheckedChange={() => handleToggleActive(m.id, m.is_active)} />
                  <Button size="sm" variant="ghost" onClick={() => handleRemoveMember(m.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {members.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No members yet</div>}
            </div>
          </div>
        )}

        {/* REQUESTS */}
        {activeTab === "requests" && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center">
                <UserPlus className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No pending requests</p>
              </div>
            ) : requests.map(r => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.student_name}</p>
                  {r.student_roll && <p className="text-xs text-muted-foreground">Roll: {r.student_roll}</p>}
                  {r.message && <p className="text-xs text-muted-foreground mt-1 italic">"{r.message}"</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApproveRequest(r)} className="bg-green-600 hover:bg-green-700 text-white h-8">
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleRejectRequest(r.id)} className="h-8">
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* EVENTS */}
        {activeTab === "events" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { setEditingEvent(null); setEventForm({ is_free: true }); setEventDate(undefined); setShowEventForm(true); }}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" /> Create Event
              </Button>
            </div>
            <div className="space-y-3">
              {events.map(ev => (
                <motion.div key={ev.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">{ev.name}</h4>
                      {!ev.is_active && <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive">Inactive</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {ev.date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(ev.date).toLocaleDateString()}</span>}
                      <span>{ev.registered_count || 0}/{ev.total_spots} registered</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={ev.is_active} onCheckedChange={() => handleToggleEventActive(ev.id, ev.is_active)} />
                    <Button size="sm" variant="outline" onClick={() => openEditEvent(ev)} className="h-8 text-xs">Edit</Button>
                  </div>
                </motion.div>
              ))}
              {events.length === 0 && (
                <div className="glass rounded-xl p-12 text-center">
                  <Calendar className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No events yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REGISTRATIONS */}
        {activeTab === "registrations" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <select className="bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground"
                value={regEventFilter} onChange={(e) => setRegEventFilter(e.target.value)}>
                <option value="all">All Events</option>
                {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="glass rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 p-4 border-b border-border/20 text-xs uppercase tracking-wider text-muted-foreground">
                <span>Student</span><span>Event</span><span>Date</span><span>Mode</span><span>Paid</span>
              </div>
              {(regEventFilter === "all" ? registrations : registrations.filter(r => r.event_id === regEventFilter)).map(r => (
                <div key={r.id} className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 p-4 border-b border-border/10 items-center">
                  <span className="text-sm text-foreground">{r.student_name}</span>
                  <span className="text-sm text-muted-foreground">{r.club_events?.name || "—"}</span>
                  <span className="text-xs text-muted-foreground">{new Date(r.registered_at).toLocaleDateString()}</span>
                  <Badge variant="outline" className="text-[10px]">{r.payment_mode}</Badge>
                  <Switch checked={r.paid} onCheckedChange={() => handleTogglePaid(r.id, r.paid)} />
                </div>
              ))}
              {registrations.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No registrations yet</div>}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 max-w-2xl space-y-6">
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-foreground">Club Settings</h3>
              <div className="space-y-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">Tagline</label>
                  <Input className={inputClass} value={settingsForm.tagline} onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Description</label>
                  <Textarea className={`${inputClass} min-h-[100px]`} value={settingsForm.description} onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Instagram</label>
                  <Input className={inputClass} value={settingsForm.instagram} onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">LinkedIn</label>
                  <Input className={inputClass} value={settingsForm.linkedin} onChange={(e) => setSettingsForm({ ...settingsForm, linkedin: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Focus Tags (comma separated)</label>
                  <Input className={inputClass} value={settingsForm.focus_tags} onChange={(e) => setSettingsForm({ ...settingsForm, focus_tags: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Advisor</label>
                  <Input className={inputClass} value={settingsForm.advisor} onChange={(e) => setSettingsForm({ ...settingsForm, advisor: e.target.value })} /></div>
              </div>
              <Button onClick={handleSaveSettings} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <Save className="h-4 w-4 mr-2" /> Save Settings
              </Button>
            </div>

            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 space-y-3">
              <h4 className="font-display text-base font-bold text-foreground">Transfer Leadership</h4>
              <p className="text-xs text-muted-foreground">
                Transfer the President role to another active member. Type TRANSFER to confirm.
              </p>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">New leader</label>
                <select
                  className="w-full bg-secondary/30 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground"
                  value={transferTargetUserId}
                  onChange={(e) => setTransferTargetUserId(e.target.value)}
                  disabled={transferring}
                >
                  <option value="">Select member</option>
                  {transferCandidates.map((m: any) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Type TRANSFER to confirm</label>
                <Input
                  className={inputClass}
                  value={transferConfirmText}
                  onChange={(e) => setTransferConfirmText(e.target.value)}
                  disabled={transferring}
                />
              </div>

              <Button
                variant="destructive"
                onClick={handleTransferLeadership}
                disabled={transferring || !transferTargetUserId}
              >
                {transferring ? "Transferring..." : "Transfer Leadership"}
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ADD MEMBER MODAL */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="glass border-border/40">
          <DialogHeader><DialogTitle className="font-display">Add Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className={`pl-10 ${inputClass}`} placeholder="Search student by name..." value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)} />
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {searchResults.map(p => (
                  <button key={p.user_id} onClick={() => { setSelectedProfile(p); setMemberSearch(p.full_name); setSearchResults([]); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-secondary/50 ${selectedProfile?.user_id === p.user_id ? "bg-primary/10 border border-primary/30" : ""}`}>
                    <span className="text-foreground">{p.full_name}</span>
                    {p.branch && <span className="text-xs text-muted-foreground ml-2">• {p.branch}</span>}
                  </button>
                ))}
              </div>
            )}
            <select className="w-full bg-secondary/30 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground"
              value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <Button onClick={handleAddMember} disabled={!selectedProfile}
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <UserPlus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* EVENT FORM MODAL */}
      <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
        <DialogContent className="glass border-border/40 max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editingEvent ? "Edit Event" : "Create Event"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground mb-1 block">Event Name</label>
              <Input className={inputClass} value={eventForm.name || ""} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <Textarea className={`${inputClass} min-h-[80px]`} value={eventForm.description || ""} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !eventDate && "text-muted-foreground")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    {eventDate ? format(eventDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker mode="single" selected={eventDate} onSelect={setEventDate} className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Time</label>
              <Input className={inputClass} type="time" value={eventForm.time || ""} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Location</label>
              <Input className={inputClass} value={eventForm.location || ""} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} /></div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Free Event?</label>
              <Switch checked={eventForm.is_free !== false} onCheckedChange={(v) => setEventForm({ ...eventForm, is_free: v })} />
            </div>
            {eventForm.is_free === false && (
              <div><label className="text-xs text-muted-foreground mb-1 block">Price (₹)</label>
                <Input className={inputClass} type="number" value={eventForm.price || ""} onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })} /></div>
            )}
            <div><label className="text-xs text-muted-foreground mb-1 block">Total Spots</label>
              <Input className={inputClass} type="number" value={eventForm.total_spots || ""} onChange={(e) => setEventForm({ ...eventForm, total_spots: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Banner Gradient</label>
              <div className="flex gap-2 flex-wrap">
                {GRADIENT_PRESETS.map(g => (
                  <button key={g} onClick={() => setEventForm({ ...eventForm, banner_gradient: g })}
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${g} border-2 transition-all ${eventForm.banner_gradient === g ? "border-accent scale-110" : "border-transparent"}`} />
                ))}
              </div>
            </div>
            <Button onClick={handleSaveEvent} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <Save className="h-4 w-4 mr-2" /> {editingEvent ? "Update" : "Create"} Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ClubLeaderDashboard;
