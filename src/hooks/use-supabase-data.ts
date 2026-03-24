import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

// ==================== COLLEGES (with realtime) ====================
export const useCollegesRealtime = () => {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("colleges-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "colleges" }, () => {
        qc.invalidateQueries({ queryKey: ["colleges"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);
};

export const useColleges = () =>
  useQuery({
    queryKey: ["colleges"],
    queryFn: async () => {
      const { data, error } = await supabase.from("colleges").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

export const useUpsertCollege = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: any) => {
      const { data, error } = await supabase.from("colleges").upsert(c).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["colleges"] }),
  });
};

export const useDeleteCollege = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("colleges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["colleges"] }),
  });
};


// ==================== BRANCHES (legacy — kept for events/announcements backward compat) ====================
export const useBranches = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["branches", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const { data, error } = await supabase.from("branches").select("*").eq("college_id", collegeId!).order("name");
      if (error) throw error;
      return data as Tables<"branches">[];
    },
  });
};

export const useUpsertBranch = () => {
  const qc = useQueryClient();
  const { collegeId } = useAuth();
  return useMutation({
    mutationFn: async (branch: TablesInsert<"branches">) => {
      const { data, error } = await supabase.from("branches").upsert({ ...branch, college_id: collegeId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["branches"] }),
  });
};

export const useDeleteBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("branches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["branches"] }),
  });
};

// ==================== MAIN BRANCHES (new global tables) ====================
export const useMainBranches = () =>
  useQuery({
    queryKey: ["main_branches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("main_branches" as any).select("*").order("name");
      if (error) throw error;
      return data as any[];
    },
  });

export const useSpecializations = (mainBranchId?: string | null) =>
  useQuery({
    queryKey: ["specializations", mainBranchId],
    queryFn: async () => {
      let q = supabase.from("specializations" as any).select("*, main_branches:branch_id(id, name, slug)").order("name");
      if (mainBranchId) q = q.eq("branch_id", mainBranchId);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });

// ==================== STUDENTS ====================
export const useStudents = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["students", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*, branches(name, slug), main_branch:main_branch_id(id, name, slug), specialization:specialization_id(id, name)")
        .eq("college_id", collegeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertStudent = () => {
  const qc = useQueryClient();
  const { collegeId } = useAuth();
  return useMutation({
    mutationFn: async (student: TablesInsert<"students">) => {
      const { data, error } = await supabase.from("students").upsert({ ...student, college_id: collegeId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
};

export const useDeleteStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
};

// ==================== EVENTS ====================
export const useEvents = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["events", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, branches(name)")
        .eq("college_id", collegeId!)
        .order("sort_order", { ascending: true })
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertEvent = () => {
  const qc = useQueryClient();
  const { collegeId } = useAuth();
  return useMutation({
    mutationFn: async (event: TablesInsert<"events">) => {
      const { data, error } = await supabase.from("events").upsert({ ...event, college_id: collegeId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
};

export const useDeleteEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
};

// ==================== ACHIEVEMENTS ====================
export const useAchievements = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["achievements", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*, students(name)")
        .eq("college_id", collegeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertAchievement = () => {
  const qc = useQueryClient();
  const { collegeId } = useAuth();
  return useMutation({
    mutationFn: async (ach: TablesInsert<"achievements">) => {
      const { data, error } = await supabase.from("achievements").upsert({ ...ach, college_id: collegeId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["achievements"] }),
  });
};

export const useDeleteAchievement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("achievements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["achievements"] }),
  });
};

// ==================== ANNOUNCEMENTS ====================
export const useAnnouncements = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["announcements", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*, branches(name)")
        .eq("college_id", collegeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertAnnouncement = () => {
  const qc = useQueryClient();
  const { collegeId } = useAuth();
  return useMutation({
    mutationFn: async (ann: TablesInsert<"announcements">) => {
      const { data, error } = await supabase.from("announcements").upsert({ ...ann, college_id: collegeId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
};

export const useDeleteAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
};

// ==================== HACKATHONS ====================
export const useHackathons = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["hackathons", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const { data, error } = await supabase.from("hackathons").select("*")
        .eq("college_id", collegeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertHackathon = () => {
  const qc = useQueryClient();
  const { collegeId } = useAuth();
  return useMutation({
    mutationFn: async (h: any) => {
      const { data, error } = await supabase.from("hackathons").upsert({ ...h, college_id: collegeId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hackathons"] }),
  });
};

export const useDeleteHackathon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hackathons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hackathons"] }),
  });
};

// ==================== CLUBS ====================
export const useClubs = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["clubs", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const { data, error } = await supabase.from("clubs").select("*").eq("college_id", collegeId!).eq("is_active", true).order("name");
      if (error) throw error;
      return data;
    },
  });
};

export const useClubBySlug = (slug: string | undefined) => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["clubs", slug, collegeId],
    enabled: !!slug && !!collegeId,
    queryFn: async () => {
      const { data, error } = await supabase.from("clubs").select("*").eq("slug", slug!).eq("college_id", collegeId!).single();
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertClub = () => {
  const qc = useQueryClient();
  const { collegeId } = useAuth();
  return useMutation({
    mutationFn: async (c: any) => {
      const { data, error } = await supabase.from("clubs").upsert({ ...c, college_id: collegeId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clubs"] }),
  });
};

export const useDeleteClub = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clubs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clubs"] }),
  });
};

// ==================== ALUMNI ====================
export const useAlumni = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["alumni", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const { data, error } = await supabase.from("alumni").select("*").eq("college_id", collegeId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertAlumni = () => {
  const qc = useQueryClient();
  const { collegeId } = useAuth();
  return useMutation({
    mutationFn: async (a: any) => {
      const { data, error } = await supabase.from("alumni").upsert({ ...a, college_id: collegeId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alumni"] }),
  });
};

export const useDeleteAlumni = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alumni").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alumni"] }),
  });
};

// ==================== IEEE MEMBERS ====================
export const useIEEEMembers = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["ieee_members", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const { data, error } = await supabase.from("ieee_members").select("*").eq("college_id", collegeId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertIEEEMember = () => {
  const qc = useQueryClient();
  const { collegeId } = useAuth();
  return useMutation({
    mutationFn: async (m: any) => {
      const { data, error } = await supabase.from("ieee_members").upsert({ ...m, college_id: collegeId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ieee_members"] }),
  });
};

export const useDeleteIEEEMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ieee_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ieee_members"] }),
  });
};

// ==================== CAROUSEL SLIDES ====================
export const useCarouselSlides = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["carousel_slides", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carousel_slides")
        .select("*")
        .eq("is_active", true)
        .eq("college_id", collegeId!)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
};

export const useAllCarouselSlides = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["carousel_slides_all", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carousel_slides")
        .select("*")
        .eq("college_id", collegeId!)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertCarouselSlide = () => {
  const qc = useQueryClient();
  const { collegeId } = useAuth();
  return useMutation({
    mutationFn: async (s: any) => {
      const { data, error } = await supabase.from("carousel_slides").upsert({ ...s, college_id: collegeId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["carousel_slides"] });
      qc.invalidateQueries({ queryKey: ["carousel_slides_all"] });
    },
  });
};

export const useDeleteCarouselSlide = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("carousel_slides").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["carousel_slides"] });
      qc.invalidateQueries({ queryKey: ["carousel_slides_all"] });
    },
  });
};

// ==================== PUBLIC HOOKS (no auth needed) ====================
export const usePublicBranches = () =>
  useQuery({
    queryKey: ["branches_public"],
    queryFn: async () => {
      const { data, error } = await supabase.from("branches").select("*").order("name");
      if (error) throw error;
      return data as Tables<"branches">[];
    },
  });

export const usePublicMainBranches = () =>
  useQuery({
    queryKey: ["main_branches_public"],
    queryFn: async () => {
      const { data, error } = await supabase.from("main_branches" as any).select("*").order("name");
      if (error) throw error;
      return data as any[];
    },
  });

export const usePublicCarouselSlides = () =>
  useQuery({
    queryKey: ["carousel_slides_public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carousel_slides")
        .select("*")
        .eq("is_active", true)
        .is("college_id", null)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

// ==================== FORM SETTINGS ====================
export const useFormSettings = (collegeId: string | null) =>
  useQuery({
    queryKey: ["form_settings", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("form_settings")
        .select("*")
        .eq("college_id", collegeId!)
        .order("setting_key");
      if (error) throw error;
      return data;
    },
  });

export const useUpsertFormSetting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: any) => {
      const { data, error } = await supabase.from("form_settings").upsert(s, { onConflict: "college_id,setting_key" }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["form_settings"] }),
  });
};

// ==================== HACKATHON CAROUSEL ====================
export const useHackathonCarousel = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["hackathon_carousel", collegeId],
    queryFn: async () => {
      let q = supabase
        .from("hackathon_carousel")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (collegeId) q = q.eq("college_id", collegeId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
};

export const useAllHackathonCarousel = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["hackathon_carousel_all", collegeId],
    queryFn: async () => {
      let q = supabase
        .from("hackathon_carousel")
        .select("*")
        .order("sort_order");
      if (collegeId) q = q.eq("college_id", collegeId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertHackathonCarousel = () => {
  const qc = useQueryClient();
  const { collegeId } = useAuth();
  return useMutation({
    mutationFn: async (s: any) => {
      const { data, error } = await supabase.from("hackathon_carousel").upsert({ ...s, college_id: collegeId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["hackathon_carousel"] }); qc.invalidateQueries({ queryKey: ["hackathon_carousel_all"] }); },
  });
};

export const useDeleteHackathonCarousel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hackathon_carousel").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["hackathon_carousel"] }); qc.invalidateQueries({ queryKey: ["hackathon_carousel_all"] }); },
  });
};

// ==================== IEEE CONFERENCES ====================
export const useIEEEConferences = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["ieee_conferences", collegeId],
    queryFn: async () => {
      let q = supabase.from("ieee_conferences" as any).select("*").eq("is_active", true).order("sort_order");
      if (collegeId) q = q.eq("college_id", collegeId);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });
};

export const useAllIEEEConferences = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["ieee_conferences_all", collegeId],
    queryFn: async () => {
      let q = supabase.from("ieee_conferences" as any).select("*").order("sort_order");
      if (collegeId) q = q.eq("college_id", collegeId);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });
};

export const useUpsertIEEEConference = () => {
  const qc = useQueryClient();
  const { collegeId } = useAuth();
  return useMutation({
    mutationFn: async (s: any) => {
      const { data, error } = await supabase.from("ieee_conferences" as any).upsert({ ...s, college_id: collegeId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ieee_conferences"] }); qc.invalidateQueries({ queryKey: ["ieee_conferences_all"] }); },
  });
};

export const useDeleteIEEEConference = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ieee_conferences" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ieee_conferences"] }); qc.invalidateQueries({ queryKey: ["ieee_conferences_all"] }); },
  });
};

// ==================== IEEE CAROUSEL ====================
export const useIEEECarousel = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["ieee_carousel", collegeId],
    queryFn: async () => {
      let q = supabase
        .from("ieee_carousel" as any)
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (collegeId) q = q.eq("college_id", collegeId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
};

export const useAllIEEECarousel = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["ieee_carousel_all", collegeId],
    queryFn: async () => {
      let q = supabase
        .from("ieee_carousel" as any)
        .select("*")
        .order("sort_order");
      if (collegeId) q = q.eq("college_id", collegeId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertIEEECarousel = () => {
  const qc = useQueryClient();
  const { collegeId } = useAuth();
  return useMutation({
    mutationFn: async (s: any) => {
      const { data, error } = await supabase.from("ieee_carousel" as any).upsert({ ...s, college_id: collegeId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ieee_carousel"] }); qc.invalidateQueries({ queryKey: ["ieee_carousel_all"] }); },
  });
};

export const useDeleteIEEECarousel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ieee_carousel" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ieee_carousel"] }); qc.invalidateQueries({ queryKey: ["ieee_carousel_all"] }); },
  });
};

// ==================== BRANCH FEATURED STUDENTS ====================
export const useBranchFeaturedStudents = (branchId?: string | null) => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["branch_featured_students", collegeId, branchId],
    queryFn: async () => {
      let q = supabase
        .from("branch_featured_students" as any)
        .select("*, students(id, name, avatar_url, skills, bio, graduation_year, branches(name)), branches(id, name)")
        .order("sort_order");
      if (collegeId) q = q.eq("college_id", collegeId);
      if (branchId) q = q.eq("branch_id", branchId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
};

export const useAllBranchFeaturedStudents = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["branch_featured_students_all", collegeId],
    queryFn: async () => {
      let q = supabase
        .from("branch_featured_students" as any)
        .select("*, students(id, name), branches(id, name)")
        .order("sort_order");
      if (collegeId) q = q.eq("college_id", collegeId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertBranchFeaturedStudent = () => {
  const qc = useQueryClient();
  const { collegeId } = useAuth();
  return useMutation({
    mutationFn: async (s: any) => {
      const { data, error } = await supabase.from("branch_featured_students" as any).upsert({ ...s, college_id: collegeId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["branch_featured_students"] }),
  });
};

export const useDeleteBranchFeaturedStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("branch_featured_students" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["branch_featured_students"] }),
  });
};

// ==================== STARTUP CAROUSEL ====================
export const useStartupCarousel = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["startup_carousel", collegeId],
    queryFn: async () => {
      let q = supabase.from("startup_carousel" as any).select("*").eq("is_active", true).order("sort_order");
      if (collegeId) q = q.eq("college_id", collegeId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
};

export const useAllStartupCarousel = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["startup_carousel_all", collegeId],
    queryFn: async () => {
      let q = supabase.from("startup_carousel" as any).select("*").order("sort_order");
      if (collegeId) q = q.eq("college_id", collegeId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertStartupCarousel = () => {
  const qc = useQueryClient();
  const { collegeId } = useAuth();
  return useMutation({
    mutationFn: async (s: any) => {
      const { data, error } = await supabase.from("startup_carousel" as any).upsert({ ...s, college_id: collegeId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["startup_carousel"] }),
  });
};

export const useDeleteStartupCarousel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("startup_carousel" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["startup_carousel"] }),
  });
};

// ==================== SPOTLIGHT CAROUSEL ====================
export const useSpotlightCarousel = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["spotlight_carousel", collegeId],
    queryFn: async () => {
      let q = supabase.from("spotlight_carousel" as any).select("*")
        .eq("is_active", true)
        .eq("carousel_enabled", true)
        .order("sort_order");
      if (collegeId) q = q.eq("college_id", collegeId);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useSpotlightCarouselAdmin = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["spotlight_carousel_admin", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const { data, error } = await supabase.from("spotlight_carousel" as any).select("*")
        .eq("college_id", collegeId!)
        .order("sort_order");
      if (error) throw error;
      return data || [];
    },
  });
};

export const useUpsertSpotlight = () => {
  const qc = useQueryClient();
  const { collegeId } = useAuth();
  return useMutation({
    mutationFn: async (s: any) => {
      const { data, error } = await supabase.from("spotlight_carousel" as any).upsert({ ...s, college_id: collegeId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["spotlight_carousel"] });
      qc.invalidateQueries({ queryKey: ["spotlight_carousel_admin"] });
    },
  });
};

export const useDeleteSpotlight = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("spotlight_carousel" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["spotlight_carousel"] });
      qc.invalidateQueries({ queryKey: ["spotlight_carousel_admin"] });
    },
  });
};

// ==================== DISCOVER CAROUSEL ====================
export const useDiscoverCarousel = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["discover_carousel", collegeId],
    queryFn: async () => {
      let q = supabase.from("discover_carousel" as any).select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (collegeId) q = q.eq("college_id", collegeId);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useAllDiscoverCarousel = () => {
  const { collegeId } = useAuth();
  return useQuery({
    queryKey: ["discover_carousel_all", collegeId],
    queryFn: async () => {
      let q = supabase.from("discover_carousel" as any).select("*").order("sort_order");
      if (collegeId) q = q.eq("college_id", collegeId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertDiscoverCarousel = () => {
  const qc = useQueryClient();
  const { collegeId } = useAuth();
  return useMutation({
    mutationFn: async (s: any) => {
      const { data, error } = await supabase.from("discover_carousel" as any).upsert({ ...s, college_id: collegeId }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["discover_carousel"] }); qc.invalidateQueries({ queryKey: ["discover_carousel_all"] }); },
  });
};

export const useDeleteDiscoverCarousel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("discover_carousel" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["discover_carousel"] }); qc.invalidateQueries({ queryKey: ["discover_carousel_all"] }); },
  });
};
