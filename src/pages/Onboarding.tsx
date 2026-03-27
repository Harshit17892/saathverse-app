import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Sparkles, Camera, X, Briefcase, ChevronDown, Shield, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { branchesData, getSubBranches, degreeLevels } from "@/data/branchesData";
import ImageCropper from "@/components/ImageCropper";

const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "N/A"];
const currentYear = new Date().getFullYear();
const passoutYears = Array.from({ length: 30 }, (_, i) => currentYear - i);

export default function Onboarding() {
  const { user, college, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && sessionStorage.getItem("profile_setup_complete") === "1") {
      navigate("/discover", { replace: true });
    }
  }, [user, navigate]);

  const [fullName, setFullName] = useState("");
  const [mainBranch, setMainBranch] = useState("");
  const [subBranch, setSubBranch] = useState("");
  const [degreeLevel, setDegreeLevel] = useState<"UG" | "PG" | "PhD" | "">("" );
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [isAlumni, setIsAlumni] = useState(false);
  const [company, setCompany] = useState("");
  const [companyType, setCompanyType] = useState<"tech" | "non-tech" | "">("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [hackathonInterest, setHackathonInterest] = useState(false);
  const [bio, setBio] = useState("");
  const [passoutYear, setPassoutYear] = useState<number | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  // Admin invite detection
  const [isAdminInvite, setIsAdminInvite] = useState(false);
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");

  // Password setup for invited users (magic link flow)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!user) return;
    
    // Check if this user was invited as admin via multiple signals
    const detectAdminInvite = async () => {
      // 1. Check user metadata
      if (user.user_metadata?.invited_as === "college_admin") {
        setIsAdminInvite(true);
        return;
      }
      
      // 2. Check user_roles table for college_admin role
      const { data: hasCollegeAdmin } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "college_admin" as any,
      });
      if (hasCollegeAdmin) {
        setIsAdminInvite(true);
        return;
      }
      
      // 3. Check pending_admin_invites (any status)
      if (user.email) {
        const { data } = await supabase
          .from("pending_admin_invites" as any)
          .select("*")
          .eq("email", user.email.toLowerCase())
          .in("status", ["pending", "accepted"])
          .maybeSingle();
        if (data) setIsAdminInvite(true);
      }
    };
    
    detectAdminInvite();
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1048576) { toast.error("Image must be under 1 MB"); return; }
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(URL.createObjectURL(file));
  };

  const handleCropComplete = (blob: Blob) => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(blob));
    setCropSrc(null);
  };

  // Revoke object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (cropSrc) URL.revokeObjectURL(cropSrc);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [cropSrc, photoPreview]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && skills.length < 8 && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!fullName.trim()) { toast.error("Please enter your name"); return; }

    // Password setup for invited admins
    if (isAdminInvite) {
      if (!newPassword || newPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("Passwords don't match");
        return;
      }
    }

    setSubmitting(true);

    // Set password for invited users
    if (isAdminInvite && newPassword) {
      const { error: pwErr } = await supabase.auth.updateUser({ password: newPassword });
      if (pwErr) {
        toast.error("Failed to set password: " + pwErr.message);
        setSubmitting(false);
        return;
      }
    }

    let photoUrl: string | null = null;
    if (photo) {
      const ext = photo.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, photo, { upsert: true });
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }
    }

    // Save mainBranch (not subBranch) to profiles.branch so it matches branches.name in DB
    // Also look up main_branch_id and specialization_id from new tables
    let mainBranchId: string | null = null;
    let specializationId: string | null = null;
    if (mainBranch && !isAdminInvite) {
      const { data: mbRow } = await supabase
        .from("main_branches" as any).select("id").eq("name", mainBranch).maybeSingle();
      if (mbRow) mainBranchId = (mbRow as any).id;
    }
    if (subBranch && mainBranchId) {
      const { data: spRow } = await supabase
        .from("specializations" as any).select("id").eq("name", subBranch).eq("branch_id", mainBranchId).maybeSingle();
      if (spRow) specializationId = (spRow as any).id;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        college_id: college?.id || null,
        full_name: fullName.trim(),
        branch: isAdminInvite ? (designation || "Admin") : (subBranch || mainBranch || null),
        main_branch_id: isAdminInvite ? null : mainBranchId,
        specialization_id: isAdminInvite ? null : specializationId,
        degree_level: isAdminInvite ? null : (degreeLevel || null),
        year_of_study: isAdminInvite ? null : (isAlumni ? "Alumni" : yearOfStudy || null),
        passout_year: isAdminInvite ? null : (isAlumni && passoutYear ? passoutYear : null),
        is_alumni: isAdminInvite ? false : isAlumni,
        company: isAdminInvite ? null : (company || null),
        company_type: isAdminInvite ? null : (companyType || null),
        hackathon_interest: isAdminInvite ? null : hackathonInterest,
        skills: isAdminInvite ? [] : skills,
        bio: isAdminInvite ? (designation || null) : (bio || null),
        photo_url: photoUrl,
      } as any, { onConflict: "user_id" });

    if (error) { toast.error(error.message); setSubmitting(false); return; }

    // Auto-sync: upsert the student record into the students table
    // so admin panel immediately sees branch/year data (no manual Sync needed)
    if (!isAdminInvite && college?.id) {
      try {
        // Convert year of study text to graduation year number
        const cy = new Date().getFullYear();
        let gradYear: number | null = null;
        if (isAlumni && passoutYear) {
          gradYear = passoutYear;
        } else if (yearOfStudy) {
          const match = yearOfStudy.match(/(\d+)/);
          if (match) {
            const yr = parseInt(match[1]);
            gradYear = cy + (4 - yr);
          }
        }

        await supabase.from("students").upsert({
          id: user.id,
          name: fullName.trim(),
          college_id: college.id,
          main_branch_id: mainBranchId,
          specialization_id: specializationId,
          branch_name: subBranch || mainBranch || null,
          email: user.email || null,
          graduation_year: gradYear,
          bio: bio || null,
          skills: skills,
          avatar_url: photoUrl,
          status: isAlumni ? "alumni" : "active",
        } as any);
      } catch (syncErr) {
        console.error("[Onboarding] Auto-sync to students failed:", syncErr);
      }
    }

    await refreshProfile();
    toast.success(isAdminInvite ? "Welcome, Admin! 🛡️" : "Profile set up! Welcome to SaathVerse 🎉");
    sessionStorage.setItem("profile_setup_complete", "1");
    localStorage.setItem("profile_setup_complete", "1");
    navigate(isAdminInvite ? "/admin" : "/discover");
    setSubmitting(false);
  };

  const inputClass = "h-12 bg-secondary/50 border-border/40 focus:border-accent rounded-xl text-sm transition-all";
  const selectClass = "h-12 bg-secondary/50 border border-border/40 rounded-xl w-full px-3 text-foreground text-sm focus:border-accent transition-all";

  return (
    <div className="mobile-auth-screen bg-background flex items-start sm:items-center justify-center relative overflow-x-hidden px-4 py-4 sm:py-6">
      <div className="absolute top-[-30%] left-[-15%] w-[600px] h-[600px] rounded-full bg-primary/8 blur-[150px]" />
      <div className="absolute bottom-[-30%] right-[-15%] w-[600px] h-[600px] rounded-full bg-accent/8 blur-[150px]" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg glass rounded-2xl p-8 border border-border/50 relative z-10 max-h-[calc(100svh-2rem)] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isAdminInvite ? "bg-primary" : "bg-accent"}`}>
            {isAdminInvite ? <Shield className="h-5 w-5 text-primary-foreground" /> : <GraduationCap className="h-5 w-5 text-accent-foreground" />}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {isAdminInvite ? "Admin Setup" : "Complete Your Profile"}
            </h1>
            {college && <p className="text-xs text-muted-foreground">{college.name}</p>}
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-8">
          {isAdminInvite
            ? "You've been invited as a College Admin. Set up your admin profile."
            : "Tell us about yourself to personalize your experience."}
        </p>

        <div className="space-y-5">
          {/* Photo */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <motion.div whileHover={{ scale: 1.05 }} onClick={() => fileRef.current?.click()}
                className="h-20 w-20 rounded-2xl bg-secondary/60 border-2 border-dashed border-border/60 hover:border-accent/60 flex items-center justify-center cursor-pointer overflow-hidden transition-colors">
                {photoPreview ? <img src={photoPreview} alt="" className="h-full w-full object-cover" /> : <Camera className="h-6 w-6 text-muted-foreground" />}
              </motion.div>
              {photo && (
                <button onClick={() => { setPhoto(null); setPhotoPreview(null); }} className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                  <X className="h-3 w-3" />
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Profile Photo</p>
              <p className="text-[11px] text-muted-foreground">Max 1 MB</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Full Name *</label>
            <Input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
          </div>

          {/* === ADMIN-SPECIFIC FIELDS === */}
          {isAdminInvite && (
            <>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Set Password *</label>
                <Input className={inputClass} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Confirm Password *</label>
                <Input className={inputClass} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Designation / Role</label>
                <Input className={inputClass} value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. HOD, Placement Cell, IT Admin" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Phone Number</label>
                <Input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" type="tel" />
              </div>
            </>
          )}

          {/* === STUDENT-SPECIFIC FIELDS === */}
          {!isAdminInvite && (
            <>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Bio</label>
                <textarea className={`${inputClass} h-20 w-full px-3 py-3 resize-none rounded-xl bg-secondary/50 border border-border/40 text-sm`}
                  value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short intro..." />
              </div>

              {/* Alumni toggle */}
              <motion.div onClick={() => setIsAlumni(!isAlumni)} whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${isAlumni ? "bg-accent/10 border-accent/40" : "bg-secondary/30 border-border/30"}`}>
                <Briefcase className={`h-5 w-5 ${isAlumni ? "text-accent" : "text-muted-foreground"}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">I'm an Alumni</p>
                </div>
                <motion.div animate={{ backgroundColor: isAlumni ? "hsl(var(--accent))" : "hsl(var(--muted))" }} className="h-6 w-11 rounded-full p-0.5">
                  <motion.div animate={{ x: isAlumni ? 20 : 0 }} className="h-5 w-5 rounded-full bg-background shadow-sm" />
                </motion.div>
              </motion.div>

              <AnimatePresence>
                {isAlumni && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Company</label>
                      <Input className={inputClass} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
                      <div className="flex gap-3">
                        {(["tech", "non-tech"] as const).map((t) => (
                          <motion.button key={t} whileTap={{ scale: 0.95 }} onClick={() => setCompanyType(t)}
                            className={`flex-1 h-10 rounded-xl border text-sm font-medium ${companyType === t ? "bg-accent/15 border-accent/40 text-accent" : "bg-secondary/30 border-border/30 text-muted-foreground"}`}>
                            {t === "tech" ? "🖥️ Tech" : "🏢 Non-Tech"}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    {/* Passout Year Picker */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Passout Year</label>
                      <div className="relative">
                        <select
                          className={`${selectClass}`}
                          value={passoutYear || ""}
                          onChange={(e) => setPassoutYear(e.target.value ? parseInt(e.target.value) : null)}
                        >
                          <option value="">Select passout year</option>
                          {passoutYears.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Branch */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Branch / Department</label>
                <div className="relative">
                  <select className={selectClass} value={mainBranch} onChange={(e) => { setMainBranch(e.target.value); setSubBranch(""); }}>
                    <option value="">Select branch</option>
                    {branchesData.map((b) => <option key={b.name} value={b.name}>{b.icon} {b.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <AnimatePresence>
                {mainBranch && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <label className="text-sm font-medium text-foreground mb-2 block">Specialization</label>
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                      {getSubBranches(mainBranch).map((sb) => (
                        <motion.button key={sb} whileTap={{ scale: 0.95 }} onClick={() => setSubBranch(sb === subBranch ? "" : sb)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${subBranch === sb ? "bg-accent/15 border-accent/40 text-accent" : "bg-secondary/30 border-border/30 text-muted-foreground hover:text-foreground"}`}>
                          {sb}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Degree Level */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Degree Level</label>
                <div className="flex gap-3">
                  {degreeLevels.map((d) => (
                    <motion.button key={d} whileTap={{ scale: 0.95 }} onClick={() => setDegreeLevel(d === degreeLevel ? "" : d)}
                      className={`flex-1 h-10 rounded-xl border text-xs font-medium transition-all ${degreeLevel === d ? "bg-accent/15 border-accent/40 text-accent" : "bg-secondary/30 border-border/30 text-muted-foreground"}`}>
                      {d === "UG" ? "🎓 UG" : d === "PG" ? "📚 PG" : "🔬 PhD"}
                    </motion.button>
                  ))}
                </div>
              </div>

              {!isAlumni && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Year of Study</label>
                  <div className="flex flex-wrap gap-2">
                    {years.map((y) => (
                      <motion.button key={y} whileTap={{ scale: 0.95 }} onClick={() => setYearOfStudy(y === yearOfStudy ? "" : y)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium border ${yearOfStudy === y ? "bg-primary/15 border-primary/40 text-primary" : "bg-secondary/30 border-border/30 text-muted-foreground"}`}>
                        {y}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Skills (up to 8)</label>
                <div className="flex gap-2">
                  <Input className={inputClass + " flex-1"} value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g. React, Python" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
                  <Button type="button" variant="outline" onClick={addSkill} className="h-12 rounded-xl">Add</Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map((s) => (
                      <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => setSkills(skills.filter((sk) => sk !== s))}>
                        {s} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Hackathon Interest Toggle */}
              <motion.div onClick={() => setHackathonInterest(!hackathonInterest)} whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${hackathonInterest ? "bg-accent/10 border-accent/40" : "bg-secondary/30 border-border/30 hover:border-border/60"}`}>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${hackathonInterest ? "bg-accent/20" : "bg-secondary/60"}`}>
                  <Trophy className={`h-5 w-5 ${hackathonInterest ? "text-accent" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Interested in Hackathons</p>
                </div>
                <motion.div animate={{ backgroundColor: hackathonInterest ? "hsl(var(--accent))" : "hsl(var(--muted))" }} className="h-6 w-11 rounded-full p-0.5">
                  <motion.div animate={{ x: hackathonInterest ? 20 : 0 }} className="h-5 w-5 rounded-full bg-background shadow-sm" />
                </motion.div>
              </motion.div>
            </>
          )}

          <Button onClick={handleSubmit} disabled={submitting}
            className={`w-full h-12 text-base font-bold rounded-full ${isAdminInvite ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-accent hover:bg-accent/90 text-accent-foreground glow-accent"}`}>
            <Sparkles className="h-4 w-4 mr-2" />
            {submitting ? "Setting up..." : isAdminInvite ? "Start Managing" : "Complete Setup"}
          </Button>
        </div>
      </motion.div>

      {/* Image Cropper Modal */}
      {cropSrc && (
        <ImageCropper
          imageSrc={cropSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropSrc(null)}
          aspectRatio={1}
        />
      )}
    </div>
  );
}=
