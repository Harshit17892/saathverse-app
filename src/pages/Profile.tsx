import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, MapPin, Calendar, Github, Linkedin, Code2,
  BookOpen, Users, Edit3, ExternalLink, Plus, Trash2, X, Save, Lock, KeyRound
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const HexPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="hex-profile" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
        <path d="M28 2L54 18V50L28 66L2 50V18L28 2Z" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
        <path d="M28 34L54 50V82L28 98L2 82V50L28 34Z" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hex-profile)" />
  </svg>
);

interface Project {
  id: string;
  title: string;
  description: string | null;
  tech_stack: string[];
  github_link: string | null;
  live_link: string | null;
  image_url: string | null;
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "projects">("overview");
  const { user, profile, college, refreshProfile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingSocials, setEditingSocials] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [newProject, setNewProject] = useState({ title: "", description: "", tech_stack: "", github_link: "", live_link: "" });

  // Edit Profile modal
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", bio: "", branch: "", year_of_study: "", skills: "", hide_photo: false, passout_year: null as number | null });
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password modal
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const navigate = useNavigate();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const branch = profile?.branch || "Not set";
  const yearOfStudy = profile?.year_of_study || "";
  const bio = profile?.bio || "No bio yet";
  const skills: string[] = profile?.skills || [];
  const photoUrl = profile?.photo_url || null;
  const collegeName = college?.name || "";
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "";
  const isAlumni = profile?.is_alumni || false;
  const company = profile?.company || "";

  useEffect(() => {
    if (profile) {
      setGithubUrl(profile.github_url || "");
      setLinkedinUrl(profile.linkedin_url || "");
    }
  }, [profile]);

  useEffect(() => {
    if (user && activeTab === "projects") fetchProjects();
  }, [user, activeTab]);

  const fetchProjects = async () => {
    if (!user) return;
    setLoadingProjects(true);
    const { data } = await supabase.from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setProjects((data as any) || []);
    setLoadingProjects(false);
  };

  const saveSocials = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      github_url: githubUrl || null,
      linkedin_url: linkedinUrl || null,
    } as any).eq("user_id", user.id);
    if (error) toast.error("Failed to save");
    else { toast.success("Social links saved!"); await refreshProfile(); setEditingSocials(false); }
  };

  const addProject = async () => {
    if (!user || !newProject.title.trim()) { toast.error("Title is required"); return; }
    const { error } = await supabase.from("projects" as any).insert({
      user_id: user.id,
      title: newProject.title.trim(),
      description: newProject.description || null,
      tech_stack: newProject.tech_stack ? newProject.tech_stack.split(",").map(s => s.trim()).filter(Boolean) : [],
      github_link: newProject.github_link || null,
      live_link: newProject.live_link || null,
    } as any);
    if (error) toast.error("Failed to add project");
    else { toast.success("Project added!"); setNewProject({ title: "", description: "", tech_stack: "", github_link: "", live_link: "" }); setShowAddProject(false); fetchProjects(); }
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from("projects" as any).delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); fetchProjects(); }
  };

  // Edit Profile handlers
  const openEditProfile = () => {
    setEditForm({
      full_name: profile?.full_name || "",
      bio: profile?.bio || "",
      branch: profile?.branch || "",
      year_of_study: profile?.year_of_study || "",
      skills: (profile?.skills || []).join(", "),
      hide_photo: profile?.hide_photo || false,
      passout_year: (profile as any)?.passout_year || null,
    });
    setShowEditProfile(true);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const normalizedBranch = editForm.branch.trim() || null;
    const normalizedYear = editForm.year_of_study || null;
    const normalizedSkills = editForm.skills ? editForm.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

    const { error } = await supabase.from("profiles").update({
      full_name: editForm.full_name.trim() || null,
      bio: editForm.bio.trim() || null,
      branch: normalizedBranch,
      year_of_study: normalizedYear,
      skills: normalizedSkills,
      hide_photo: editForm.hide_photo,
      passout_year: editForm.passout_year || null,
    } as any).eq("user_id", user.id);

    if (!error) {
      // Keep the students row in sync so branch pages/search reflect edits immediately.
      const { data: mainBranches } = await supabase.from("main_branches" as any).select("id, name");
      const { data: specializations } = await supabase.from("specializations" as any).select("id, name, branch_id");

      let nextMainBranchId: string | null = null;
      let nextSpecializationId: string | null = null;

      if (normalizedBranch) {
        const matchedSpec = (specializations || []).find(
          (sp: any) => String(sp.name).toLowerCase() === normalizedBranch.toLowerCase()
        );
        if (matchedSpec) {
          nextMainBranchId = matchedSpec.branch_id;
          nextSpecializationId = matchedSpec.id;
        } else {
          const matchedMain = (mainBranches || []).find(
            (mb: any) => String(mb.name).toLowerCase() === normalizedBranch.toLowerCase()
          );
          if (matchedMain) nextMainBranchId = matchedMain.id;
        }
      }

      const cy = new Date().getFullYear();
      let gradYear: number | null = null;
      if ((profile as any)?.is_alumni && editForm.passout_year) {
        gradYear = editForm.passout_year;
      } else if (normalizedYear) {
        const match = normalizedYear.match(/(\d+)/);
        if (match) {
          const yr = parseInt(match[1], 10);
          if (!Number.isNaN(yr)) gradYear = cy + (4 - yr);
        }
      }

      await supabase.from("students").upsert({
        id: user.id,
        name: editForm.full_name.trim() || profile?.full_name || "Unknown",
        college_id: profile?.college_id,
        main_branch_id: nextMainBranchId,
        specialization_id: nextSpecializationId,
        branch_name: normalizedBranch,
        graduation_year: gradYear,
        bio: editForm.bio.trim() || null,
        skills: normalizedSkills,
        avatar_url: profile?.photo_url || null,
        status: (profile as any)?.is_alumni ? "alumni" : "active",
      } as any);
    }

    setSavingProfile(false);
    if (error) toast.error("Failed to update profile");
    else { toast.success("Profile updated!"); await refreshProfile(); setShowEditProfile(false); }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error("Passwords don't match"); return; }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
    setSavingPassword(false);
    if (error) toast.error(error.message);
    else { toast.success("Password changed!"); setShowChangePassword(false); setPasswordForm({ newPassword: "", confirmPassword: "" }); }
  };

  const stats = [
    { label: "Branch", value: branch, icon: BookOpen },
    { label: "Year", value: yearOfStudy || "—", icon: Calendar },
    { label: "Skills", value: String(skills.length), icon: Code2 },
    { label: "College", value: collegeName || "—", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      <HexPattern />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", damping: 25 }} className="relative">
            {/* Banner — taller so avatar sits inside it */}
            <div className="h-56 md:h-64 rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
              {[...Array(5)].map((_, i) => (
                <motion.div key={i} className="absolute h-2 w-2 rounded-full bg-primary/40"
                  style={{ left: `${15 + i * 18}%`, top: `${30 + (i % 3) * 20}%` }}
                  animate={{ y: [0, -15, 0], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }} />
              ))}
            </div>

            {/* Avatar + Info — overlaps the banner */}
            <div className="flex flex-col md:flex-row items-start gap-6 -mt-20 px-6 relative z-10">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-primary to-accent p-[3px] shadow-2xl shadow-primary/30">
                  <div className="h-full w-full rounded-[13px] bg-card flex items-center justify-center overflow-hidden">
                    {photoUrl ? (
                      <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-4xl font-display font-bold gradient-text">{initials}</span>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-green-500 border-4 border-card" />
              </motion.div>

              <div className="flex-1 pt-2 md:pt-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">{displayName}</h1>
                    <p className="text-muted-foreground mt-1">
                      {isAlumni ? `Alumni • ${company || branch}` : `${branch} • ${yearOfStudy || "Student"}`}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                      {collegeName && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {collegeName}</span>}
                      {joinDate && <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Joined {joinDate}</span>}
                      <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> {branch}</span>
                    </div>

                    {/* Social Links */}
                    {!editingSocials ? (
                      <div className="flex items-center gap-3 mt-3">
                        {profile?.github_url ? (
                          <motion.a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                            whileHover={{ scale: 1.15, y: -2 }}
                            className="h-9 w-9 rounded-xl bg-secondary/50 border border-border/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                            <Github className="h-4 w-4" />
                          </motion.a>
                        ) : null}
                        {profile?.linkedin_url ? (
                          <motion.a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                            whileHover={{ scale: 1.15, y: -2 }}
                            className="h-9 w-9 rounded-xl bg-secondary/50 border border-border/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                            <Linkedin className="h-4 w-4" />
                          </motion.a>
                        ) : null}
                        <motion.button onClick={() => setEditingSocials(true)}
                          whileHover={{ scale: 1.15, y: -2 }}
                          className="h-9 w-9 rounded-xl bg-secondary/50 border border-border/20 flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/30 transition-colors">
                          <Edit3 className="h-3.5 w-3.5" />
                        </motion.button>
                      </div>
                    ) : (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-2 max-w-sm">
                        <div className="flex items-center gap-2">
                          <Github className="h-4 w-4 text-muted-foreground shrink-0" />
                          <Input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/username" className="h-8 text-xs" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-muted-foreground shrink-0" />
                          <Input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" className="h-8 text-xs" />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveSocials} className="h-7 text-xs"><Save className="h-3 w-3 mr-1" /> Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingSocials(false)} className="h-7 text-xs">Cancel</Button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 w-full md:w-auto">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openEditProfile}
                      className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-xs sm:text-sm shadow-lg shadow-primary/30 flex items-center justify-center gap-1.5">
                      <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowChangePassword(true)}
                      className="flex-1 md:flex-none px-3 py-2 rounded-xl bg-secondary/60 border border-border/30 text-foreground font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:bg-secondary transition-colors">
                      <KeyRound className="h-3.5 w-3.5" /> Change Password
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mt-8">
            {stats.map((stat) => (
              <motion.div key={stat.label} whileHover={{ y: -3, scale: 1.02 }} className="glass rounded-xl p-3 sm:p-4 text-center group cursor-pointer overflow-hidden">
                <stat.icon className="h-5 w-5 text-primary mx-auto mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm sm:text-xl font-display font-bold text-foreground truncate px-1" title={stat.value}>{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-8 bg-secondary/30 rounded-xl p-1 w-fit border border-border/20">
            {(["overview", "projects"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeTab === tab ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "text-muted-foreground hover:text-foreground"
                }`}>{tab}</button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {activeTab === "overview" && (
              <>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glass rounded-2xl p-6">
                  <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-primary" /> Skills
                  </h3>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, i) => (
                        <motion.span key={skill} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                          className="px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-sm font-medium">{skill}</motion.span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No skills added yet. Update your profile to add skills.</p>
                  )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
                  <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-accent" /> About
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
                  {isAlumni && company && (
                    <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border/20">
                      <span className="text-xs text-muted-foreground">Company</span>
                      <p className="text-sm font-medium text-foreground">{company}</p>
                    </div>
                  )}
                </motion.div>
              </>
            )}

            {activeTab === "projects" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-primary" /> My Projects
                  </h3>
                  <Button size="sm" onClick={() => setShowAddProject(!showAddProject)} variant={showAddProject ? "ghost" : "default"} className="rounded-xl">
                    {showAddProject ? <><X className="h-4 w-4 mr-1" /> Cancel</> : <><Plus className="h-4 w-4 mr-1" /> Add Project</>}
                  </Button>
                </div>

                <AnimatePresence>
                  {showAddProject && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="glass rounded-2xl p-6 space-y-3 overflow-hidden">
                      <Input placeholder="Project title *" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} />
                      <textarea className="w-full px-3 py-2 rounded-xl bg-secondary/50 border border-border/40 text-sm resize-none h-20"
                        placeholder="Description" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} />
                      <Input placeholder="Tech stack (comma separated)" value={newProject.tech_stack} onChange={e => setNewProject({ ...newProject, tech_stack: e.target.value })} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input placeholder="GitHub link" value={newProject.github_link} onChange={e => setNewProject({ ...newProject, github_link: e.target.value })} />
                        <Input placeholder="Live demo link" value={newProject.live_link} onChange={e => setNewProject({ ...newProject, live_link: e.target.value })} />
                      </div>
                      <Button onClick={addProject} className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> Add Project</Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {loadingProjects ? (
                  <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>
                ) : projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((project, i) => (
                      <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="glass rounded-2xl p-5 group relative">
                        <button onClick={() => deleteProject(project.id)}
                          className="absolute top-3 right-3 h-7 w-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <h4 className="font-display font-bold text-foreground text-lg">{project.title}</h4>
                        {project.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>}
                        {project.tech_stack?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {project.tech_stack.map(t => (
                              <span key={t} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium border border-primary/20">{t}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-4">
                          {project.github_link && (
                            <a href={project.github_link} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                              <Github className="h-3.5 w-3.5" /> GitHub
                            </a>
                          )}
                          {project.live_link && (
                            <a href={project.live_link} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors">
                              <ExternalLink className="h-3.5 w-3.5" /> Live Demo
                            </a>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="glass rounded-2xl p-6 text-center">
                    <Code2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <h3 className="font-display font-bold text-foreground mb-2">No Projects Yet</h3>
                    <p className="text-sm text-muted-foreground">Click "Add Project" to showcase your work.</p>
                  </div>
                )}
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit3 className="h-5 w-5 text-primary" /> Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
              <Input value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} placeholder="Your name" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Bio</label>
              <textarea
                className="w-full px-3 py-2 rounded-xl bg-background border border-input text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Tell us about yourself"
                value={editForm.bio}
                onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Branch</label>
                <Input value={editForm.branch} onChange={e => setEditForm({ ...editForm, branch: e.target.value })} placeholder="e.g. CSE" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Year of Study</label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={editForm.year_of_study}
                  onChange={e => setEditForm({ ...editForm, year_of_study: e.target.value })}
                >
                  <option value="">Select</option>
                  {["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "N/A", "Alumni"].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            {(editForm.year_of_study === "Alumni" || profile?.is_alumni) && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Passout Year</label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={editForm.passout_year || ""}
                  onChange={e => setEditForm({ ...editForm, passout_year: e.target.value ? parseInt(e.target.value) : null })}
                >
                  <option value="">Select passout year</option>
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Skills (comma separated)</label>
              <Input value={editForm.skills} onChange={e => setEditForm({ ...editForm, skills: e.target.value })} placeholder="React, Python, ML..." />
            </div>
            {profile?.gender?.toLowerCase() === "female" && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/20">
                <div>
                  <p className="text-sm font-medium text-foreground">Show Profile Photo</p>
                  <p className="text-[11px] text-muted-foreground">Your photo will be visible to others on your profile</p>
                </div>
                <button
                  onClick={() => setEditForm({ ...editForm, hide_photo: !editForm.hide_photo })}
                  className={`relative h-6 w-11 rounded-full transition-colors ${!editForm.hide_photo ? "bg-primary" : "bg-secondary"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${!editForm.hide_photo ? "translate-x-5" : ""}`} />
                </button>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowEditProfile(false)}>Cancel</Button>
              <Button onClick={saveProfile} disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">New Password</label>
              <Input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Confirm Password</label>
              <Input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} placeholder="Re-enter password" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowChangePassword(false)}>Cancel</Button>
              <Button onClick={changePassword} disabled={savingPassword}>
                {savingPassword ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
