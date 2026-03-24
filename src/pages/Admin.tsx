import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, Trophy, Calendar, Megaphone, GitBranch,
  Search, Plus, Pencil, Trash2, Activity,
  Zap, X, ChevronRight, ChevronLeft, Layers, GraduationCap, Radio,
  Globe, MapPin, Tag, Star, Building2, ArrowLeftRight,
  Settings2, Save, ToggleLeft, LinkIcon, Bot, Loader2, Rocket,
  SlidersHorizontal, ArrowUpDown, Upload, Image as ImageIcon, Crop, Download, Gift, Flame, BarChart3, Eye, Sparkles,
} from "lucide-react";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import SiteAnalytics from "@/components/admin/SiteAnalytics";
import ImageCropper from "@/components/ImageCropper";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  useBranches, useUpsertBranch, useDeleteBranch,
  useStudents, useUpsertStudent, useDeleteStudent,
  useEvents, useUpsertEvent, useDeleteEvent,
  useAchievements, useUpsertAchievement, useDeleteAchievement,
  useAnnouncements, useUpsertAnnouncement, useDeleteAnnouncement,
  useHackathons, useUpsertHackathon, useDeleteHackathon,
  useClubs, useUpsertClub, useDeleteClub,
  useAlumni, useUpsertAlumni, useDeleteAlumni,
  useIEEEMembers, useUpsertIEEEMember, useDeleteIEEEMember,
  useAllCarouselSlides, useUpsertCarouselSlide, useDeleteCarouselSlide,
  useAllHackathonCarousel, useUpsertHackathonCarousel, useDeleteHackathonCarousel,
  useAllIEEECarousel, useUpsertIEEECarousel, useDeleteIEEECarousel,
  useAllIEEEConferences, useUpsertIEEEConference, useDeleteIEEEConference,
  useColleges, useUpsertCollege, useDeleteCollege, useCollegesRealtime,
  useFormSettings, useUpsertFormSetting,
  useAllBranchFeaturedStudents, useUpsertBranchFeaturedStudent, useDeleteBranchFeaturedStudent,
  useAllStartupCarousel, useUpsertStartupCarousel, useDeleteStartupCarousel,
  useAllDiscoverCarousel, useUpsertDiscoverCarousel, useDeleteDiscoverCarousel,
} from "@/hooks/use-supabase-data";
import { branchesData } from "@/data/branchesData";
import { useQueryClient } from "@tanstack/react-query";
import { scrapeHackathonUrl, discoverHackathons } from "@/utils/hackathonScraper";
import ClubDashboardSection from "@/components/admin/ClubDashboardSection";

const sidebarSections = [
  { label: "Colleges", icon: Building2, key: "colleges", superOnly: true },
  { label: "College Admins", icon: Shield, key: "college_admins", superOnly: true },
  { label: "Core Team", icon: Shield, key: "core_team", superOnly: true },
  { label: "Form Settings", icon: Settings2, key: "form_settings", superOnly: false },
  { label: "Students", icon: Users, key: "students" },
  { label: "Events", icon: Calendar, key: "events" },
  { label: "Achievements", icon: Trophy, key: "achievements" },
  { label: "Announcements", icon: Megaphone, key: "announcements" },
  { label: "Hackathons", icon: Globe, key: "hackathons" },
  { label: "Hack Carousel", icon: Star, key: "hackathon_carousel" },
  { label: "Clubs", icon: Layers, key: "clubs" },
  { label: "Club Dashboard", icon: Settings2, key: "club_dashboard" },
  { label: "Alumni", icon: GraduationCap, key: "alumni" },
  { label: "IEEE Members", icon: Radio, key: "ieee_members" },
  { label: "IEEE Carousel", icon: Star, key: "ieee_carousel" },
  { label: "IEEE Events", icon: Calendar, key: "ieee_conferences" },
  { label: "Carousel", icon: Star, key: "carousel_slides" },
  { label: "Startup Carousel", icon: Rocket, key: "startup_carousel" },
  { label: "Discover Carousel", icon: Sparkles, key: "discover_carousel" },
  { label: "Branch Stars", icon: Trophy, key: "branch_featured" },
  { label: "Rewards Store", icon: Gift, key: "rewards_store" },
  { label: "Analytics", icon: BarChart3, key: "analytics" },
  { label: "Site Analytics", icon: Eye, key: "site_analytics" },
] as const;

type SidebarItem = { label: string; icon: any; key: string };
type SidebarGroup = { groupLabel: string; icon: any; items: SidebarItem[] };

const groupedSidebar: (SidebarItem | SidebarGroup)[] = [
  { label: "Form Settings", icon: Settings2, key: "form_settings" },
  { label: "Students", icon: Users, key: "students" },
  { label: "Branch Stars", icon: Trophy, key: "branch_featured" },
  { label: "Events", icon: Calendar, key: "events" },
  { label: "Achievements", icon: Trophy, key: "achievements" },
  { label: "Announcements", icon: Megaphone, key: "announcements" },
  {
    groupLabel: "Hackathons", icon: Globe, items: [
      { label: "Hackathons", icon: Globe, key: "hackathons" },
      { label: "Hack Carousel", icon: Star, key: "hackathon_carousel" },
    ]
  },
  {
    groupLabel: "Clubs", icon: Layers, items: [
      { label: "Clubs", icon: Layers, key: "clubs" },
      { label: "Club Proposals", icon: Layers, key: "club_proposals" },
      { label: "Club Dashboard", icon: Settings2, key: "club_dashboard" },
    ]
  },
  { label: "Alumni", icon: GraduationCap, key: "alumni" },
  {
    groupLabel: "IEEE", icon: Radio, items: [
      { label: "Members", icon: Radio, key: "ieee_members" },
      { label: "Carousel", icon: Star, key: "ieee_carousel" },
      { label: "Events", icon: Calendar, key: "ieee_conferences" },
    ]
  },
  {
    groupLabel: "Carousels", icon: Star, items: [
      { label: "Home Carousel", icon: Star, key: "carousel_slides" },
      { label: "Startup Carousel", icon: Rocket, key: "startup_carousel" },
      { label: "Discover Carousel", icon: Sparkles, key: "discover_carousel" },
    ]
  },
  {
    groupLabel: "Gamification", icon: Flame, items: [
      { label: "Rewards Store", icon: Gift, key: "rewards_store" },
      { label: "XP Analytics", icon: BarChart3, key: "analytics" },
      { label: "Site Analytics", icon: Eye, key: "site_analytics" },
    ]
  },
];

type Section = (typeof sidebarSections)[number]["key"];

const FormDialog = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
  <AnimatePresence>
    {open && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg glass rounded-2xl p-6 shadow-2xl border border-border/50 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
            <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50">
              <X className="h-4 w-4" />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="mb-4">
    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
    {children}
  </div>
);

const inputClass = "bg-secondary/40 border-border/30 rounded-xl text-sm h-10";
const selectClass = "bg-secondary/40 border border-border/30 rounded-xl text-sm h-10 w-full px-3 text-foreground";

const Admin = () => {
  const [section, setSection] = useState<Section>("students");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [branchFilter, setBranchFilter] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentSort, setStudentSort] = useState<"name" | "xp" | "year">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showAllBranches, setShowAllBranches] = useState(false);
  const branchScrollRef = useRef<HTMLDivElement>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const { toast } = useToast();
  const { isSuperAdmin, activeCollegeId, setActiveCollegeId, profile, user } = useAuth();

  useCollegesRealtime();
  const { data: colleges = [] } = useColleges();
  const { data: branches = [], isLoading: branchesLoading } = useBranches();

  // Auto-initialize activeCollegeId when colleges load and it's not set
  useEffect(() => {
    if (isSuperAdmin && !activeCollegeId && colleges.length > 0) {
      setActiveCollegeId(colleges[0].id);
    }
  }, [isSuperAdmin, activeCollegeId, colleges, setActiveCollegeId]);
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: achievements = [], isLoading: achievementsLoading } = useAchievements();
  const { data: announcements = [], isLoading: announcementsLoading } = useAnnouncements();
  const { data: hackathons = [], isLoading: hackathonsLoading } = useHackathons();
  const { data: clubs = [], isLoading: clubsLoading } = useClubs();
  const { data: alumni = [], isLoading: alumniLoading } = useAlumni();
  const { data: ieeeMembers = [], isLoading: ieeeLoading } = useIEEEMembers();
  const { data: carouselSlides = [], isLoading: carouselLoading } = useAllCarouselSlides();
  const { data: hackCarousel = [], isLoading: hackCarouselLoading } = useAllHackathonCarousel();
  const { data: ieeeCarousel = [], isLoading: ieeeCarouselLoading } = useAllIEEECarousel();
  const { data: ieeeConferences = [], isLoading: ieeeConfLoading } = useAllIEEEConferences();
  const { data: branchFeatured = [], isLoading: branchFeaturedLoading } = useAllBranchFeaturedStudents();
  const { data: startupCarousel = [], isLoading: startupCarouselLoading } = useAllStartupCarousel();
  const { data: discoverCarousel = [], isLoading: discoverCarouselLoading } = useAllDiscoverCarousel();

  // Rewards store state
  const [rewardsStore, setRewardsStore] = useState<any[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const fetchRewards = async () => {
    setRewardsLoading(true);
    const { data } = await supabase.from("rewards").select("*").order("xp_cost");
    setRewardsStore(data || []);
    setRewardsLoading(false);
  };
  useEffect(() => { if (section === "rewards_store") fetchRewards(); }, [section]);

  // Auto-seed: If the DB branches table is empty for this college, populate it from branchesData
  const branchesSeeded = useRef(false);
  const queryClient = useQueryClient();
  useEffect(() => {
    const seedBranches = async () => {
      if (branchesLoading || !activeCollegeId || branchesSeeded.current) return;
      if (branches && branches.length > 0) return; // Already populated
      branchesSeeded.current = true;
      
      console.log("[Auto-Seed] Starting branch seed for college:", activeCollegeId);
      let successCount = 0;
      let failCount = 0;
      
      for (const b of branchesData) {
        const slug = b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        // Check if this branch already exists for this college before inserting
        const { data: existing } = await supabase
          .from("branches")
          .select("id")
          .eq("college_id", activeCollegeId)
          .eq("name", b.name)
          .maybeSingle();
        if (existing) {
          // Already exists, skip
          continue;
        }
        const { error } = await supabase.from("branches").insert({
          name: b.name,
          slug: `${slug}-${activeCollegeId!.slice(0, 8)}`,
          college_id: activeCollegeId,
        });
        if (error) {
          console.error(`[Auto-Seed] Failed to insert "${b.name}":`, error.message);
          failCount++;
        } else {
          successCount++;
        }
      }
      
      console.log(`[Auto-Seed] Done: ${successCount} succeeded, ${failCount} failed`);
      
      if (successCount > 0) {
        toast({ title: "Branches auto-populated!", description: `${successCount} branches added to your college.` });
      } else if (failCount > 0) {
        toast({ title: "Branch seed failed", description: "Check browser console for RLS or permission errors.", variant: "destructive" });
      }
      
      // Force React Query to refetch branches
      await queryClient.invalidateQueries({ queryKey: ["branches"] });
    };
    seedBranches();
  }, [branches, branchesLoading, activeCollegeId]);

  // Use branchesData as the source for filter chips (global, not per-college)
  const displayBranches = branchesData.map((b) => ({
    id: b.slug,
    name: b.name,
    slug: b.slug,
  }));

  const { data: formSettingsData = [] } = useFormSettings(activeCollegeId);
  const upsertFormSetting = useUpsertFormSetting();

  // Form settings state
  const defaultFormConfig = {
    show_photo: true, show_bio: true, show_alumni: true,
    show_company: true, show_company_type: true,
    show_skills: true, show_branch: true, show_sub_branch: true,
    show_year: true, max_skills: 8,
    enabled_branches: branchesData.map(b => b.name),
    enabled_sub_branches: branchesData.reduce((acc, b) => {
      acc[b.name] = b.subBranches.map(sb => sb.name);
      return acc;
    }, {} as Record<string, string[]>),
  };
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
  const [formConfig, setFormConfig] = useState(defaultFormConfig);
  const [formConfigDirty, setFormConfigDirty] = useState(false);

  useEffect(() => {
    const setting = formSettingsData.find((s: any) => s.setting_key === "signup_form");
    if (setting) {
      setFormConfig({ ...defaultFormConfig, ...(setting as any).setting_value });
    }
  }, [formSettingsData]);

  const saveFormConfig = async () => {
    try {
      await upsertFormSetting.mutateAsync({
        college_id: activeCollegeId,
        setting_key: "signup_form",
        setting_value: formConfig,
      });
      toast({ title: "Form settings saved!" });
      setFormConfigDirty(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const updateFormConfig = (key: string, value: any) => {
    setFormConfig(prev => ({ ...prev, [key]: value }));
    setFormConfigDirty(true);
  };

  const upsertBranch = useUpsertBranch();
  const deleteBranch = useDeleteBranch();
  const upsertStudent = useUpsertStudent();
  const deleteStudent = useDeleteStudent();
  const upsertEvent = useUpsertEvent();
  const deleteEvent = useDeleteEvent();
  const upsertAchievement = useUpsertAchievement();
  const deleteAchievement = useDeleteAchievement();
  const upsertAnnouncement = useUpsertAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const upsertHackathon = useUpsertHackathon();
  const deleteHackathon = useDeleteHackathon();
  const upsertClub = useUpsertClub();
  const deleteClub = useDeleteClub();
  const upsertAlumni = useUpsertAlumni();
  const deleteAlumni = useDeleteAlumni();
  const upsertIEEEMember = useUpsertIEEEMember();
  const deleteIEEEMember = useDeleteIEEEMember();
  const upsertCarouselSlide = useUpsertCarouselSlide();
  const deleteCarouselSlide = useDeleteCarouselSlide();
  const upsertHackCarousel = useUpsertHackathonCarousel();
  const deleteHackCarousel = useDeleteHackathonCarousel();
  const upsertIEEECarouselMut = useUpsertIEEECarousel();
  const deleteIEEECarouselMut = useDeleteIEEECarousel();
  const upsertIEEEConf = useUpsertIEEEConference();
  const deleteIEEEConf = useDeleteIEEEConference();
  const upsertCollege = useUpsertCollege();
  const deleteCollegeMut = useDeleteCollege();
  const upsertBranchFeatured = useUpsertBranchFeaturedStudent();
  const deleteBranchFeatured = useDeleteBranchFeaturedStudent();
  const upsertStartupCarouselMut = useUpsertStartupCarousel();
  const deleteStartupCarouselMut = useDeleteStartupCarousel();
  const upsertDiscoverCarouselMut = useUpsertDiscoverCarousel();
  const deleteDiscoverCarouselMut = useDeleteDiscoverCarousel();

  const [form, setForm] = useState<Record<string, any>>({});
  const [discovering, setDiscovering] = useState(false);
  const [clubPresidentQuery, setClubPresidentQuery] = useState("");
  const [clubPresidentResults, setClubPresidentResults] = useState<any[]>([]);
  const [clubVicePresidentQuery, setClubVicePresidentQuery] = useState("");
  const [clubVicePresidentResults, setClubVicePresidentResults] = useState<any[]>([]);
  

  // College Admins management
  const [collegeAdmins, setCollegeAdmins] = useState<any[]>([]);
  const [collegeAdminsLoading, setCollegeAdminsLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [assigningAdmin, setAssigningAdmin] = useState(false);

  // Core Team management
  const [coreTeamMembers, setCoreTeamMembers] = useState<any[]>([]);
  const [coreTeamLoading, setCoreTeamLoading] = useState(false);
  const [coreTeamQuery, setCoreTeamQuery] = useState("");
  const [coreTeamSearchResults, setCoreTeamSearchResults] = useState<any[]>([]);
  const [coreTeamSelectedUserId, setCoreTeamSelectedUserId] = useState<string>("");
  const [assigningCoreTeam, setAssigningCoreTeam] = useState(false);
  const [revokingCoreTeamId, setRevokingCoreTeamId] = useState<string | null>(null);

  // Club proposals management
  const [clubProposals, setClubProposals] = useState<any[]>([]);
  const [clubProposalsLoading, setClubProposalsLoading] = useState(false);
  const [proposalBusyId, setProposalBusyId] = useState<string | null>(null);
  const [proposalRejectReason, setProposalRejectReason] = useState<Record<string, string>>({});

  const fetchCoreTeam = async () => {
    if (!activeCollegeId) return;
    setCoreTeamLoading(true);
    try {
      const { data: roles, error: rErr } = await supabase
        .from("user_roles")
        .select("id, user_id, role, college_id")
        .eq("role", "core_team" as any)
        .eq("college_id", activeCollegeId);
      if (rErr) throw rErr;

      const userIds = (roles || []).map((r: any) => r.user_id);
      let profilesMap: Record<string, any> = {};
      let studentsMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles, error: pErr } = await supabase
          .from("profiles")
          .select("user_id, full_name, photo_url, branch")
          .in("user_id", userIds);
        if (pErr) throw pErr;
        (profiles || []).forEach((p: any) => { profilesMap[p.user_id] = p; });

        const { data: students, error: sErr } = await supabase
          .from("students")
          .select("id, name, email, avatar_url, branch_name, main_branch:main_branch_id(name), specialization:specialization_id(name)")
          .eq("college_id", activeCollegeId)
          .in("id", userIds);
        if (sErr) throw sErr;
        (students || []).forEach((s: any) => { studentsMap[s.id] = s; });
      }
      const enriched = (roles || []).map((r: any) => ({
        ...r,
        profile: profilesMap[r.user_id] || null,
        student: studentsMap[r.user_id] || null,
        display_name: profilesMap[r.user_id]?.full_name || studentsMap[r.user_id]?.name || "Unknown User",
        display_branch:
          profilesMap[r.user_id]?.branch ||
          studentsMap[r.user_id]?.specialization?.name ||
          studentsMap[r.user_id]?.main_branch?.name ||
          studentsMap[r.user_id]?.branch_name ||
          null,
        display_avatar: profilesMap[r.user_id]?.photo_url || studentsMap[r.user_id]?.avatar_url || null,
      }));
      setCoreTeamMembers(enriched);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to load core team.", variant: "destructive" });
    } finally {
      setCoreTeamLoading(false);
    }
  };

  const fetchClubProposals = async () => {
    if (!activeCollegeId) return;
    setClubProposalsLoading(true);
    try {
      const { data, error } = await supabase
        .from("club_proposals")
        .select("*")
        .eq("college_id", activeCollegeId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setClubProposals(data || []);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to load proposals.", variant: "destructive" });
    } finally {
      setClubProposalsLoading(false);
    }
  };

  useEffect(() => {
    if (section === "core_team" && isSuperAdmin) fetchCoreTeam();
    if (section === "club_proposals") fetchClubProposals();
  }, [section, isSuperAdmin, activeCollegeId]);

  useEffect(() => {
    if (section !== "core_team") return;
    if (!activeCollegeId) return;
    if (coreTeamQuery.trim().length < 2) {
      setCoreTeamSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const q = coreTeamQuery.trim();
      const { data, error } = await supabase
        .from("students")
        .select("id, name, email, branch_name, main_branch:main_branch_id(name), specialization:specialization_id(name)")
        .eq("college_id", activeCollegeId)
        .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
        .limit(8);

      if (error) {
        setCoreTeamSearchResults([]);
        return;
      }

      const assignedIds = new Set((coreTeamMembers || []).map((m: any) => m.user_id));
      const normalized = (data || [])
        .filter((s: any) => !assignedIds.has(s.id))
        .map((s: any) => ({
          user_id: s.id,
          full_name: s.name || "Unknown",
          email: s.email || "",
          branch: s.specialization?.name || s.main_branch?.name || s.branch_name || "",
        }));

      setCoreTeamSearchResults(normalized);
    }, 250);
    return () => clearTimeout(t);
  }, [coreTeamQuery, section, activeCollegeId, coreTeamMembers]);

  const handleAssignCoreTeam = async () => {
    if (!activeCollegeId || !coreTeamSelectedUserId) {
      toast({ title: "Select a user", variant: "destructive" });
      return;
    }
    setAssigningCoreTeam(true);
    try {
      const { error } = await supabase.from("user_roles").insert({
        user_id: coreTeamSelectedUserId,
        role: "core_team" as any,
        college_id: activeCollegeId,
      });
      if (error && error.code !== "23505") throw error;
      toast({ title: "Core team assigned" });
      setCoreTeamSelectedUserId("");
      setCoreTeamQuery("");
      setCoreTeamSearchResults([]);
      fetchCoreTeam();
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to assign.", variant: "destructive" });
    } finally {
      setAssigningCoreTeam(false);
    }
  };

  const handleRevokeCoreTeam = async (roleRowId: string) => {
    if (!window.confirm("Revoke core team role for this user?")) return;
    setRevokingCoreTeamId(roleRowId);
    try {
      const { error } = await supabase.from("user_roles").delete().eq("id", roleRowId);
      if (error) throw error;
      toast({ title: "Revoked" });
      fetchCoreTeam();
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to revoke.", variant: "destructive" });
    } finally {
      setRevokingCoreTeamId(null);
    }
  };

  const handleApproveProposalAdmin = async (proposalId: string) => {
    if (proposalBusyId) return;
    setProposalBusyId(proposalId);
    try {
      const { data, error } = await supabase.rpc("approve_club_proposal", { p_proposal_id: proposalId });
      if (error) throw error;
      const payload = data as any;
      if (!payload?.success && payload?.status === "already_processed") {
        toast({ title: "Already processed", description: `Current status: ${payload.current_status}` });
      } else if (payload?.success) {
        toast({ title: "Approved" });
      } else {
        toast({ title: "Approval failed", description: "Unexpected response.", variant: "destructive" });
      }
      fetchClubProposals();
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Approval failed.", variant: "destructive" });
    } finally {
      setProposalBusyId(null);
    }
  };

  const handleRejectProposalAdmin = async (proposalId: string) => {
    if (proposalBusyId) return;
    const reason = (proposalRejectReason[proposalId] || "").trim();
    if (!reason) {
      toast({ title: "Reason required", description: "Enter a rejection reason.", variant: "destructive" });
      return;
    }
    setProposalBusyId(proposalId);
    try {
      const { data, error } = await supabase.rpc("reject_club_proposal", { p_proposal_id: proposalId, p_reason: reason });
      if (error) throw error;
      const payload = data as any;
      if (!payload?.success && payload?.status === "already_processed") {
        toast({ title: "Already processed", description: `Current status: ${payload.current_status}` });
      } else if (payload?.success) {
        toast({ title: "Rejected" });
      } else {
        toast({ title: "Rejection failed", description: "Unexpected response.", variant: "destructive" });
      }
      fetchClubProposals();
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Rejection failed.", variant: "destructive" });
    } finally {
      setProposalBusyId(null);
    }
  };

  const handleSuspendClub = async (clubId: string) => {
    if (!window.confirm("Suspend this club? It will be marked inactive.")) return;
    try {
      const { error } = await supabase.from("clubs").update({ is_active: false }).eq("id", clubId);
      if (error) throw error;
      toast({ title: "Club suspended" });
      await queryClient.invalidateQueries({ queryKey: ["clubs"] });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to suspend.", variant: "destructive" });
    }
  };

  const fetchCollegeAdmins = async () => {
    setCollegeAdminsLoading(true);
    try {
      // Fetch assigned admins from user_roles filtered by active college
      const rolesQuery = supabase
        .from("user_roles")
        .select("*")
        .eq("role", "college_admin" as any);
      if (activeCollegeId) rolesQuery.eq("college_id", activeCollegeId);
      const { data: roles } = await rolesQuery;
      
      // Fetch pending invites filtered by active college
      const invitesQuery = supabase
        .from("pending_admin_invites" as any)
        .select("*")
        .eq("status", "pending");
      if (activeCollegeId) invitesQuery.eq("college_id", activeCollegeId);
      const { data: invites } = await invitesQuery;

      // Fetch profiles for assigned admins
      const userIds = (roles || []).map((r: any) => r.user_id);
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, photo_url, branch")
          .in("user_id", userIds);
        (profiles || []).forEach((p: any) => { profilesMap[p.user_id] = p; });
      }

      // Fetch accepted invites to get emails for assigned admins (keyed by college_id)
      const { data: acceptedInvites } = await supabase
        .from("pending_admin_invites" as any)
        .select("email, college_id, status");
      // Build a lookup: find email for each user_id by matching against accepted invites
      const allInvitesList = (acceptedInvites as any[]) || [];

      // Enrich roles with college names and profile info
      const enrichedRoles = (roles || []).map((r: any) => {
        const col = colleges.find((c: any) => c.id === r.college_id);
        const prof = profilesMap[r.user_id];
        // Find matching invite email for this college
        const matchingInvite = allInvitesList.find((inv: any) => inv.college_id === r.college_id && inv.status === "accepted");
        const adminEmail = matchingInvite?.email || null;
        const displayName = prof?.full_name || adminEmail || "Unknown User";
        return { ...r, college_name: col?.name || "Unknown", type: "assigned", profile_name: displayName, profile_photo: prof?.photo_url || null, profile_branch: prof?.branch || null, admin_email: adminEmail };
      });

      // Enrich invites
      const enrichedInvites = ((invites as any[]) || []).map((inv: any) => {
        const col = colleges.find((c: any) => c.id === inv.college_id);
        return { ...inv, college_name: col?.name || "Unknown", type: "pending" };
      });

      setCollegeAdmins([...enrichedRoles, ...enrichedInvites]);
    } catch (e) {
      console.error("Failed to fetch college admins", e);
    }
    setCollegeAdminsLoading(false);
  };

  useEffect(() => {
    if (section === "college_admins" && isSuperAdmin) fetchCollegeAdmins();
  }, [section, isSuperAdmin, colleges, activeCollegeId]);

  const handleAssignCollegeAdmin = async () => {
    if (!adminEmail.trim() || !activeCollegeId) {
      toast({ title: !activeCollegeId ? "Select a college first" : "Enter an email", variant: "destructive" });
      return;
    }
    setAssigningAdmin(true);
    try {
      const email = adminEmail.trim().toLowerCase();
      const activeCol = colleges.find((c: any) => c.id === activeCollegeId);
      const collegeName = activeCol?.name || "your college";

      // Frontend 3-admin limit check (count pending + accepted invites for this college)
      const { count: adminCount, error: countErr } = await supabase
        .from("pending_admin_invites" as any)
        .select("*", { count: "exact", head: true })
        .eq("college_id", activeCollegeId)
        .in("status", ["pending", "accepted"]);

      if (countErr) throw countErr;

      if ((adminCount || 0) >= 3) {
        toast({
          title: "Maximum 3 college admins allowed per college",
          description: `${collegeName} already has ${adminCount} admin(s). Remove an existing admin first.`,
          variant: "destructive",
        });
        setAssigningAdmin(false);
        return;
      }

      // Call the invite-admin edge function
      const { data: fnData, error: fnError } = await supabase.functions.invoke("invite-admin", {
        body: { email, college_id: activeCollegeId, college_name: collegeName },
      });

      if (fnError) throw fnError;

      // The edge function returns { error: "..." } on validation failures
      if (fnData?.error) {
        toast({ title: "Error", description: fnData.error, variant: "destructive" });
        setAssigningAdmin(false);
        return;
      }

      const successMsg = fnData?.already_registered
        ? `${email} already has an account — assigned as college admin directly.`
        : `Invite sent to ${email}. They'll receive an email with instructions to set up their admin account for ${collegeName}.`;

      toast({ title: "✅ Success!", description: successMsg });
      setAdminEmail("");
      fetchCollegeAdmins();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setAssigningAdmin(false);
  };

  const handleRemoveCollegeAdmin = async (roleId: string, type: string, adminEmail?: string, collegeId?: string) => {
    const confirmMsg = type === "pending"
      ? "Are you sure you want to revoke this pending invite?"
      : "Are you sure you want to remove this college admin? They will immediately lose admin access.";
    if (!window.confirm(confirmMsg)) return;

    try {
      if (type === "pending") {
        // Mark the pending invite as rejected (preserve the row for history)
        const { error } = await supabase
          .from("pending_admin_invites" as any)
          .update({ status: "rejected", updated_at: new Date().toISOString() })
          .eq("id", roleId);
        if (error) throw error;
      } else {
        // Remove the user_role so they lose admin access immediately
        const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
        if (error) throw error;
        // Mark the corresponding invite as rejected (preserve the row)
        if (adminEmail && collegeId) {
          await supabase
            .from("pending_admin_invites" as any)
            .update({ status: "rejected", updated_at: new Date().toISOString() })
            .eq("email", adminEmail.toLowerCase())
            .eq("college_id", collegeId);
        }
      }
      toast({ title: type === "pending" ? "Invite revoked" : "College admin removed" });
      fetchCollegeAdmins();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };


  const handleExportStudents = async () => {
    try {
      // Fetch profiles for the current college with all details
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("full_name, branch, year_of_study, is_alumni, company, company_type, skills, bio, gender, created_at, user_id, college_id")
        .eq("college_id", activeCollegeId!);
      if (error) throw error;

      // Get emails from students table (synced from auth)
      const { data: studentEmails } = await supabase
        .from("students")
        .select("id, email")
        .or(`college_id.eq.${activeCollegeId},college_id.is.null`);
      const emailMap = new Map((studentEmails || []).map(s => [s.id, s.email]));

      const rows = (profiles || []).map((p, i) => ({
        "S.No": i + 1,
        "Full Name": p.full_name || "-",
        "Email": emailMap.get(p.user_id) || "-",
        "Branch": p.branch || "-",
        "Year": p.year_of_study || "-",
        "Alumni": p.is_alumni ? "Yes" : "No",
        "Company": p.company || "-",
        "Company Type": p.company_type || "-",
        "Gender": p.gender || "-",
        "Skills": (p.skills || []).join(", "),
        "Bio": p.bio || "-",
        "Joined At": p.created_at ? new Date(p.created_at).toLocaleString("en-IN") : "-",
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students");
      // Auto-size columns
      ws["!cols"] = Object.keys(rows[0] || {}).map(() => ({ wch: 20 }));
      XLSX.writeFile(wb, `Students_${new Date().toISOString().slice(0,10)}.xlsx`);
      toast({ title: "✅ Excel exported!", description: `${rows.length} students exported.` });
    } catch (e: any) {
      toast({ title: "Export failed", description: e.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!formOpen || section !== "clubs" || !activeCollegeId) return;
    if (clubPresidentQuery.trim().length < 2) {
      setClubPresidentResults([]);
      return;
    }

    const t = setTimeout(async () => {
      const q = clubPresidentQuery.trim();
      const { data, error } = await supabase
        .from("students")
        .select("id, name, email, branch_name")
        .eq("college_id", activeCollegeId)
        .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
        .limit(8);

      if (error) {
        setClubPresidentResults([]);
        return;
      }

      const filtered = (data || []).filter((s: any) => s.id !== form.vice_president_user_id);
      setClubPresidentResults(filtered);
    }, 250);

    return () => clearTimeout(t);
  }, [clubPresidentQuery, formOpen, section, activeCollegeId, form.vice_president_user_id]);

  useEffect(() => {
    if (!formOpen || section !== "clubs" || !activeCollegeId) return;
    if (clubVicePresidentQuery.trim().length < 2) {
      setClubVicePresidentResults([]);
      return;
    }

    const t = setTimeout(async () => {
      const q = clubVicePresidentQuery.trim();
      const { data, error } = await supabase
        .from("students")
        .select("id, name, email, branch_name")
        .eq("college_id", activeCollegeId)
        .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
        .limit(8);

      if (error) {
        setClubVicePresidentResults([]);
        return;
      }

      const filtered = (data || []).filter((s: any) => s.id !== form.president_user_id);
      setClubVicePresidentResults(filtered);
    }, 250);

    return () => clearTimeout(t);
  }, [clubVicePresidentQuery, formOpen, section, activeCollegeId, form.president_user_id]);

  const openCreate = () => {
    setEditId(null);
    setForm({ is_active: true });
    setClubPresidentQuery("");
    setClubPresidentResults([]);
    setClubVicePresidentQuery("");
    setClubVicePresidentResults([]);
    setFormOpen(true);
  };

  const openEdit = async (id: string, data: Record<string, any>) => { 
    const extra: Record<string, any> = {};
    if (data.social_links) {
      if (data.social_links.company) extra.company = data.social_links.company;
      if (data.social_links.company_type) extra.company_type = data.social_links.company_type;
    }

    if (section === "clubs") {
      const { data: leadershipRows } = await supabase
        .from("club_members")
        .select("user_id, name, role, is_active")
        .eq("club_id", id)
        .in("role", ["President", "Vice President"])
        .eq("is_active", true);

      const president = (leadershipRows || []).find((r: any) => r.role === "President");
      const vicePresident = (leadershipRows || []).find((r: any) => r.role === "Vice President");

      extra.president_user_id = president?.user_id || "";
      extra.president_name = president?.name || "";
      extra.vice_president_user_id = vicePresident?.user_id || "";
      extra.vice_president_name = vicePresident?.name || "";
    }

    setEditId(id);
    setForm({ ...data, ...extra, id });
    setClubPresidentQuery("");
    setClubPresidentResults([]);
    setClubVicePresidentQuery("");
    setClubVicePresidentResults([]);
    setFormOpen(true); 
  };

  const handleDiscoverHackathons = async () => {
    setDiscovering(true);
    try {
      const discovered = await discoverHackathons();
      if (discovered.length === 0) {
        toast({ title: "No hackathons found", description: "Try again later or add manually.", variant: "destructive" });
        return;
      }
      
      // Insert discovered hackathons into DB, skip duplicates by title
      const existingTitles = new Set((hackathons || []).map((h: any) => h.title?.toLowerCase()));
      let inserted = 0;
      let failed = 0;
      let skipped = 0;
      const newTitles: string[] = [];
      let lastError = "";
      
      for (const h of discovered) {
        if (existingTitles.has(h.title.toLowerCase())) {
          skipped++;
          continue;
        }
        const { error } = await supabase.from("hackathons").insert({
          title: h.title,
          tagline: h.tagline,
          date: h.date || null,
          location: h.location,
          prize: h.prize,
          status: h.status || "upcoming",
          tags: h.tags,
          link: h.link,
          gradient: h.gradient || "from-primary to-purple-400",
          icon: h.icon || "globe",
          participants: h.participants || 0,
          max_participants: h.max_participants || 100,
          college_id: activeCollegeId,
        });
        if (!error) {
          inserted++;
          newTitles.push(h.title);
        } else {
          failed++;
          lastError = error.message;
          console.error(`[Discover] Failed to insert "${h.title}":`, error.message, error);
        }
      }
      
      if (inserted > 0) {
        toast({ title: `🤖 Discovered ${inserted} new hackathons!`, description: newTitles.slice(0, 3).join(", ") + (newTitles.length > 3 ? `... +${newTitles.length - 3} more` : "") });
        await queryClient.invalidateQueries({ queryKey: ["hackathons"] });
      } else if (failed > 0) {
        toast({ title: `Insert failed for ${failed} hackathons`, description: `Error: ${lastError}. Check if RLS policies allow inserts for this college.`, variant: "destructive" });
      } else if (skipped > 0) {
        toast({ title: "All duplicates", description: `All ${skipped} discovered hackathons already exist.` });
      } else {
        toast({ title: "No new hackathons", description: `Found ${discovered.length} but none could be inserted.`, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Discovery failed", description: e.message, variant: "destructive" });
    } finally {
      setDiscovering(false);
    }
  };

  const deleteMutations: Record<Section, any> = {
    colleges: deleteCollegeMut,
    college_admins: { mutateAsync: async () => {} },
    club_dashboard: { mutateAsync: async () => {} },
    form_settings: { mutateAsync: async () => {} },
    students: deleteStudent, events: deleteEvent,
    achievements: deleteAchievement, announcements: deleteAnnouncement,
    hackathons: deleteHackathon, clubs: deleteClub, alumni: deleteAlumni, ieee_members: deleteIEEEMember,
    carousel_slides: deleteCarouselSlide, hackathon_carousel: deleteHackCarousel, ieee_carousel: deleteIEEECarouselMut,
    ieee_conferences: deleteIEEEConf,
    branch_featured: deleteBranchFeatured,
    startup_carousel: deleteStartupCarouselMut,
    discover_carousel: deleteDiscoverCarouselMut,
    rewards_store: { mutateAsync: async (id: string) => { await supabase.from("rewards").delete().eq("id", id); fetchRewards(); } },
    analytics: { mutateAsync: async () => {} },
    site_analytics: { mutateAsync: async () => {} },
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutations[section].mutateAsync(id);
      toast({ title: "Deleted successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const setF = (key: string, val: any) => setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    try {
      const base = editId ? { id: editId } : {};
      if (section === "colleges") {
        await upsertCollege.mutateAsync({ ...base, name: form.name || "", domain: (form.domain || "").replace(/^@+/, ""), city: form.city || null, state: form.state || null, logo_url: form.logo_url || null });
      } else if (section === "students") {
        await upsertStudent.mutateAsync({ ...base, name: form.name || "", email: form.email || null, branch_id: form.branch_id || null, graduation_year: form.graduation_year ? Number(form.graduation_year) : null, bio: form.bio || null, skills: form.skills ? (typeof form.skills === "string" ? form.skills.split(",").map((s: string) => s.trim()) : form.skills) : [], status: form.status || "active", is_topper: form.is_topper === "true" || form.is_topper === true, xp_points: form.xp_points ? Number(form.xp_points) : 0, social_links: { company: form.company || null, company_type: form.company_type || null } });
      } else if (section === "events") {
        await upsertEvent.mutateAsync({ ...base, title: form.title || "", description: form.description || null, event_type: form.event_type || "general", branch_id: form.branch_id || null, date: form.date || null, location: form.location || null, status: form.status || "upcoming", is_featured: form.is_featured === "true" || form.is_featured === true });
      } else if (section === "achievements") {
        await upsertAchievement.mutateAsync({ ...base, student_id: form.student_id || "", title: form.title || "", description: form.description || null, achievement_type: form.achievement_type || "general" });
      } else if (section === "announcements") {
        await upsertAnnouncement.mutateAsync({ ...base, title: form.title || "", content: form.content || null, priority: form.priority || "normal", branch_id: form.branch_id || null, is_pinned: form.is_pinned === "true" || form.is_pinned === true });
      } else if (section === "hackathons") {
        await upsertHackathon.mutateAsync({ ...base, title: form.title || "", tagline: form.tagline || null, date: form.date || null, end_date: form.end_date || null, location: form.location || null, participants: form.participants ? Number(form.participants) : 0, max_participants: form.max_participants ? Number(form.max_participants) : 100, prize: form.prize || null, status: form.status || "upcoming", tags: form.tags ? (typeof form.tags === "string" ? form.tags.split(",").map((s: string) => s.trim()) : form.tags) : [], gradient: form.gradient || "from-primary to-purple-400", icon: form.icon || "globe", link: form.link || null });
      } else if (section === "clubs") {
        if (form.president_user_id && form.vice_president_user_id && form.president_user_id === form.vice_president_user_id) {
          toast({ title: "Invalid leadership selection", description: "President and Vice President must be different students.", variant: "destructive" });
          return;
        }

        const savedClub = await upsertClub.mutateAsync({ ...base, name: form.name || "", slug: form.slug || form.name?.toLowerCase().replace(/\s+/g, "-") || "", category: form.category || "Technical", description: form.description || null, tagline: form.tagline || null, members: form.members ? Number(form.members) : 0, founded: form.founded ? Number(form.founded) : null, next_event: form.next_event || null, next_event_price: form.next_event_price ? Number(form.next_event_price) : null, banner_gradient: form.banner_gradient || "from-blue-600/40 to-primary/30", logo_letter: form.logo_letter || form.name?.charAt(0) || "C", focus_tags: form.focus_tags ? (typeof form.focus_tags === "string" ? form.focus_tags.split(",").map((s: string) => s.trim()) : form.focus_tags) : [], advisor: form.advisor || null, instagram: form.instagram || null, linkedin: form.linkedin || null, is_active: form.is_active !== false });

        // Keep exactly one active President and one active Vice President per club (if selected).
        await supabase
          .from("club_members")
          .update({ role: "Member" })
          .eq("club_id", savedClub.id)
          .eq("role", "President")
          .neq("user_id", form.president_user_id || "00000000-0000-0000-0000-000000000000");

        await supabase
          .from("club_members")
          .update({ role: "Member" })
          .eq("club_id", savedClub.id)
          .eq("role", "Vice President")
          .neq("user_id", form.vice_president_user_id || "00000000-0000-0000-0000-000000000000");

        if (form.president_user_id) {
          const payload = {
            club_id: savedClub.id,
            user_id: form.president_user_id,
            name: form.president_name || "Unknown",
            role: "President",
            avatar_initials: (form.president_name || "??").substring(0, 2).toUpperCase(),
            added_by: user?.id || null,
            college_id: activeCollegeId || savedClub.college_id,
            is_active: true,
          };
          await supabase.from("club_members").upsert(payload, { onConflict: "club_id,user_id" });
        } else {
          await supabase
            .from("club_members")
            .update({ role: "Member" })
            .eq("club_id", savedClub.id)
            .eq("role", "President");
        }

        if (form.vice_president_user_id) {
          const payload = {
            club_id: savedClub.id,
            user_id: form.vice_president_user_id,
            name: form.vice_president_name || "Unknown",
            role: "Vice President",
            avatar_initials: (form.vice_president_name || "??").substring(0, 2).toUpperCase(),
            added_by: user?.id || null,
            college_id: activeCollegeId || savedClub.college_id,
            is_active: true,
          };
          await supabase.from("club_members").upsert(payload, { onConflict: "club_id,user_id" });
        } else {
          await supabase
            .from("club_members")
            .update({ role: "Member" })
            .eq("club_id", savedClub.id)
            .eq("role", "Vice President");
        }
      } else if (section === "alumni") {
        await upsertAlumni.mutateAsync({ ...base, name: form.name || "", batch: form.batch || null, department: form.department || null, avatar: form.avatar || form.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2) || "AA", role: form.role || null, company: form.company || null, location: form.location || null, linkedin: form.linkedin || null, specialization: form.specialization || null, achievements: form.achievements ? (typeof form.achievements === "string" ? form.achievements.split(",").map((s: string) => s.trim()) : form.achievements) : [], featured: form.featured === "true" || form.featured === true });
      } else if (section === "ieee_members") {
        await upsertIEEEMember.mutateAsync({ ...base, name: form.name || "", role: form.role || null, department: form.department || null, avatar: form.avatar || form.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2) || "AA", ieee_id: form.ieee_id || null, research_papers: form.research_papers ? Number(form.research_papers) : 0, specialization: form.specialization || null, bio: form.bio || null, linkedin: form.linkedin || null, is_officer: form.is_officer === "true" || form.is_officer === true });
      } else if (section === "carousel_slides") {
        await upsertCarouselSlide.mutateAsync({ ...base, title: form.title || "", description: form.description || null, icon: form.icon || "rocket", gradient: form.gradient || "from-primary/50 to-accent/30", link: form.link || null, sort_order: form.sort_order ? Number(form.sort_order) : 0, is_active: form.is_active === "true" || form.is_active === true, image_url: form.image_url || null });
      } else if (section === "hackathon_carousel") {
        await upsertHackCarousel.mutateAsync({ ...base, title: form.title || "", image_url: form.image_url || null, category: form.category || "upcoming", hyperlink: form.hyperlink || null, link_text: form.link_text || "Learn More", sort_order: form.sort_order ? Number(form.sort_order) : 0, is_active: form.is_active === "true" || form.is_active === true });
      } else if (section === "ieee_carousel") {
        await upsertIEEECarouselMut.mutateAsync({ ...base, title: form.title || "", image_url: form.image_url || null, category: form.category || "upcoming", hyperlink: form.hyperlink || null, link_text: form.link_text || "Learn More", sort_order: form.sort_order ? Number(form.sort_order) : 0, is_active: form.is_active === "true" || form.is_active === true });
      } else if (section === "ieee_conferences") {
        await upsertIEEEConf.mutateAsync({ ...base, title: form.title || "", description: form.description || null, conference_type: form.conference_type || "conference", date: form.date || null, end_date: form.end_date || null, location: form.location || null, hyperlink: form.hyperlink || null, sort_order: form.sort_order ? Number(form.sort_order) : 0, is_active: form.is_active === "true" || form.is_active === true });
      } else if (section === "branch_featured") {
        if (!form.branch_id || !form.student_id) { toast({ title: "Please select both a branch and a student", variant: "destructive" }); return; }
        await upsertBranchFeatured.mutateAsync({ ...base, branch_id: form.branch_id, student_id: form.student_id, achievement: form.achievement || null, sort_order: form.sort_order ? Number(form.sort_order) : 0 });
      } else if (section === "startup_carousel") {
        await upsertStartupCarouselMut.mutateAsync({ ...base, title: form.title || "", description: form.description || null, image_url: form.image_url || null, category: form.category || "featured", hyperlink: form.hyperlink || null, link_text: form.link_text || "Learn More", sort_order: form.sort_order ? Number(form.sort_order) : 0, is_active: form.is_active === "true" || form.is_active === true });
      } else if (section === "discover_carousel") {
        await upsertDiscoverCarouselMut.mutateAsync({ ...base, title: form.title || "", description: form.description || null, image_url: form.image_url || null, gradient: form.gradient || "from-primary/30 to-accent/20", category: form.category || "promotion", hyperlink: form.hyperlink || null, link_text: form.link_text || "Learn More", sort_order: form.sort_order ? Number(form.sort_order) : 0, is_active: form.is_active === "true" || form.is_active === true });
      } else if (section === "rewards_store") {
        const rewardData = { title: form.title || "", description: form.description || null, xp_cost: form.xp_cost ? Number(form.xp_cost) : 100, category: form.category || "coupon", icon: form.icon || "gift", coupon_code: form.coupon_code || null, total_quantity: form.total_quantity ? Number(form.total_quantity) : null, remaining_quantity: form.remaining_quantity ? Number(form.remaining_quantity) : null, is_active: form.is_active === "true" || form.is_active === true, college_id: activeCollegeId };
        if (editId) {
          await supabase.from("rewards").update(rewardData).eq("id", editId);
        } else {
          await supabase.from("rewards").insert(rewardData);
        }
        fetchRewards();
      }
      toast({ title: editId ? "Updated successfully" : "Created successfully" });
      setFormOpen(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleInjectStudents = async () => {
    if (!activeCollegeId) return;
    toast({ title: "Injecting students...", description: "Please wait.", duration: 3000 });
    
    const branchNames = ["Computer Science Engineering", "Electronics & Communication Engineering", "Mechanical Engineering", "Civil Engineering", "Business Analytics"];
    let successCount = 0;
    
    // Auto-create missing branches first, to ensure branch_id mappings exist
    for (const bName of branchNames) {
      const exists = branches.find((b: { name: string }) => b.name === bName);
      if (!exists) {
        await supabase.from("branches").insert({
          name: bName,
          slug: bName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          college_id: activeCollegeId
        });
      }
    }
    
    // Fetch refreshed branches
    const { data: dbBranches } = await supabase.from("branches").select("id, name").eq("college_id", activeCollegeId);

    // Insert 20 students
    for (let i = 1; i <= 20; i++) {
       const email = `student${i}@galgotiasuniversity.edu.in`;
       const name = `Test Student ${i}`;
       const bName = branchNames[i % branchNames.length];
       const branchId = dbBranches?.find(b => b.name === bName)?.id || null;

       const { error } = await supabase.from("students").insert({
         name,
         email,
         college_id: activeCollegeId,
         branch_id: branchId,
         graduation_year: new Date().getFullYear() + 2,
         status: "active",
         xp_points: Math.floor(Math.random() * 500)
       });

       if (!error) successCount++;
    }

    toast({ title: "Injection Complete!", description: `Successfully injected ${successCount} students into the directory. Please refresh.` });
  };

  const handleSyncProfiles = async () => {
    if (!activeCollegeId) return;
    toast({ title: "Syncing users...", description: "Pulling actual users from profiles to students table.", duration: 3000 });
    
    // Fetch all profiles belonging to this college
    const { data: profiles, error: pError } = await supabase
       .from("profiles")
       .select("*")
       .eq("college_id", activeCollegeId);
       
    if (pError || !profiles) {
       toast({ title: "Error", description: "Failed to fetch profiles", variant: "destructive" });
       return;
    }
    
    // Fetch main_branches and specializations for lookup
    const { data: mainBranchesDB } = await supabase.from("main_branches" as any).select("id, name");
    const { data: specializationsDB } = await supabase.from("specializations" as any).select("id, name, branch_id");
    let successCount = 0;

    for (const p of profiles) {
       // Look up main_branch_id: use profile's main_branch_id if set, else match by branch text
       let mainBranchId = (p as any).main_branch_id || null;
       let specializationId = (p as any).specialization_id || null;
       
       if (!mainBranchId && p.branch && mainBranchesDB) {
         // Try to match branch text to a specialization name
         const matchedSpec = (specializationsDB || []).find(
           (sp: any) => sp.name.toLowerCase() === p.branch.toLowerCase()
         );
         if (matchedSpec) {
           mainBranchId = (matchedSpec as any).branch_id;
           specializationId = (matchedSpec as any).id;
         } else {
           // Try to match as a main branch name
           const matchedMain = mainBranchesDB.find(
             (mb: any) => mb.name.toLowerCase() === p.branch.toLowerCase()
           );
           if (matchedMain) mainBranchId = (matchedMain as any).id;
         }
       }
       
       // Convert year of study text to graduation year number
       const cy = new Date().getFullYear();
       let gradYear: number | null = null;
       if (p.is_alumni && p.passout_year) {
         gradYear = p.passout_year;
       } else if (p.year_of_study) {
         const match = p.year_of_study.match(/(\d+)/);
         if (match) {
           const yr = parseInt(match[1]);
           gradYear = cy + (4 - yr);
         }
       }
       
       const { error } = await supabase.from("students").upsert({
         id: p.user_id,
         name: p.full_name || "Unknown",
         college_id: p.college_id,
         main_branch_id: mainBranchId,
         specialization_id: specializationId,
         branch_name: p.branch || null,
         graduation_year: gradYear,
         bio: p.bio,
         skills: p.skills || [],
         avatar_url: p.photo_url || null,
         status: p.is_alumni ? "alumni" : "active",
         xp_points: 0
       } as any);
       
       if (!error) {
         successCount++;
       } else {
         console.error("Sync Error for", p.user_id, error);
         toast({ title: "Error", description: `Sync error for ${p.full_name}: ${error.message}`, variant: "destructive" });
       }
    }
    
    if (successCount > 0) {
      toast({ title: "Sync Complete!", description: `Successfully synced ${successCount} actual users into the branch directory. Refresh to see them.` });
    }
  };

  const activeCollege = colleges.find((c: any) => c.id === activeCollegeId);

  const stats = [
    { label: "Students", value: students.length, icon: Users, change: `${students.filter((s: any) => s.status === "active").length} active` },
    { label: "Hackathons", value: hackathons.length, icon: Globe, change: `${hackathons.filter((h: any) => h.status === "open").length} open` },
    { label: "Clubs", value: clubs.length, icon: Layers, change: `${clubs.reduce((a: number, c: any) => a + (c.members || 0), 0)} members` },
    { label: "Alumni", value: alumni.length, icon: GraduationCap, change: `${alumni.filter((a: any) => a.featured).length} featured` },
  ];

  const isLoading = studentsLoading || branchesLoading || eventsLoading || achievementsLoading || announcementsLoading || hackathonsLoading || clubsLoading || alumniLoading || ieeeLoading || carouselLoading;

  const sectionLabel = section === "ieee_members" ? "IEEE Member" : section === "colleges" ? "College" : section.slice(0, -1);

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      {/* Sidebar Toggle Button (visible when closed) */}
      {!sidebarOpen && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setSidebarOpen(true)}
          className="fixed left-3 top-3 z-40 h-10 w-10 rounded-xl bg-card/90 backdrop-blur-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all shadow-lg"
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 bottom-0 w-[240px] bg-card/80 backdrop-blur-xl border-r border-border z-30 flex flex-col">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center glow-accent">
              <Shield className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-foreground">Admin</span>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Dashboard</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Super Admin College Switcher */}
        {isSuperAdmin && (
          <div className="px-3 py-3 border-b border-border">
            <p className="text-[10px] font-semibold text-accent uppercase tracking-widest px-3 mb-2 flex items-center gap-1">
              <ArrowLeftRight className="h-3 w-3" /> Switch College
            </p>
            <select
              value={activeCollegeId || ""}
              onChange={(e) => setActiveCollegeId(e.target.value || null)}
              className="w-full text-xs bg-secondary/60 border border-border/40 rounded-lg px-3 py-2 text-foreground"
            >
              {colleges.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {isSuperAdmin && (
            <>
              <p className="text-[10px] font-semibold text-accent uppercase tracking-widest px-3 mb-3">Super Admin</p>
              {[
                { label: "Colleges", icon: Building2, key: "colleges" },
                { label: "College Admins", icon: Shield, key: "college_admins" },
                { label: "Core Team", icon: Shield, key: "core_team" },
              ].map((item) => (
                <motion.button key={item.key} whileHover={{ x: 3 }} onClick={() => { setSection(item.key as Section); setSearch(""); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${section === item.key ? "bg-accent/15 text-accent border border-accent/20" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                  <item.icon className="h-4 w-4" />{item.label}
                  {section === item.key && <ChevronRight className="h-3 w-3 ml-auto" />}
                </motion.button>
              ))}
            </>
          )}

          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3 mt-2">Manage</p>
          {groupedSidebar.map((entry, idx) => {
            if ("groupLabel" in entry) {
              const group = entry as SidebarGroup;
              const isOpen = !!openGroups[group.groupLabel];
              const isGroupActive = group.items.some(i => i.key === section);
              return (
                <div key={group.groupLabel} className="mb-1">
                  <button
                    onClick={() => setOpenGroups(prev => ({ ...prev, [group.groupLabel]: !prev[group.groupLabel] }))}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isGroupActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
                  >
                    <group.icon className="h-4 w-4" />
                    {group.groupLabel}
                    <ChevronRight className={`h-3 w-3 ml-auto transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-5 mt-1 space-y-0.5 border-l-2 border-border/30 ml-5">
                          {group.items.map((item) => (
                            <motion.button key={item.key} whileHover={{ x: 3 }} onClick={() => { setSection(item.key as Section); setSearch(""); }}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${section === item.key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                              <item.icon className="h-3.5 w-3.5" />{item.label}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            } else {
              const item = entry as SidebarItem;
              return (
                <motion.button key={item.key} whileHover={{ x: 3 }} onClick={() => { setSection(item.key as Section); setSearch(""); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${section === item.key ? "bg-primary/15 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                  <item.icon className="h-4 w-4" />{item.label}
                  {section === item.key && <ChevronRight className="h-3 w-3 ml-auto" />}
                </motion.button>
              );
            }
          })}

          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mt-4 mb-3">View Site</p>
          {[
            { label: "Home", icon: Globe, href: "/" },
            { label: "Hackathons", icon: Globe, href: "/hackathons" },
            { label: "Clubs", icon: Layers, href: "/clubs" },
            { label: "Alumni", icon: GraduationCap, href: "/alumni" },
            { label: "IEEE", icon: Radio, href: "/ieee" },
            { label: "Startup", icon: Rocket, href: "/startup" },
          ].map((item) => (
            <Link key={item.href} to={item.href}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">
              <item.icon className="h-4 w-4" />{item.label}
              <ChevronRight className="h-3 w-3 ml-auto opacity-50" />
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
              {(profile?.full_name || user?.email || "A").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || "Admin"}</p>
              <p className="text-[10px] text-muted-foreground">{isSuperAdmin ? "Super Admin" : "College Admin"}</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <main className={`flex-1 relative z-10 transition-all duration-300 ${sidebarOpen ? "ml-[240px]" : "ml-0"}`}>
        <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-20 h-14 bg-background/60 backdrop-blur-xl border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-bold text-foreground capitalize">{section.replace("_", " ")}</h2>
            <Badge variant="outline" className="border-accent/40 text-accent text-[10px]"><Zap className="h-3 w-3 mr-1" /> Live</Badge>
            {isSuperAdmin && activeCollege && section !== "colleges" && (
              <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">
                <Building2 className="h-3 w-3 mr-1" /> {activeCollege.name}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={`Search ${section.replace("_", " ")}...`} value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9 w-56 bg-secondary/50 border-border rounded-xl text-sm" />
            </div>
            {section === "hackathons" && (
              <Button size="sm" variant="outline" onClick={handleDiscoverHackathons} disabled={discovering}
                className="gap-2 border-primary/40 text-primary hover:bg-primary/10 rounded-xl">
                {discovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                {discovering ? "Discovering..." : "Auto-Discover"}
              </Button>
            )}
            {section === "students" && (
              <>
                <Button size="sm" variant="outline" onClick={handleSyncProfiles}
                  className="gap-2 border-primary/40 text-primary hover:bg-primary/10 rounded-xl mr-2 glow-primary">
                  <Sparkles className="h-4 w-4" /> Sync Real Users
                </Button>
                <Button size="sm" variant="outline" onClick={handleInjectStudents}
                  className="gap-2 border-accent/40 text-accent hover:bg-accent/10 rounded-xl mr-2">
                  <Bot className="h-4 w-4" /> Inject 20 Students
                </Button>
                <Button size="sm" variant="outline" onClick={handleExportStudents}
                  className="gap-2 border-green-500/40 text-green-500 hover:bg-green-500/10 rounded-xl">
                  <Download className="h-4 w-4" /> Export Excel
                </Button>
              </>
            )}
            {section !== "college_admins" && section !== "club_dashboard" && (
              <Button size="sm" onClick={openCreate} className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl glow-accent">
                <Plus className="h-4 w-4" /> Add {sectionLabel}
              </Button>
            )}
          </div>
        </motion.header>

        <div className="p-6">
          {/* Stats row — hide when viewing colleges */}
          {section !== "colleges" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((stat) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }}
                  className="glass rounded-2xl p-4 group cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                      <p className="font-display text-2xl font-bold text-foreground mt-1">{isLoading ? "..." : stat.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{stat.change}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Colleges stats for super admin */}
          {section === "colleges" && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Total Colleges</p>
                <p className="font-display text-2xl font-bold text-foreground mt-1">{colleges.length}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Active College</p>
                <p className="font-display text-lg font-bold text-accent mt-1 truncate">{activeCollege?.name || "—"}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Domains</p>
                <p className="font-display text-2xl font-bold text-foreground mt-1">{colleges.length}</p>
              </motion.div>
            </div>
          )}

          {/* Form Settings Section */}
          {section === "form_settings" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">Signup Form Configuration</h3>
                  <p className="text-xs text-muted-foreground mt-1">Control which fields appear on the signup & onboarding forms for this college.</p>
                </div>
                <Button onClick={saveFormConfig} disabled={!formConfigDirty} className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl glow-accent">
                  <Save className="h-4 w-4" /> Save Changes
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "show_photo", label: "Profile Photo Upload", desc: "Allow users to upload a profile picture (max 1 MB)" },
                  { key: "show_bio", label: "Bio / About Me", desc: "Short introduction text field" },
                  { key: "show_alumni", label: "Alumni Option", desc: "Toggle for alumni with company details" },
                  { key: "show_company", label: "Company Name", desc: "Company name field (shown if alumni)" },
                  { key: "show_company_type", label: "Company Type", desc: "Tech vs Non-Tech selection (shown if alumni)" },
                  { key: "show_skills", label: "Skills Input", desc: "Allow users to add their skills" },
                  { key: "show_branch", label: "Main Branch", desc: "Primary branch/department selection" },
                  { key: "show_sub_branch", label: "Sub-Branch / Specialization", desc: "Specialization within main branch" },
                  { key: "show_year", label: "Year of Study", desc: "Current academic year selection" },
                ].map(({ key, label, desc }) => (
                  <motion.div key={key} whileHover={{ y: -2 }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${(formConfig as any)[key] ? "bg-accent/5 border-accent/30" : "bg-secondary/20 border-border/30"}`}
                    onClick={() => updateFormConfig(key, !(formConfig as any)[key])}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                      <motion.div
                        animate={{ backgroundColor: (formConfig as any)[key] ? "hsl(var(--accent))" : "hsl(var(--muted))" }}
                        className="h-6 w-11 rounded-full p-0.5 flex-shrink-0 ml-3">
                        <motion.div animate={{ x: (formConfig as any)[key] ? 20 : 0 }} className="h-5 w-5 rounded-full bg-background shadow-sm" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-border/30 pt-4">
                <label className="text-sm font-semibold text-foreground mb-2 block">Max Skills Allowed</label>
                <Input type="number" className="bg-secondary/40 border-border/30 rounded-xl text-sm h-10 w-32" value={formConfig.max_skills} onChange={(e) => updateFormConfig("max_skills", Number(e.target.value))} min={1} max={20} />
              </div>

              <div className="border-t border-border/30 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-sm font-semibold text-foreground block">Enabled Branches & Sub-Branches</label>
                    <p className="text-[11px] text-muted-foreground mt-1">Select which branches students can choose during signup. Click a branch to expand and configure sub-branches.</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const name = prompt("Enter new branch name:");
                      if (!name?.trim()) return;
                      const subsInput = prompt("Enter sub-branches (comma-separated, or leave empty):");
                      const newSubs = subsInput ? subsInput.split(",").map(s => s.trim()).filter(Boolean) : [];
                      
                      // Add to branchesData (runtime)
                      const newBranch = { name: name.trim(), icon: "📌", subBranches: newSubs.map(s => ({ name: s })) };
                      branchesData.push(newBranch);
                      
                      // Auto-enable the new branch
                      updateFormConfig("enabled_branches", [...formConfig.enabled_branches, name.trim()]);
                      if (newSubs.length > 0) {
                        updateFormConfig("enabled_sub_branches", {
                          ...(formConfig as any).enabled_sub_branches,
                          [name.trim()]: newSubs,
                        });
                      }
                      toast({ title: "Branch added!", description: `"${name.trim()}" has been added. Don't forget to save.` });
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/15 border border-accent/30 text-accent text-xs font-medium hover:bg-accent/25 transition-colors flex-shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Branch
                  </motion.button>
                </div>
                <div className="space-y-2">
                  {branchesData.map((b) => {
                    const enabled = formConfig.enabled_branches.includes(b.name);
                    const isExpanded = expandedBranch === b.name;
                    const enabledSubs = (formConfig as any).enabled_sub_branches?.[b.name] || [];
                    return (
                      <div key={b.name} className={`rounded-xl border transition-all ${enabled ? "border-accent/30 bg-accent/5" : "border-border/30 bg-secondary/10 opacity-60"}`}>
                        <div className="flex items-center gap-2 px-3 py-2.5">
                          <motion.button whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const newEnabled = enabled
                                ? formConfig.enabled_branches.filter((n: string) => n !== b.name)
                                : [...formConfig.enabled_branches, b.name];
                              updateFormConfig("enabled_branches", newEnabled);
                              if (!enabled) {
                                // Enable all sub-branches when enabling a branch
                                updateFormConfig("enabled_sub_branches", {
                                  ...(formConfig as any).enabled_sub_branches,
                                  [b.name]: b.subBranches.map(sb => sb.name),
                                });
                              }
                            }}
                            className={`h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${enabled ? "bg-accent border-accent text-accent-foreground" : "border-muted-foreground/40"}`}>
                            {enabled && <span className="text-[10px]">✓</span>}
                          </motion.button>
                          <span className="text-sm">{b.icon}</span>
                          <span className={`text-xs font-medium flex-1 ${enabled ? "text-accent" : "text-muted-foreground line-through"}`}>{b.name}</span>
                          {enabled && (
                            <button onClick={() => setExpandedBranch(isExpanded ? null : b.name)}
                              className="text-[10px] text-muted-foreground hover:text-accent px-2 py-1 rounded-lg hover:bg-accent/10 transition-colors flex items-center gap-1">
                              <ChevronRight className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                              {enabledSubs.length}/{b.subBranches.length} subs
                            </button>
                          )}
                        </div>
                        <AnimatePresence>
                          {enabled && isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden">
                              <div className="px-3 pb-3 pt-1 border-t border-border/20">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sub-Branches</span>
                                  <button onClick={() => {
                                    const allSelected = enabledSubs.length === b.subBranches.length;
                                    updateFormConfig("enabled_sub_branches", {
                                      ...(formConfig as any).enabled_sub_branches,
                                      [b.name]: allSelected ? [] : b.subBranches.map(sb => sb.name),
                                    });
                                  }} className="text-[10px] text-accent hover:underline">
                                    {enabledSubs.length === b.subBranches.length ? "Deselect All" : "Select All"}
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {b.subBranches.map((sb) => {
                                    const subEnabled = enabledSubs.includes(sb.name);
                                    return (
                                      <motion.button key={sb.name} whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                          const newSubs = subEnabled
                                            ? enabledSubs.filter((n: string) => n !== sb.name)
                                            : [...enabledSubs, sb.name];
                                          updateFormConfig("enabled_sub_branches", {
                                            ...(formConfig as any).enabled_sub_branches,
                                            [b.name]: newSubs,
                                          });
                                        }}
                                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${subEnabled ? "bg-primary/15 border-primary/30 text-primary" : "bg-secondary/20 border-border/20 text-muted-foreground/60 line-through"}`}>
                                        {sb.name}
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* College Admins Section */}
          {section === "college_admins" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">College Admin Management</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Assign users as College Admins. They'll have full admin access scoped to their assigned college.
                </p>
              </div>

              {/* Assign new admin */}
              <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 space-y-3">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Plus className="h-4 w-4 text-accent" /> Assign New College Admin
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Enter any email address (Gmail, college email, etc). They'll get admin access for: <span className="text-accent font-medium">{activeCollege?.name || "—"}</span>
                </p>
                <div className="flex gap-2">
                  <Input
                    className={inputClass + " flex-1"}
                    placeholder="admin@gmail.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAssignCollegeAdmin()}
                  />
                  <Button onClick={handleAssignCollegeAdmin} disabled={assigningAdmin || !adminEmail.trim()}
                    className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl">
                    {assigningAdmin ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    Assign
                  </Button>
                </div>
              </div>

              {/* Current college admins list */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Current College Admins</p>
                {collegeAdminsLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Activity className="h-5 w-5 mx-auto mb-2" />
                    </motion.div>
                    Loading...
                  </div>
                ) : collegeAdmins.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground border border-border/20 rounded-xl">
                    <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No college admins assigned yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {collegeAdmins.map((admin) => (
                      <motion.div key={admin.id} whileHover={{ x: 3 }}
                        className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                        <div className="flex items-center gap-3">
                          {admin.type !== "pending" && admin.profile_photo ? (
                            <img src={admin.profile_photo} alt={admin.profile_name || "Admin"} className="h-9 w-9 rounded-full object-cover border border-border/30" />
                          ) : (
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-accent-foreground ${admin.type === "pending" ? "bg-gradient-to-br from-yellow-500 to-orange-500" : "bg-gradient-to-br from-accent to-primary"}`}>
                              {(admin.type === "pending" ? admin.email : (admin.profile_name || "?")).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {admin.type === "pending" ? admin.email : (admin.profile_name || "Unknown User")}
                            </p>
                            {admin.type !== "pending" && admin.profile_branch && (
                              <p className="text-[11px] text-muted-foreground">{admin.profile_branch}</p>
                            )}
                            <p className="text-[11px] text-muted-foreground">{admin.college_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-[10px] ${admin.type === "pending" ? "border-yellow-500/40 text-yellow-500" : "border-accent/40 text-accent"}`}>
                            {admin.type === "pending" ? "⏳ Pending Invite" : "College Admin"}
                          </Badge>
                          <Button size="sm" variant="ghost" onClick={() => handleRemoveCollegeAdmin(admin.id, admin.type, admin.admin_email || admin.email, admin.college_id)}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-lg">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Core Team Section */}
          {section === "core_team" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Core Team Management</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Assign or revoke core team access for the selected college.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 space-y-3">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Plus className="h-4 w-4 text-accent" /> Assign Core Team Member
                </p>
                <div className="space-y-2">
                  <Input
                    className={inputClass}
                    placeholder="Search student by name..."
                    value={coreTeamQuery}
                    onChange={(e) => setCoreTeamQuery(e.target.value)}
                    disabled={!activeCollegeId || assigningCoreTeam}
                  />

                  {coreTeamSearchResults.length > 0 && (
                    <div className="border border-border/30 rounded-xl overflow-hidden">
                      {coreTeamSearchResults.map((p: any) => (
                        <button
                          key={p.user_id}
                          onClick={() => {
                            setCoreTeamSelectedUserId(p.user_id);
                            setCoreTeamQuery(p.full_name || "");
                            setCoreTeamSearchResults([]);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary/40 transition-colors ${
                            coreTeamSelectedUserId === p.user_id ? "bg-primary/10" : ""
                          }`}
                        >
                          <span className="text-foreground">{p.full_name || "Unknown"}</span>
                          {p.email && <span className="text-xs text-muted-foreground ml-2">({p.email})</span>}
                          {p.branch && <span className="text-xs text-muted-foreground ml-2">• {p.branch}</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  {coreTeamQuery.trim().length >= 2 && coreTeamSearchResults.length === 0 && (
                    <div className="text-xs text-muted-foreground px-3 py-2 border border-border/30 rounded-xl">
                      No students found for this college.
                    </div>
                  )}

                  <Button
                    onClick={handleAssignCoreTeam}
                    disabled={!activeCollegeId || !coreTeamSelectedUserId || assigningCoreTeam}
                    className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
                  >
                    {assigningCoreTeam ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    Assign
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Current Core Team</p>
                {coreTeamLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Activity className="h-5 w-5 mx-auto mb-2" />
                    </motion.div>
                    Loading...
                  </div>
                ) : coreTeamMembers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground border border-border/20 rounded-xl">
                    <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No core team members assigned yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {coreTeamMembers.map((m: any) => (
                      <motion.div key={m.id} whileHover={{ x: 3 }}
                        className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                        <div className="flex items-center gap-3">
                          {m.display_avatar ? (
                            <img src={m.display_avatar} alt={m.display_name || "User"} className="h-9 w-9 rounded-full object-cover border border-border/30" />
                          ) : (
                            <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-accent-foreground bg-gradient-to-br from-accent to-primary">
                              {(m.display_name || "C").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">{m.display_name || "Unknown User"}</p>
                            {m.display_branch && <p className="text-[11px] text-muted-foreground">{m.display_branch}</p>}
                            <p className="text-[10px] text-muted-foreground/80">ID: {m.user_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] border-accent/40 text-accent">Core Team</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRevokeCoreTeam(m.id)}
                            disabled={revokingCoreTeamId === m.id}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-lg"
                          >
                            {revokingCoreTeamId === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Club Dashboard Section */}
          {section === "club_dashboard" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <ClubDashboardSection />
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`glass rounded-2xl overflow-hidden ${section === "form_settings" || section === "college_admins" || section === "club_dashboard" ? "hidden" : ""}`}>
            {section === "club_proposals" && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">Club Proposals</h3>
                    <p className="text-xs text-muted-foreground mt-1">Pending proposals for the active college.</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{clubProposals.length}</Badge>
                </div>

                {clubProposalsLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Activity className="h-5 w-5 mx-auto mb-2" />
                    </motion.div>
                    Loading...
                  </div>
                ) : clubProposals.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground border border-border/20 rounded-xl">
                    <Layers className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No pending proposals.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clubProposals.map((p: any) => (
                      <div key={p.id} className="rounded-2xl border border-border/30 bg-secondary/10 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-foreground font-semibold">{p.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{p.category} • {new Date(p.created_at).toLocaleDateString()}</p>
                            {p.tagline && <p className="text-xs text-muted-foreground mt-2 italic">"{p.tagline}"</p>}
                          </div>
                          <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                        </div>

                        {p.description && <p className="text-xs text-muted-foreground mt-3">{p.description}</p>}

                        <div className="mt-4 space-y-2">
                          <label className="text-xs text-muted-foreground block">Rejection reason</label>
                          <Input
                            className={inputClass}
                            value={proposalRejectReason[p.id] || ""}
                            onChange={(e) => setProposalRejectReason(prev => ({ ...prev, [p.id]: e.target.value }))}
                            disabled={proposalBusyId === p.id}
                            placeholder="Required to reject"
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleApproveProposalAdmin(p.id)}
                              disabled={!!proposalBusyId}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {proposalBusyId === p.id ? "Working..." : "Approve"}
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleRejectProposalAdmin(p.id)}
                              disabled={!!proposalBusyId}
                            >
                              {proposalBusyId === p.id ? "Working..." : "Reject"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {section === "colleges" && (
              <DataTable columns={["Name", "Domain", "City", "State"]}
                rows={colleges.filter((c: any) => (c.name || "").toLowerCase().includes(search.toLowerCase())).map((c: any) => ({
                  id: c.id, cells: [c.name, c.domain, c.city || "-", c.state || "-"], raw: c,
                }))} onEdit={(r) => openEdit(r.id, r.raw)} onDelete={(id) => handleDelete(id)} />
            )}
            {section === "students" && (
              <>
                {/* Branch slider + search/filter bar */}
                <div className="px-4 pt-4 pb-2 space-y-3 border-b border-border/20">
                  {/* Branch chips - show first 3 + toggle */}
                  <div className="flex flex-wrap items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setBranchFilter(null)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        !branchFilter
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                          : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/30"
                      }`}
                    >
                      All ({(students || []).length})
                    </motion.button>
                    {(showAllBranches ? displayBranches : displayBranches.slice(0, 3)).map((branch: any) => {
                      const count = (students || []).filter((s: any) => (s.main_branch?.slug || s.branches?.slug) === branch.slug).length;
                      return (
                        <motion.button
                          key={branch.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setBranchFilter(branchFilter === branch.slug ? null : branch.slug)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                            branchFilter === branch.slug
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/30"
                          }`}
                        >
                          <GitBranch className="h-3 w-3" />
                          {branch.name}
                          <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            branchFilter === branch.slug ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            {count}
                          </span>
                        </motion.button>
                      );
                    })}
                    {showAllBranches && (students || []).some((s: any) => !s.main_branch_id && !s.main_branch) && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setBranchFilter(branchFilter === "none" ? null : "none")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                          branchFilter === "none"
                            ? "bg-destructive/80 text-destructive-foreground shadow-md"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/30"
                        }`}
                      >
                        Unassigned
                        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          branchFilter === "none" ? "bg-destructive-foreground/20" : "bg-muted text-muted-foreground"
                        }`}>
                          {(students || []).filter((s: any) => !s.main_branch_id && !s.main_branch).length}
                        </span>
                      </motion.button>
                    )}
                    {displayBranches.length > 3 && (
                      <button
                        onClick={() => setShowAllBranches(!showAllBranches)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20 transition-all"
                      >
                        {showAllBranches ? "Hide" : `+${displayBranches.length - 3} More`}
                      </button>
                    )}
                  </div>

                  {/* Search + Sort bar */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search by name, email, skills..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-secondary/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                      {studentSearch && (
                        <button onClick={() => setStudentSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {(["name", "xp", "year"] as const).map((key) => (
                        <button
                          key={key}
                          onClick={() => {
                            if (studentSort === key) setSortDir(d => d === "asc" ? "desc" : "asc");
                            else { setStudentSort(key); setSortDir(key === "xp" ? "desc" : "asc"); }
                          }}
                          className={`px-2.5 py-2 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all ${
                            studentSort === key
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-border/30"
                          }`}
                        >
                          {key === "name" ? "Name" : key === "xp" ? "XP" : "Year"}
                          {studentSort === key && (
                            <ArrowUpDown className={`h-3 w-3 transition-transform ${sortDir === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <DataTable columns={["", "Name", "Email", "Branch", "Year", "Status", "XP"]}
                  rows={(students || [])
                    .filter((s: any) => {
                      if (branchFilter === "none") return !s.main_branch_id && !s.main_branch;
                      if (branchFilter) return (s.main_branch?.slug || s.branches?.slug) === branchFilter;
                      return true;
                    })
                    .filter((s: any) => {
                      if (!studentSearch) return true;
                      const q = studentSearch.toLowerCase();
                      return (
                        s.name?.toLowerCase().includes(q) ||
                        s.email?.toLowerCase().includes(q) ||
                        (s.skills || []).some((sk: string) => sk.toLowerCase().includes(q)) ||
                        s.main_branch?.name?.toLowerCase().includes(q) ||
                        s.specialization?.name?.toLowerCase().includes(q) ||
                        s.branches?.name?.toLowerCase().includes(q)
                      );
                    })
                    .sort((a: any, b: any) => {
                      const dir = sortDir === "asc" ? 1 : -1;
                      if (studentSort === "name") return dir * (a.name || "").localeCompare(b.name || "");
                      if (studentSort === "xp") return dir * ((a.xp_points || 0) - (b.xp_points || 0));
                      if (studentSort === "year") return dir * ((a.graduation_year || 0) - (b.graduation_year || 0));
                      return 0;
                    })
                    .map((s: any) => ({
                      id: s.id, cells: [
                        <img key="avatar" src={s.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name || "?")}&background=7c3aed&color=fff&size=32`} alt="" className="h-8 w-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-primary transition-all" onClick={(e) => { e.stopPropagation(); setEnlargedImage(s.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name || "?")}&background=7c3aed&color=fff&size=200`); }} />,
                        s.name, s.email || "-", s.main_branch?.name || s.branches?.name || s.branch_name || "-", s.graduation_year || "-", <StatusBadge key="s" status={s.status} />, s.xp_points || 0
                      ], raw: s,
                    }))} onEdit={(r) => openEdit(r.id, r.raw)} onDelete={(id) => handleDelete(id)} />
              </>
            )}
            {section === "events" && (
              <DataTable columns={["Title", "Type", "Branch", "Date", "Status"]}
                rows={(events || []).filter((e: any) => e.title.toLowerCase().includes(search.toLowerCase())).map((e: any) => ({
                  id: e.id, cells: [e.title, e.event_type, e.branches?.name || "-", e.date ? new Date(e.date).toLocaleDateString() : "-", <StatusBadge key="s" status={e.status} />], raw: e,
                }))} onEdit={(r) => openEdit(r.id, r.raw)} onDelete={(id) => handleDelete(id)} />
            )}
            {section === "achievements" && (
              <DataTable columns={["Title", "Student", "Type", "Date"]}
                rows={(achievements || []).filter((a: any) => a.title.toLowerCase().includes(search.toLowerCase())).map((a: any) => ({
                  id: a.id, cells: [a.title, a.students?.name || "-", a.achievement_type, a.date ? new Date(a.date).toLocaleDateString() : "-"], raw: a,
                }))} onEdit={(r) => openEdit(r.id, r.raw)} onDelete={(id) => handleDelete(id)} />
            )}
            {section === "announcements" && (
              <DataTable columns={["Title", "Priority", "Branch", "Pinned", "Created"]}
                rows={(announcements || []).filter((a: any) => a.title.toLowerCase().includes(search.toLowerCase())).map((a: any) => ({
                  id: a.id, cells: [a.title, <PriorityBadge key="p" priority={a.priority} />, a.branches?.name || "All", a.is_pinned ? "📌 Yes" : "No", new Date(a.created_at).toLocaleDateString()], raw: a,
                }))} onEdit={(r) => openEdit(r.id, r.raw)} onDelete={(id) => handleDelete(id)} />
            )}
            {section === "hackathons" && (
              <DataTable columns={["Title", "Date", "Location", "Participants", "Prize", "Status"]}
                rows={(hackathons || []).filter((h: any) => h.title.toLowerCase().includes(search.toLowerCase())).map((h: any) => ({
                  id: h.id, cells: [h.title, h.date || "-", h.location || "-", `${h.participants || 0}/${h.max_participants || 0}`, h.prize || "-", <StatusBadge key="s" status={h.status} />], raw: h,
                }))} onEdit={(r) => openEdit(r.id, r.raw)} onDelete={(id) => handleDelete(id)} />
            )}
            {section === "clubs" && (
              <DataTable columns={["Name", "Category", "Members", "Active", "Advisor", "Suspend"]}
                rows={(clubs || []).filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase())).map((c: any) => ({
                  id: c.id, cells: [
                    c.name,
                    <CategoryBadge key="c" category={c.category} />,
                    c.members || 0,
                    c.is_active !== false ? "✅" : "❌",
                    c.advisor || "-",
                    c.is_active !== false ? (
                      <Button key="s" size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleSuspendClub(c.id); }} className="h-7 text-[11px] px-2">
                        Suspend
                      </Button>
                    ) : (
                      <span key="s2" className="text-xs text-muted-foreground">—</span>
                    ),
                  ], raw: c,
                }))} onEdit={(r) => openEdit(r.id, r.raw)} onDelete={(id) => handleDelete(id)} />
            )}
            {section === "alumni" && (
              <DataTable columns={["Name", "Batch", "Department", "Role", "Company", "Featured"]}
                rows={(alumni || []).filter((a: any) => a.name.toLowerCase().includes(search.toLowerCase())).map((a: any) => ({
                  id: a.id, cells: [a.name, a.batch || "-", a.department || "-", a.role || "-", a.company || "-", a.featured ? "⭐ Yes" : "No"], raw: a,
                }))} onEdit={(r) => openEdit(r.id, r.raw)} onDelete={(id) => handleDelete(id)} />
            )}
            {section === "ieee_members" && (
              <DataTable columns={["Name", "Role", "Department", "IEEE ID", "Papers", "Officer"]}
                rows={(ieeeMembers || []).filter((m: any) => m.name.toLowerCase().includes(search.toLowerCase())).map((m: any) => ({
                  id: m.id, cells: [m.name, m.role || "-", m.department || "-", m.ieee_id || "-", m.research_papers || 0, m.is_officer ? "✅ Yes" : "No"], raw: m,
                }))} onEdit={(r) => openEdit(r.id, r.raw)} onDelete={(id) => handleDelete(id)} />
            )}
            {section === "carousel_slides" && (
              <DataTable columns={["Title", "Description", "Icon", "Image", "Order", "Active"]}
                rows={(carouselSlides || []).filter((s: any) => (s.title || "").toLowerCase().includes(search.toLowerCase())).map((s: any) => ({
                  id: s.id, cells: [s.title, s.description || "-", s.icon || "-", s.image_url ? "🖼️ Yes" : "No", s.sort_order || 0, s.is_active ? "✅ Yes" : "No"], raw: s,
                }))} onEdit={(r) => openEdit(r.id, r.raw)} onDelete={(id) => handleDelete(id)} />
            )}
            {section === "hackathon_carousel" && (
              <DataTable columns={["Title", "Category", "Image", "Link", "Order", "Active"]}
                rows={(hackCarousel || []).filter((s: any) => (s.title || "").toLowerCase().includes(search.toLowerCase())).map((s: any) => ({
                  id: s.id, cells: [s.title, s.category || "-", s.image_url ? "🖼️ Yes" : "No", s.hyperlink ? "🔗 Yes" : "No", s.sort_order || 0, s.is_active ? "✅ Yes" : "No"], raw: s,
                }))} onEdit={(r) => openEdit(r.id, r.raw)} onDelete={(id) => handleDelete(id)} />
            )}
            {section === "ieee_carousel" && (
              <DataTable columns={["Title", "Category", "Image", "Link", "Order", "Active"]}
                rows={(ieeeCarousel || []).filter((s: any) => (s.title || "").toLowerCase().includes(search.toLowerCase())).map((s: any) => ({
                  id: s.id, cells: [s.title, s.category || "-", s.image_url ? "🖼️ Yes" : "No", s.hyperlink ? "🔗 Yes" : "No", s.sort_order || 0, s.is_active ? "✅ Yes" : "No"], raw: s,
                }))} onEdit={(r) => openEdit(r.id, r.raw)} onDelete={(id) => handleDelete(id)} />
            )}
            {section === "ieee_conferences" && (
              <DataTable columns={["Title", "Type", "Date", "Location", "Link", "Active"]}
                rows={(ieeeConferences || []).filter((s: any) => (s.title || "").toLowerCase().includes(search.toLowerCase())).map((s: any) => ({
                  id: s.id, cells: [s.title, s.conference_type || "-", s.date || "-", s.location || "-", s.hyperlink ? "🔗 Yes" : "No", s.is_active ? "✅ Yes" : "No"], raw: s,
                }))} onEdit={(r) => openEdit(r.id, r.raw)} onDelete={(id) => handleDelete(id)} />
            )}
            {section === "branch_featured" && (
              <DataTable columns={["Student", "Branch", "Achievement", "Order"]}
                rows={(branchFeatured || []).filter((s: any) => ((s.students?.name || "") + (s.branches?.name || "")).toLowerCase().includes(search.toLowerCase())).map((s: any) => ({
                  id: s.id, cells: [s.students?.name || "-", s.branches?.name || "-", s.achievement || "-", s.sort_order || 0], raw: s,
                }))} onEdit={(r) => openEdit(r.id, r.raw)} onDelete={(id) => handleDelete(id)} />
            )}
            {section === "startup_carousel" && (
              <DataTable columns={["Title", "Category", "Description", "Image", "Link", "Order", "Active"]}
                rows={(startupCarousel || []).filter((s: any) => (s.title || "").toLowerCase().includes(search.toLowerCase())).map((s: any) => ({
                  id: s.id, cells: [s.title, s.category || "-", (s.description || "-").slice(0, 30), s.image_url ? "🖼️ Yes" : "No", s.hyperlink ? "🔗 Yes" : "No", s.sort_order || 0, s.is_active ? "✅ Yes" : "No"], raw: s,
                }))} onEdit={(r) => openEdit(r.id, r.raw)} onDelete={(id) => handleDelete(id)} />
            )}
            {section === "discover_carousel" && (
              <DataTable columns={["Title", "Category", "Description", "Image", "Link", "Order", "Active"]}
                rows={(discoverCarousel || []).filter((s: any) => (s.title || "").toLowerCase().includes(search.toLowerCase())).map((s: any) => ({
                  id: s.id, cells: [s.title, s.category || "-", (s.description || "-").slice(0, 30), s.image_url ? "🖼️ Yes" : "No", s.hyperlink ? "🔗 Yes" : "No", s.sort_order || 0, s.is_active ? "✅ Yes" : "No"], raw: s,
                }))} onEdit={(r) => openEdit(r.id, r.raw)} onDelete={(id) => handleDelete(id)} />
            )}
            {section === "rewards_store" && (
              <DataTable columns={["Title", "XP Cost", "Category", "Coupon", "Qty", "Remaining", "Active"]}
                rows={(rewardsStore || []).filter((s: any) => (s.title || "").toLowerCase().includes(search.toLowerCase())).map((s: any) => ({
                  id: s.id, cells: [s.title, s.xp_cost, s.category || "-", s.coupon_code || "-", s.total_quantity ?? "∞", s.remaining_quantity ?? "∞", s.is_active ? "✅ Yes" : "No"], raw: s,
                }))} onEdit={(r) => openEdit(r.id, r.raw)} onDelete={(id) => handleDelete(id)} />
            )}
            {section === "analytics" && (
              <AnalyticsDashboard />
            )}
            {section === "site_analytics" && (
              <SiteAnalytics />
            )}
            {isLoading && (
              <div className="p-12 text-center text-muted-foreground">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Activity className="h-6 w-6 mx-auto mb-2" />
                </motion.div>Loading...
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Image Lightbox */}
      <AnimatePresence>
        {enlargedImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm cursor-pointer"
            onClick={() => setEnlargedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
              src={enlargedImage} alt="Profile"
              className="max-w-[300px] max-h-[300px] rounded-2xl object-cover shadow-2xl border-2 border-border/50"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Dialogs */}
      <FormDialog open={formOpen} onClose={() => setFormOpen(false)} title={`${editId ? "Edit" : "Create"} ${sectionLabel}`}>
        {section === "colleges" && (
          <>
            <Field label="College Name"><Input className={inputClass} value={form.name || ""} onChange={(e) => setF("name", e.target.value)} placeholder="e.g. ABC Engineering College" /></Field>
            <Field label="Email Domain"><Input className={inputClass} value={form.domain || ""} onChange={(e) => setF("domain", e.target.value)} placeholder="e.g. abccollege.edu" /></Field>
            <Field label="City"><Input className={inputClass} value={form.city || ""} onChange={(e) => setF("city", e.target.value)} /></Field>
            <Field label="State"><Input className={inputClass} value={form.state || ""} onChange={(e) => setF("state", e.target.value)} /></Field>
            <Field label="Logo URL (optional)"><Input className={inputClass} value={form.logo_url || ""} onChange={(e) => setF("logo_url", e.target.value)} /></Field>
          </>
        )}

        {section === "students" && (
          <>
            <Field label="Name"><Input className={inputClass} value={form.name || ""} onChange={(e) => setF("name", e.target.value)} /></Field>
            <Field label="Email"><Input className={inputClass} value={form.email || ""} onChange={(e) => setF("email", e.target.value)} /></Field>
            <Field label="Branch">
              <select className={selectClass} value={form.branch_id || ""} onChange={(e) => setF("branch_id", e.target.value)}>
                <option value="">Select branch</option>
                {displayBranches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {(!branches || branches.length === 0) && displayBranches.length === 0 && (
                <p className="text-[11px] text-accent mt-1">No branches found. Add branches in the Branches section first.</p>
              )}
            </Field>
            <Field label="Graduation Year">
              <select className={selectClass} value={form.graduation_year || ""} onChange={(e) => setF("graduation_year", e.target.value)}>
                <option value="">Select year</option>
                {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </Field>
            <Field label="Bio"><Input className={inputClass} value={form.bio || ""} onChange={(e) => setF("bio", e.target.value)} /></Field>
            <Field label="Skills (comma separated)"><Input className={inputClass} value={typeof form.skills === "string" ? form.skills : (form.skills?.join?.(", ") || "")} onChange={(e) => setF("skills", e.target.value)} /></Field>
            <Field label="XP Points"><Input className={inputClass} type="number" value={form.xp_points || ""} onChange={(e) => setF("xp_points", e.target.value)} /></Field>
            <Field label="Status">
              <select className={selectClass} value={form.status || "active"} onChange={(e) => setF("status", e.target.value)}>
                <option value="active">Active</option><option value="inactive">Inactive</option><option value="alumni">Alumni</option>
              </select>
            </Field>
            {(form.status === "alumni") && (
              <>
                <Field label="Company Name"><Input className={inputClass} value={form.company || ""} onChange={(e) => setF("company", e.target.value)} placeholder="e.g. Google, TCS" /></Field>
                <Field label="Company Type">
                  <select className={selectClass} value={form.company_type || ""} onChange={(e) => setF("company_type", e.target.value)}>
                    <option value="">Select type</option>
                    <option value="tech">Tech</option>
                    <option value="non-tech">Non-Tech</option>
                  </select>
                </Field>
              </>
            )}
            <Field label="Is Topper?">
              <select className={selectClass} value={String(form.is_topper || false)} onChange={(e) => setF("is_topper", e.target.value)}>
                <option value="false">No</option><option value="true">Yes</option>
              </select>
            </Field>
          </>
        )}

        {section === "events" && (
          <>
            <Field label="Title"><Input className={inputClass} value={form.title || ""} onChange={(e) => setF("title", e.target.value)} /></Field>
            <Field label="Description"><Input className={inputClass} value={form.description || ""} onChange={(e) => setF("description", e.target.value)} /></Field>
            <Field label="Type">
              <select className={selectClass} value={form.event_type || "general"} onChange={(e) => setF("event_type", e.target.value)}>
                {["general", "hackathon", "workshop", "seminar", "fest"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Branch">
              <select className={selectClass} value={form.branch_id || ""} onChange={(e) => setF("branch_id", e.target.value)}>
                <option value="">All branches</option>
                {displayBranches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="Date"><Input className={inputClass} type="datetime-local" value={form.date?.slice(0, 16) || ""} onChange={(e) => setF("date", e.target.value)} /></Field>
            <Field label="Location"><Input className={inputClass} value={form.location || ""} onChange={(e) => setF("location", e.target.value)} /></Field>
            <Field label="Status">
              <select className={selectClass} value={form.status || "upcoming"} onChange={(e) => setF("status", e.target.value)}>
                {["upcoming", "ongoing", "completed", "cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </>
        )}

        {section === "achievements" && (
          <>
            <Field label="Title"><Input className={inputClass} value={form.title || ""} onChange={(e) => setF("title", e.target.value)} /></Field>
            <Field label="Description"><Input className={inputClass} value={form.description || ""} onChange={(e) => setF("description", e.target.value)} /></Field>
            <Field label="Student">
              <select className={selectClass} value={form.student_id || ""} onChange={(e) => setF("student_id", e.target.value)}>
                <option value="">Select student</option>
                {(students || []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select className={selectClass} value={form.achievement_type || "general"} onChange={(e) => setF("achievement_type", e.target.value)}>
                {["general", "hackathon", "academic", "research", "sports", "cultural"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </>
        )}

        {section === "announcements" && (
          <>
            <Field label="Title"><Input className={inputClass} value={form.title || ""} onChange={(e) => setF("title", e.target.value)} /></Field>
            <Field label="Content"><Input className={inputClass} value={form.content || ""} onChange={(e) => setF("content", e.target.value)} /></Field>
            <Field label="Priority">
              <select className={selectClass} value={form.priority || "normal"} onChange={(e) => setF("priority", e.target.value)}>
                {["low", "normal", "high", "urgent"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Branch">
              <select className={selectClass} value={form.branch_id || ""} onChange={(e) => setF("branch_id", e.target.value)}>
                <option value="">All branches</option>
                {displayBranches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="Pinned?">
              <select className={selectClass} value={String(form.is_pinned || false)} onChange={(e) => setF("is_pinned", e.target.value)}>
                <option value="false">No</option><option value="true">Yes</option>
              </select>
            </Field>
          </>
        )}

        {section === "hackathons" && (
          <>
            {!editId && (
              <div className="mb-6 p-4 rounded-xl border border-accent/30 bg-accent/5">
                <label className="text-xs font-semibold text-accent mb-2 flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5" /> Paste hackathon URL to auto-fill
                </label>
                <div className="flex gap-2">
                  <Input
                    className={inputClass + " flex-1"}
                    placeholder="https://devfolio.co/hackathon/..."
                    value={form._scrapeUrl || ""}
                    onChange={(e) => setF("_scrapeUrl", e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!form._scrapeUrl || form._scraping}
                    className="border-accent/40 text-accent hover:bg-accent/10"
                    onClick={async () => {
                      setF("_scraping", true);
                      try {
                        const d = await scrapeHackathonUrl(form._scrapeUrl);
                        setForm(prev => ({
                          ...prev,
                          title: d.title || prev.title || "",
                          tagline: d.tagline || prev.tagline || "",
                          date: d.date || prev.date || "",
                          end_date: d.end_date || prev.end_date || "",
                          location: d.location || prev.location || "",
                          prize: d.prize || prev.prize || "",
                          max_participants: d.max_participants || prev.max_participants || "",
                          tags: d.tags?.join?.(", ") || prev.tags || "",
                          link: d.link || prev.link || form._scrapeUrl || "",
                          status: d.status || prev.status || "upcoming",
                          _scraping: false,
                        }));
                        toast({ title: "✨ Auto-filled!", description: `Extracted details for "${d.title}"` });
                      } catch (e: any) {
                        toast({
                          title: "Scrape failed",
                          description: e.message || "Could not extract hackathon details from this URL. Try a different URL or fill in manually.",
                          variant: "destructive",
                        });
                        setF("_scraping", false);
                      }
                    }}
                  >
                    {form._scraping ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
                  </Button>
                </div>
              </div>
            )}
            <Field label="Title"><Input className={inputClass} value={form.title || ""} onChange={(e) => setF("title", e.target.value)} /></Field>
            <Field label="Tagline"><Input className={inputClass} value={form.tagline || ""} onChange={(e) => setF("tagline", e.target.value)} /></Field>
            <Field label="Date (display text)"><Input className={inputClass} value={form.date || ""} onChange={(e) => setF("date", e.target.value)} placeholder="e.g. Mar 15-17, 2026" /></Field>
            <Field label="Location"><Input className={inputClass} value={form.location || ""} onChange={(e) => setF("location", e.target.value)} /></Field>
            <Field label="Current Participants"><Input className={inputClass} type="number" value={form.participants || ""} onChange={(e) => setF("participants", e.target.value)} /></Field>
            <Field label="Max Participants"><Input className={inputClass} type="number" value={form.max_participants || ""} onChange={(e) => setF("max_participants", e.target.value)} /></Field>
            <Field label="Prize"><Input className={inputClass} value={form.prize || ""} onChange={(e) => setF("prize", e.target.value)} placeholder="e.g. ₹5,00,000" /></Field>
            <Field label="Tags (comma separated)"><Input className={inputClass} value={typeof form.tags === "string" ? form.tags : (form.tags?.join?.(", ") || "")} onChange={(e) => setF("tags", e.target.value)} /></Field>
            <Field label="Status">
              <select className={selectClass} value={form.status || "upcoming"} onChange={(e) => setF("status", e.target.value)}>
                {["open", "upcoming", "full", "completed"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Gradient"><Input className={inputClass} value={form.gradient || "from-primary to-purple-400"} onChange={(e) => setF("gradient", e.target.value)} /></Field>
            <Field label="Icon">
              <select className={selectClass} value={form.icon || "globe"} onChange={(e) => setF("icon", e.target.value)}>
                {["globe", "cpu", "sparkles", "zap", "star", "trophy"].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Registration Link"><Input className={inputClass} value={form.link || ""} onChange={(e) => setF("link", e.target.value)} placeholder="https://devfolio.co/..." /></Field>
          </>
        )}

        {section === "clubs" && (
          <>
            <Field label="Name"><Input className={inputClass} value={form.name || ""} onChange={(e) => setF("name", e.target.value)} /></Field>
            <Field label="Slug"><Input className={inputClass} value={form.slug || ""} onChange={(e) => setF("slug", e.target.value)} placeholder="auto-generated from name" /></Field>
            <Field label="Category">
              <select className={selectClass} value={form.category || "Technical"} onChange={(e) => setF("category", e.target.value)}>
                {["Technical", "Cultural", "Social Impact", "Sports", "Arts", "Mental Health", "Entrepreneurship"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Description"><Input className={inputClass} value={form.description || ""} onChange={(e) => setF("description", e.target.value)} /></Field>
            <Field label="Tagline"><Input className={inputClass} value={form.tagline || ""} onChange={(e) => setF("tagline", e.target.value)} /></Field>
            <Field label="Members Count (read-only)">
              <div className="flex gap-2">
                <Input className={inputClass} type="number" value={form.members || ""} readOnly />
                <Button size="sm" variant="outline" className="shrink-0 text-xs" onClick={async () => {
                  if (!editId) return;
                  const { count } = await supabase.from("club_members").select("*", { count: "exact", head: true }).eq("club_id", editId).eq("is_active", true);
                  setF("members", count || 0);
                  toast({ title: `Synced: ${count || 0} members` });
                }}>Sync Count</Button>
              </div>
            </Field>
            <Field label="Active?">
              <select className={selectClass} value={String(form.is_active !== false)} onChange={(e) => setF("is_active", e.target.value === "true")}>
                <option value="true">Yes</option><option value="false">No</option>
              </select>
            </Field>
            <Field label="Founded Year"><Input className={inputClass} type="number" value={form.founded || ""} onChange={(e) => setF("founded", e.target.value)} /></Field>
            <Field label="Banner Gradient">
              <div className="flex gap-2 flex-wrap">
                {[
                  "from-blue-600/40 to-primary/30", "from-purple-600/40 to-pink-500/30",
                  "from-green-600/40 to-emerald-500/30", "from-amber-600/40 to-orange-500/30",
                  "from-red-600/40 to-rose-500/30", "from-cyan-600/40 to-blue-500/30",
                  "from-indigo-600/40 to-violet-500/30", "from-fuchsia-600/40 to-pink-400/30",
                ].map(g => (
                  <button key={g} type="button" onClick={() => setF("banner_gradient", g)}
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${g} border-2 transition-all ${form.banner_gradient === g ? "border-accent scale-110 ring-2 ring-accent/30" : "border-transparent"}`} />
                ))}
              </div>
            </Field>
            <Field label="Focus Tags (comma separated)"><Input className={inputClass} value={typeof form.focus_tags === "string" ? form.focus_tags : (form.focus_tags?.join?.(", ") || "")} onChange={(e) => setF("focus_tags", e.target.value)} /></Field>
            <Field label="Advisor"><Input className={inputClass} value={form.advisor || ""} onChange={(e) => setF("advisor", e.target.value)} /></Field>
            <Field label="Logo Letter"><Input className={inputClass} value={form.logo_letter || ""} onChange={(e) => setF("logo_letter", e.target.value)} maxLength={2} /></Field>
            <Field label="Instagram"><Input className={inputClass} value={form.instagram || ""} onChange={(e) => setF("instagram", e.target.value)} /></Field>
            <Field label="LinkedIn"><Input className={inputClass} value={form.linkedin || ""} onChange={(e) => setF("linkedin", e.target.value)} /></Field>

            <div className="mt-5 mb-2 p-3 rounded-xl border border-border/30 bg-secondary/20">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Club Leadership (Search Student)</p>
              <p className="text-[11px] text-muted-foreground mt-1">Assign 1st President and 2nd President (Vice President) from students.</p>
            </div>

            <Field label="1st President">
              <Input
                className={inputClass}
                value={clubPresidentQuery}
                onChange={(e) => setClubPresidentQuery(e.target.value)}
                placeholder="Search by student name or email"
              />

              {clubPresidentResults.length > 0 && (
                <div className="mt-2 border border-border/30 rounded-xl overflow-hidden">
                  {clubPresidentResults.map((s: any) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setF("president_user_id", s.id);
                        setF("president_name", s.name || "");
                        setClubPresidentQuery(s.name || "");
                        setClubPresidentResults([]);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/40 transition-colors"
                    >
                      <span className="text-foreground">{s.name}</span>
                      {s.email && <span className="text-xs text-muted-foreground ml-2">({s.email})</span>}
                      {s.branch_name && <span className="text-xs text-muted-foreground ml-2">• {s.branch_name}</span>}
                    </button>
                  ))}
                </div>
              )}

              {form.president_user_id && (
                <div className="mt-2 flex items-center justify-between p-2 rounded-lg border border-border/30 bg-secondary/10">
                  <span className="text-xs text-foreground">Selected: {form.president_name}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setF("president_user_id", "");
                      setF("president_name", "");
                      setClubPresidentQuery("");
                      setClubPresidentResults([]);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </Field>

            <Field label="2nd President (Vice President)">
              <Input
                className={inputClass}
                value={clubVicePresidentQuery}
                onChange={(e) => setClubVicePresidentQuery(e.target.value)}
                placeholder="Search by student name or email"
              />

              {clubVicePresidentResults.length > 0 && (
                <div className="mt-2 border border-border/30 rounded-xl overflow-hidden">
                  {clubVicePresidentResults.map((s: any) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setF("vice_president_user_id", s.id);
                        setF("vice_president_name", s.name || "");
                        setClubVicePresidentQuery(s.name || "");
                        setClubVicePresidentResults([]);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/40 transition-colors"
                    >
                      <span className="text-foreground">{s.name}</span>
                      {s.email && <span className="text-xs text-muted-foreground ml-2">({s.email})</span>}
                      {s.branch_name && <span className="text-xs text-muted-foreground ml-2">• {s.branch_name}</span>}
                    </button>
                  ))}
                </div>
              )}

              {form.vice_president_user_id && (
                <div className="mt-2 flex items-center justify-between p-2 rounded-lg border border-border/30 bg-secondary/10">
                  <span className="text-xs text-foreground">Selected: {form.vice_president_name}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setF("vice_president_user_id", "");
                      setF("vice_president_name", "");
                      setClubVicePresidentQuery("");
                      setClubVicePresidentResults([]);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </Field>
          </>
        )}

        {section === "alumni" && (
          <>
            <Field label="Name"><Input className={inputClass} value={form.name || ""} onChange={(e) => setF("name", e.target.value)} /></Field>
            <Field label="Batch">
              <select className={selectClass} value={form.batch || ""} onChange={(e) => setF("batch", e.target.value)}>
                <option value="">Select year</option>
                {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 10 + i).map(y => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </Field>
            <Field label="Department">
              <select className={selectClass} value={form.department || ""} onChange={(e) => setF("department", e.target.value)}>
                <option value="">Select department</option>
                {displayBranches.map((b: any) => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="Role"><Input className={inputClass} value={form.role || ""} onChange={(e) => setF("role", e.target.value)} placeholder="e.g. Senior SDE" /></Field>
            <Field label="Company"><Input className={inputClass} value={form.company || ""} onChange={(e) => setF("company", e.target.value)} /></Field>
            <Field label="Location"><Input className={inputClass} value={form.location || ""} onChange={(e) => setF("location", e.target.value)} /></Field>
            <Field label="Specialization"><Input className={inputClass} value={form.specialization || ""} onChange={(e) => setF("specialization", e.target.value)} /></Field>
            <Field label="Achievements (comma separated)"><Input className={inputClass} value={typeof form.achievements === "string" ? form.achievements : (form.achievements?.join?.(", ") || "")} onChange={(e) => setF("achievements", e.target.value)} /></Field>
            <Field label="LinkedIn"><Input className={inputClass} value={form.linkedin || ""} onChange={(e) => setF("linkedin", e.target.value)} /></Field>
            <Field label="Featured?">
              <select className={selectClass} value={String(form.featured || false)} onChange={(e) => setF("featured", e.target.value)}>
                <option value="false">No</option><option value="true">Yes</option>
              </select>
            </Field>
          </>
        )}

        {section === "ieee_members" && (
          <>
            <Field label="Name"><Input className={inputClass} value={form.name || ""} onChange={(e) => setF("name", e.target.value)} /></Field>
            <Field label="Role"><Input className={inputClass} value={form.role || ""} onChange={(e) => setF("role", e.target.value)} placeholder="e.g. Chairperson" /></Field>
            <Field label="Department"><Input className={inputClass} value={form.department || ""} onChange={(e) => setF("department", e.target.value)} /></Field>
            <Field label="IEEE ID"><Input className={inputClass} value={form.ieee_id || ""} onChange={(e) => setF("ieee_id", e.target.value)} /></Field>
            <Field label="Research Papers"><Input className={inputClass} type="number" value={form.research_papers || ""} onChange={(e) => setF("research_papers", e.target.value)} /></Field>
            <Field label="Specialization"><Input className={inputClass} value={form.specialization || ""} onChange={(e) => setF("specialization", e.target.value)} /></Field>
            <Field label="Bio"><Input className={inputClass} value={form.bio || ""} onChange={(e) => setF("bio", e.target.value)} /></Field>
            <Field label="LinkedIn"><Input className={inputClass} value={form.linkedin || ""} onChange={(e) => setF("linkedin", e.target.value)} /></Field>
            <Field label="Is Officer?">
              <select className={selectClass} value={String(form.is_officer || false)} onChange={(e) => setF("is_officer", e.target.value)}>
                <option value="false">No</option><option value="true">Yes</option>
              </select>
            </Field>
          </>
        )}

        {section === "carousel_slides" && (
          <>
            <Field label="Title"><Input className={inputClass} value={form.title || ""} onChange={(e) => setF("title", e.target.value)} /></Field>
            <Field label="Description"><Input className={inputClass} value={form.description || ""} onChange={(e) => setF("description", e.target.value)} /></Field>
            <Field label="Icon">
              <select className={selectClass} value={form.icon || "rocket"} onChange={(e) => setF("icon", e.target.value)}>
                {["rocket", "trophy", "book", "lightbulb", "users", "palette", "graduation", "code", "globe", "megaphone", "zap", "star"].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Gradient"><Input className={inputClass} value={form.gradient || "from-primary/50 to-accent/30"} onChange={(e) => setF("gradient", e.target.value)} /></Field>
            <Field label="Link (optional)"><Input className={inputClass} value={form.link || ""} onChange={(e) => setF("link", e.target.value)} placeholder="https://... or /page-path" /></Field>

            {/* Media Section */}
            <div className="mb-4 p-4 rounded-xl border border-border/30 bg-secondary/20">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Media</span>
              </div>
              
              {/* Image URL input */}
              <Field label="Image URL">
                <Input className={inputClass} value={form.image_url || ""} onChange={(e) => setF("image_url", e.target.value)} placeholder="https://... or upload below" />
              </Field>

              {/* Image preview */}
              {form.image_url && (
                <div className="mb-3 relative group">
                  <img src={form.image_url} alt="Slide preview" className="w-full h-32 object-cover rounded-lg border border-border/30" />
                  <button onClick={() => setF("image_url", "")} className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              )}

              {/* Upload with crop */}
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-border/50 bg-secondary/30 cursor-pointer hover:border-accent/50 hover:bg-secondary/50 transition-all text-xs text-muted-foreground hover:text-foreground">
                  <Upload className="h-3.5 w-3.5" />
                  <span>{form._uploading ? "Uploading..." : "Upload & Crop Image"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={form._uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        setF("_cropSrc", reader.result as string);
                      };
                      reader.readAsDataURL(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Cropper modal */}
            {form._cropSrc && (
              <ImageCropper
                imageSrc={form._cropSrc}
                aspectRatio={16 / 9}
                circularCrop={false}
                onCancel={() => setF("_cropSrc", null)}
                onCropComplete={async (blob: Blob) => {
                  setF("_cropSrc", null);
                  setF("_uploading", true);
                  try {
                    const fileName = `carousel-${Date.now()}.jpg`;
                    const { error: uploadErr } = await supabase.storage
                      .from("carousel-images")
                      .upload(fileName, blob, { upsert: true, contentType: "image/jpeg" });
                    if (uploadErr) throw uploadErr;
                    const { data: urlData } = supabase.storage
                      .from("carousel-images")
                      .getPublicUrl(fileName);
                    setF("image_url", urlData.publicUrl);
                    setF("_uploading", false);
                  } catch (err: any) {
                    setF("_uploading", false);
                    toast({ title: "Upload failed", description: err.message, variant: "destructive" });
                  }
                }}
              />
            )}

            <Field label="Sort Order"><Input className={inputClass} type="number" value={form.sort_order || 0} onChange={(e) => setF("sort_order", e.target.value)} /></Field>
            <Field label="Active?">
              <select className={selectClass} value={String(form.is_active ?? true)} onChange={(e) => setF("is_active", e.target.value)}>
                <option value="true">Yes</option><option value="false">No</option>
              </select>
            </Field>
          </>
        )}

        {section === "hackathon_carousel" && (
          <>
            <Field label="Title *"><Input className={inputClass} value={form.title || ""} onChange={(e) => setF("title", e.target.value)} placeholder="e.g. HackFest 2026" /></Field>
            <Field label="Category">
              <select className={selectClass} value={form.category || "upcoming"} onChange={(e) => setF("category", e.target.value)}>
                {["upcoming", "must-do", "featured", "trending", "new"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Image URL"><Input className={inputClass} value={form.image_url || ""} onChange={(e) => setF("image_url", e.target.value)} placeholder="https://..." /></Field>
            <Field label="Hyperlink"><Input className={inputClass} value={form.hyperlink || ""} onChange={(e) => setF("hyperlink", e.target.value)} placeholder="https://..." /></Field>
            <Field label="Link Text"><Input className={inputClass} value={form.link_text || "Learn More"} onChange={(e) => setF("link_text", e.target.value)} placeholder="e.g. Register Now" /></Field>
            <Field label="Sort Order"><Input className={inputClass} type="number" value={form.sort_order || 0} onChange={(e) => setF("sort_order", e.target.value)} /></Field>
            <Field label="Active?">
              <select className={selectClass} value={String(form.is_active ?? true)} onChange={(e) => setF("is_active", e.target.value)}>
                <option value="true">Yes</option><option value="false">No</option>
              </select>
            </Field>
          </>
        )}

        {section === "ieee_carousel" && (
          <>
            <Field label="Title *"><Input className={inputClass} value={form.title || ""} onChange={(e) => setF("title", e.target.value)} placeholder="e.g. IEEE Workshop 2026" /></Field>
            <Field label="Category">
              <select className={selectClass} value={form.category || "upcoming"} onChange={(e) => setF("category", e.target.value)}>
                {["upcoming", "must-do", "featured", "trending", "new"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Image URL"><Input className={inputClass} value={form.image_url || ""} onChange={(e) => setF("image_url", e.target.value)} placeholder="https://... or upload below" /></Field>

            {form.image_url && (
              <div className="mb-3 relative group">
                <img src={form.image_url} alt="IEEE carousel preview" className="w-full h-32 object-cover rounded-lg border border-border/30" />
                <button type="button" onClick={() => setF("image_url", "")} className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            )}

            <div className="mb-4">
              <label className="flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-border/50 bg-secondary/30 cursor-pointer hover:border-accent/50 hover:bg-secondary/50 transition-all text-xs text-muted-foreground hover:text-foreground">
                <Upload className="h-3.5 w-3.5" />
                <span>{form._uploading ? "Uploading..." : "Upload & Crop Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={form._uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setF("_cropSrc", reader.result as string);
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            {form._cropSrc && (
              <ImageCropper
                imageSrc={form._cropSrc}
                aspectRatio={16 / 9}
                circularCrop={false}
                onCancel={() => setF("_cropSrc", null)}
                onCropComplete={async (blob: Blob) => {
                  setF("_cropSrc", null);
                  setF("_uploading", true);
                  try {
                    const fileName = `carousel-${Date.now()}.jpg`;
                    const { error: uploadErr } = await supabase.storage
                      .from("carousel-images")
                      .upload(fileName, blob, { upsert: true, contentType: "image/jpeg" });
                    if (uploadErr) throw uploadErr;
                    const { data: urlData } = supabase.storage.from("carousel-images").getPublicUrl(fileName);
                    setF("image_url", urlData.publicUrl);
                  } catch (err: any) {
                    toast({ title: "Upload failed", description: err.message, variant: "destructive" });
                  } finally {
                    setF("_uploading", false);
                  }
                }}
              />
            )}
            <Field label="Hyperlink"><Input className={inputClass} value={form.hyperlink || ""} onChange={(e) => setF("hyperlink", e.target.value)} placeholder="https://..." /></Field>
            <Field label="Link Text"><Input className={inputClass} value={form.link_text || "Learn More"} onChange={(e) => setF("link_text", e.target.value)} placeholder="e.g. Read More" /></Field>
            <Field label="Sort Order"><Input className={inputClass} type="number" value={form.sort_order || 0} onChange={(e) => setF("sort_order", e.target.value)} /></Field>
            <Field label="Active?">
              <select className={selectClass} value={String(form.is_active ?? true)} onChange={(e) => setF("is_active", e.target.value)}>
                <option value="true">Yes</option><option value="false">No</option>
              </select>
            </Field>
          </>
        )}

        {section === "ieee_conferences" && (
          <>
            <Field label="Title *"><Input className={inputClass} value={form.title || ""} onChange={(e) => setF("title", e.target.value)} placeholder="e.g. IEEE Conference on AI" /></Field>
            <Field label="Description"><Input className={inputClass} value={form.description || ""} onChange={(e) => setF("description", e.target.value)} /></Field>
            <Field label="Type">
              <select className={selectClass} value={form.conference_type || "conference"} onChange={(e) => setF("conference_type", e.target.value)}>
                {["conference", "symposium", "workshop", "hackathon", "webinar", "summit"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Date (display text)"><Input className={inputClass} value={form.date || ""} onChange={(e) => setF("date", e.target.value)} placeholder="e.g. Apr 15-17, 2026" /></Field>
            <Field label="End Date (optional)"><Input className={inputClass} value={form.end_date || ""} onChange={(e) => setF("end_date", e.target.value)} /></Field>
            <Field label="Location"><Input className={inputClass} value={form.location || ""} onChange={(e) => setF("location", e.target.value)} placeholder="e.g. New Delhi" /></Field>
            <Field label="Hyperlink"><Input className={inputClass} value={form.hyperlink || ""} onChange={(e) => setF("hyperlink", e.target.value)} placeholder="https://..." /></Field>
            <Field label="Sort Order"><Input className={inputClass} type="number" value={form.sort_order || 0} onChange={(e) => setF("sort_order", e.target.value)} /></Field>
            <Field label="Active?">
              <select className={selectClass} value={String(form.is_active ?? true)} onChange={(e) => setF("is_active", e.target.value)}>
                <option value="true">Yes</option><option value="false">No</option>
              </select>
            </Field>
          </>
        )}

        {section === "branch_featured" && (
          <>
            <Field label="Branch">
              <select className={selectClass} value={form.branch_id || ""} onChange={(e) => setF("branch_id", e.target.value)}>
                <option value="">Select branch</option>
                {displayBranches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="Student">
              <select className={selectClass} value={form.student_id || ""} onChange={(e) => setF("student_id", e.target.value)}>
                <option value="">Select student</option>
                {(students || []).filter((s: any) => {
                  if (!form.branch_id) return true;
                  if (s.branch_id === form.branch_id) return true;
                  // Fuzzy match: check if student's branch_name is a sub-branch of the selected branch
                  const selectedBranch = displayBranches.find((b: any) => b.id === form.branch_id);
                  if (selectedBranch && s.branch_name) {
                    return branchesData.some(main =>
                      main.name === selectedBranch.name &&
                      (s.branch_name === main.name || main.subBranches.some(sb => sb.name === s.branch_name))
                    );
                  }
                  return false;
                }).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Achievement"><Input className={inputClass} value={form.achievement || ""} onChange={(e) => setF("achievement", e.target.value)} placeholder="e.g. Built SaathVerse Platform" /></Field>
            <Field label="Sort Order"><Input className={inputClass} type="number" value={form.sort_order || 0} onChange={(e) => setF("sort_order", e.target.value)} /></Field>
          </>
        )}
        {section === "startup_carousel" && (
          <>
            <Field label="Title *"><Input className={inputClass} value={form.title || ""} onChange={(e) => setF("title", e.target.value)} placeholder="e.g. Pitch Day 2026" /></Field>
            <Field label="Description"><Input className={inputClass} value={form.description || ""} onChange={(e) => setF("description", e.target.value)} placeholder="Short description..." /></Field>
            <Field label="Category">
              <select className={selectClass} value={form.category || "featured"} onChange={(e) => setF("category", e.target.value)}>
                {["featured", "challenge", "event", "announcement", "trending"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Image URL"><Input className={inputClass} value={form.image_url || ""} onChange={(e) => setF("image_url", e.target.value)} placeholder="https://... or upload below" /></Field>

            {form.image_url && (
              <div className="mb-3 relative group">
                <img src={form.image_url} alt="Startup carousel preview" className="w-full h-32 object-cover rounded-lg border border-border/30" />
                <button type="button" onClick={() => setF("image_url", "")} className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            )}

            <div className="mb-4">
              <label className="flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-border/50 bg-secondary/30 cursor-pointer hover:border-accent/50 hover:bg-secondary/50 transition-all text-xs text-muted-foreground hover:text-foreground">
                <Upload className="h-3.5 w-3.5" />
                <span>{form._uploading ? "Uploading..." : "Upload & Crop Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={form._uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setF("_cropSrc", reader.result as string);
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            {form._cropSrc && (
              <ImageCropper
                imageSrc={form._cropSrc}
                aspectRatio={16 / 9}
                circularCrop={false}
                onCancel={() => setF("_cropSrc", null)}
                onCropComplete={async (blob: Blob) => {
                  setF("_cropSrc", null);
                  setF("_uploading", true);
                  try {
                    const fileName = `carousel-${Date.now()}.jpg`;
                    const { error: uploadErr } = await supabase.storage
                      .from("carousel-images")
                      .upload(fileName, blob, { upsert: true, contentType: "image/jpeg" });
                    if (uploadErr) throw uploadErr;
                    const { data: urlData } = supabase.storage.from("carousel-images").getPublicUrl(fileName);
                    setF("image_url", urlData.publicUrl);
                  } catch (err: any) {
                    toast({ title: "Upload failed", description: err.message, variant: "destructive" });
                  } finally {
                    setF("_uploading", false);
                  }
                }}
              />
            )}
            <Field label="Hyperlink"><Input className={inputClass} value={form.hyperlink || ""} onChange={(e) => setF("hyperlink", e.target.value)} placeholder="https://..." /></Field>
            <Field label="Link Text"><Input className={inputClass} value={form.link_text || "Learn More"} onChange={(e) => setF("link_text", e.target.value)} /></Field>
            <Field label="Sort Order"><Input className={inputClass} type="number" value={form.sort_order || 0} onChange={(e) => setF("sort_order", e.target.value)} /></Field>
            <Field label="Active?">
              <select className={selectClass} value={String(form.is_active ?? true)} onChange={(e) => setF("is_active", e.target.value)}>
                <option value="true">Yes</option><option value="false">No</option>
              </select>
            </Field>
          </>
        )}
        {section === "discover_carousel" && (
          <>
            <Field label="Title *"><Input className={inputClass} value={form.title || ""} onChange={(e) => setF("title", e.target.value)} placeholder="e.g. Campus Fest 2026" /></Field>
            <Field label="Description"><Input className={inputClass} value={form.description || ""} onChange={(e) => setF("description", e.target.value)} placeholder="Short description..." /></Field>
            <Field label="Category">
              <select className={selectClass} value={form.category || "promotion"} onChange={(e) => setF("category", e.target.value)}>
                {["promotion", "featured", "event", "announcement", "trending", "new", "offer", "sponsor"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Image URL"><Input className={inputClass} value={form.image_url || ""} onChange={(e) => setF("image_url", e.target.value)} placeholder="https://... or upload below" /></Field>

            {form.image_url && (
              <div className="mb-3 relative group">
                <img src={form.image_url} alt="Discover carousel preview" className="w-full h-32 object-cover rounded-lg border border-border/30" />
                <button type="button" onClick={() => setF("image_url", "")} className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            )}

            <div className="mb-4">
              <label className="flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-border/50 bg-secondary/30 cursor-pointer hover:border-accent/50 hover:bg-secondary/50 transition-all text-xs text-muted-foreground hover:text-foreground">
                <Upload className="h-3.5 w-3.5" />
                <span>{form._uploading ? "Uploading..." : "Upload & Crop Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={form._uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setF("_cropSrc", reader.result as string);
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            {form._cropSrc && (
              <ImageCropper
                imageSrc={form._cropSrc}
                aspectRatio={16 / 9}
                circularCrop={false}
                onCancel={() => setF("_cropSrc", null)}
                onCropComplete={async (blob: Blob) => {
                  setF("_cropSrc", null);
                  setF("_uploading", true);
                  try {
                    const fileName = `carousel-${Date.now()}.jpg`;
                    const { error: uploadErr } = await supabase.storage
                      .from("carousel-images")
                      .upload(fileName, blob, { upsert: true, contentType: "image/jpeg" });
                    if (uploadErr) throw uploadErr;
                    const { data: urlData } = supabase.storage.from("carousel-images").getPublicUrl(fileName);
                    setF("image_url", urlData.publicUrl);
                  } catch (err: any) {
                    toast({ title: "Upload failed", description: err.message, variant: "destructive" });
                  } finally {
                    setF("_uploading", false);
                  }
                }}
              />
            )}
            <Field label="Gradient (if no image)"><Input className={inputClass} value={form.gradient || ""} onChange={(e) => setF("gradient", e.target.value)} placeholder="from-primary/30 to-accent/20" /></Field>
            <Field label="Hyperlink"><Input className={inputClass} value={form.hyperlink || ""} onChange={(e) => setF("hyperlink", e.target.value)} placeholder="https://..." /></Field>
            <Field label="Link Text"><Input className={inputClass} value={form.link_text || "Learn More"} onChange={(e) => setF("link_text", e.target.value)} /></Field>
            <Field label="Sort Order"><Input className={inputClass} type="number" value={form.sort_order || 0} onChange={(e) => setF("sort_order", e.target.value)} /></Field>
            <Field label="Active?">
              <select className={selectClass} value={String(form.is_active ?? true)} onChange={(e) => setF("is_active", e.target.value)}>
                <option value="true">Yes</option><option value="false">No</option>
              </select>
            </Field>
          </>
        )}
        {section === "rewards_store" && (
          <>
            <Field label="Title *"><Input className={inputClass} value={form.title || ""} onChange={(e) => setF("title", e.target.value)} placeholder="e.g. Campus Café Voucher" /></Field>
            <Field label="Description"><Input className={inputClass} value={form.description || ""} onChange={(e) => setF("description", e.target.value)} placeholder="Free coffee at campus café" /></Field>
            <Field label="XP Cost *"><Input className={inputClass} type="number" value={form.xp_cost || ""} onChange={(e) => setF("xp_cost", e.target.value)} placeholder="500" /></Field>
            <Field label="Category">
              <select className={selectClass} value={form.category || "coupon"} onChange={(e) => setF("category", e.target.value)}>
                {["coupon", "badge", "access", "merch", "other"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Icon">
              <select className={selectClass} value={form.icon || "gift"} onChange={(e) => setF("icon", e.target.value)}>
                {["gift", "coffee", "book-open", "crown", "ticket", "shirt", "door-open", "utensils", "graduation-cap"].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Coupon Code"><Input className={inputClass} value={form.coupon_code || ""} onChange={(e) => setF("coupon_code", e.target.value)} placeholder="e.g. CAFE2026 (optional)" /></Field>
            <Field label="Total Quantity"><Input className={inputClass} type="number" value={form.total_quantity || ""} onChange={(e) => setF("total_quantity", e.target.value)} placeholder="Leave empty for unlimited" /></Field>
            <Field label="Remaining Quantity"><Input className={inputClass} type="number" value={form.remaining_quantity || ""} onChange={(e) => setF("remaining_quantity", e.target.value)} placeholder="Leave empty for unlimited" /></Field>
            <Field label="Active?">
              <select className={selectClass} value={String(form.is_active ?? true)} onChange={(e) => setF("is_active", e.target.value)}>
                <option value="true">Yes</option><option value="false">No</option>
              </select>
            </Field>
          </>
        )}
        <Button onClick={handleSave} className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl glow-accent">
          {editId ? "Update" : "Create"}
        </Button>
      </FormDialog>
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================
const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    active: "bg-green-500/15 text-green-400 border-green-500/20",
    inactive: "bg-muted text-muted-foreground border-border",
    alumni: "bg-primary/15 text-primary border-primary/20",
    upcoming: "bg-sky-500/15 text-sky-400 border-sky-500/20",
    ongoing: "bg-green-500/15 text-green-400 border-green-500/20",
    completed: "bg-muted text-muted-foreground border-border",
    cancelled: "bg-destructive/15 text-destructive border-destructive/20",
    open: "bg-green-500/15 text-green-400 border-green-500/20",
    full: "bg-destructive/15 text-destructive border-destructive/20",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${colors[status] || colors.active}`}>{status}</span>;
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const colors: Record<string, string> = { low: "bg-muted text-muted-foreground", normal: "bg-sky-500/15 text-sky-400", high: "bg-amber-500/15 text-amber-400", urgent: "bg-destructive/15 text-destructive" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[priority] || ""}`}>{priority}</span>;
};

const CategoryBadge = ({ category }: { category: string }) => {
  const colors: Record<string, string> = {
    Technical: "bg-blue-500/15 text-blue-400", Cultural: "bg-primary/15 text-primary", "Social Impact": "bg-emerald-500/15 text-emerald-400",
    Arts: "bg-accent/15 text-accent", "Mental Health": "bg-pink-500/15 text-pink-400", Sports: "bg-yellow-500/15 text-yellow-400", Entrepreneurship: "bg-cyan-500/15 text-cyan-400",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[category] || "bg-muted text-muted-foreground"}`}>{category}</span>;
};

type DataRow = { id: string; cells: React.ReactNode[]; raw: any };
const DataTable = ({ columns, rows, onEdit, onDelete }: { columns: string[]; rows: DataRow[]; onEdit: (r: DataRow) => void; onDelete: (id: string) => void }) => (
  <>
    <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr) 100px` }}>
      {columns.map((col) => (
        <div key={col} className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border bg-secondary/20">{col}</div>
      ))}
      <div className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border bg-secondary/20">Actions</div>
      {rows.map((row) => (
        <motion.div key={row.id} className="contents group" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {row.cells.map((cell, ci) => (
            <div key={ci} className="px-4 py-3 text-sm text-foreground/80 border-b border-border/20 flex items-center group-hover:bg-secondary/10 transition-colors truncate">{cell}</div>
          ))}
          <div className="px-4 py-3 border-b border-border/20 flex items-center gap-1 group-hover:bg-secondary/10 transition-colors">
            <button onClick={() => onEdit(row)} className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50"><Pencil className="h-3.5 w-3.5" /></button>
            <button onClick={() => onDelete(row.id)} className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        </motion.div>
      ))}
    </div>
    {rows.length === 0 && <div className="p-12 text-center text-muted-foreground text-sm">No records found. Click "Add" to create one.</div>}
    <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">{rows.length} record{rows.length !== 1 ? "s" : ""}</div>
  </>
);

export default Admin;
