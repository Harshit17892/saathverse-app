import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, Eye, EyeOff, User, BookOpen,
  Users, ArrowRight, ArrowLeft, X, Briefcase, Camera,
  Sparkles, CheckCircle2, ChevronDown, Zap, Globe, Cpu, Layers, Trophy, EyeOff as EyeOffIcon, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { branchesData, getSubBranches, degreeLevels } from "@/data/branchesData";
import ImageCropper from "@/components/ImageCropper";

const STEPS = ["Account", "Profile", "Branch", "Degree", "Finalize"];

/* ── Conic spinning ring ── */
const SpinningGradientRing = ({ size, duration, direction = 1 }: { size: number; duration: number; direction?: number }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size, height: size,
      top: "50%", left: "50%",
      marginTop: -size / 2, marginLeft: -size / 2,
      background: `conic-gradient(from 0deg, hsl(var(--accent)), hsl(var(--primary)), transparent 60%, hsl(var(--accent)))`,
      padding: 2,
    }}
    animate={{ rotate: direction * 360 }}
    transition={{ duration, repeat: Infinity, ease: "linear" }}
  >
    <div className="w-full h-full rounded-full bg-background" />
  </motion.div>
);

/* ── Dashed orbital ring ── */
const DashedOrbit = ({ size, duration, direction = 1, opacity = 0.15 }: { size: number; duration: number; direction?: number; opacity?: number }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size, height: size, top: "50%", left: "50%",
      marginTop: -size / 2, marginLeft: -size / 2,
      border: `1px dashed hsl(var(--accent)/${opacity})`,
    }}
    animate={{ rotate: direction * 360 }}
    transition={{ duration, repeat: Infinity, ease: "linear" }}
  />
);

/* ── Orbiting icon ── */
const OrbitingIcon = ({ icon, orbitSize, angle, duration, delay }: {
  icon: React.ReactNode; orbitSize: number; angle: number; duration: number; delay: number;
}) => {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * (orbitSize / 2);
  const y = Math.sin(rad) * (orbitSize / 2);
  return (
    <motion.div
      className="absolute"
      style={{ top: `calc(50% + ${y}px - 20px)`, left: `calc(50% + ${x}px - 20px)` }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 3, repeat: Infinity, delay }}
    >
      <div className="h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/40 flex items-center justify-center shadow-lg shadow-accent/10">
        {icon}
      </div>
    </motion.div>
  );
};

/* ── Custom branch dropdown to avoid native select ugly upward opening ── */
const BranchDropdown = ({ value, onChange, branches }: {
  value: string;
  onChange: (v: string) => void;
  branches: typeof branchesData;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-12 bg-secondary/50 border border-border/40 rounded-xl w-full px-3 text-left text-sm focus:border-accent transition-all duration-300 focus:shadow-[0_0_20px_hsl(var(--accent)/0.15)] flex items-center justify-between"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || "Select branch"}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-[calc(100%+4px)] left-0 w-full max-h-60 overflow-y-auto rounded-xl bg-card border border-border/60 shadow-xl shadow-background/50 backdrop-blur-xl"
          >
            {branches.map((b) => (
              <button
                key={b.name}
                type="button"
                onClick={() => { onChange(b.name); setOpen(false); }}
                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-2 hover:bg-accent/10 transition-colors ${value === b.name ? "bg-accent/15 text-accent font-medium" : "text-foreground"}`}
              >
                <span>{b.icon}</span>
                <span>{b.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Click outside to close */}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
};

const Signup = () => {
  const [step, setStep] = useState(0);
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === "/login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [stepChecking, setStepChecking] = useState(false);
  const [forceMobileLayout, setForceMobileLayout] = useState(false);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [isAlumni, setIsAlumni] = useState(false);
  const [company, setCompany] = useState("");
  const [companyType, setCompanyType] = useState<"tech" | "non-tech" | "">("");
  const [mainBranch, setMainBranch] = useState("");
  const [subBranch, setSubBranch] = useState("");
  const [degreeLevel, setDegreeLevel] = useState<"UG" | "PG" | "PhD" | "">("" );
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [hackathonInterest, setHackathonInterest] = useState(false);
  const [hidePhoto, setHidePhoto] = useState(false);

  // Cropper
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  // Form settings loaded from admin config
  const [formSettings, setFormSettings] = useState<any>(null);

  // Load form settings when user enters email and moves forward
  useEffect(() => {
    const loadFormSettings = async () => {
      if (!email || !email.includes("@")) return;
      const domain = email.split("@")[1];
      const { data: college } = await supabase
        .from("colleges").select("id").eq("domain", domain).maybeSingle();
      if (!college) return;
      const { data: settings } = await supabase
        .from("form_settings").select("*")
        .eq("college_id", college.id)
        .eq("setting_key", "signup_form")
        .maybeSingle();
      if (settings?.setting_value) {
        setFormSettings(settings.setting_value);
      }
    };
    if (step >= 1) loadFormSettings();
  }, [step, email]);

  // Sync UI mode with current route
  useEffect(() => {
    const nextIsLogin = location.pathname === "/login";
    setIsLogin(nextIsLogin);
    setStep(0);
  }, [location.pathname]);

  // In mobile browsers with "Desktop site" enabled, width breakpoints can switch to desktop UI.
  // Force the mobile auth layout for touch devices to keep form sizing and positioning stable.
  useEffect(() => {
    const updateLayoutMode = () => {
      const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(hover: none)").matches;
      setForceMobileLayout(isTouchDevice);
    };

    updateLayoutMode();
    window.addEventListener("resize", updateLayoutMode);
    return () => window.removeEventListener("resize", updateLayoutMode);
  }, []);

  // Filter branches based on admin-enabled settings
  const filteredBranches = useMemo(() => {
    if (!formSettings?.enabled_branches) return branchesData;
    return branchesData.filter(b => formSettings.enabled_branches.includes(b.name));
  }, [formSettings]);

  const getFilteredSubBranches = (mainBranch: string): string[] => {
    const branch = branchesData.find(b => b.name === mainBranch);
    if (!branch) return [];
    const allSubs = branch.subBranches.map(sb => sb.name);
    if (!formSettings?.enabled_sub_branches?.[mainBranch]) return allSubs;
    return allSubs.filter(sb => formSettings.enabled_sub_branches[mainBranch].includes(sb));
  };

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "N/A"];
  const [passoutYear, setPassoutYear] = useState<number | null>(null);
  const currentYear = new Date().getFullYear();
  const passoutYears = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1048576) { toast.error("Image must be under 1 MB"); return; }
    setCropSrc(URL.createObjectURL(file));
  };

  const handleCropComplete = (blob: Blob) => {
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(blob));
    setCropSrc(null);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && skills.length < 8 && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const nextStep = async () => {
    if (step === 0) {
      if (!email || !password) return toast.error("Please fill email and password");
      if (password.length < 6) return toast.error("Password must be at least 6 characters");
      if (!isLogin && password !== confirmPassword) return toast.error("Passwords don't match");

      // Validate domain before allowing signup users to move forward
      if (!isLogin) {
        try {
          setStepChecking(true);
          const domain = email.split("@")[1];
          const { data: college } = await supabase
            .from("colleges")
            .select("id")
            .eq("domain", domain)
            .maybeSingle();

          if (!college) {
            toast.error(`${domain} is not registered on SaathVerse yet.`);
            return;
          }
        } finally {
          setStepChecking(false);
        }
      }
    }
    if (step === 1) {
      if (!fullName.trim()) return toast.error("Full Name is required");
      if (!gender) return toast.error("Please select your gender");
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleSubmit = async () => {
    if (isLogin) {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success("Welcome back!");
      navigate("/");
      setLoading(false);
      return;
    }

    if (!fullName.trim()) { toast.error("Full Name is required"); return; }

    setLoading(true);
    const domain = email.split("@")[1];
    const { data: college } = await supabase
      .from("colleges").select("id, name").eq("domain", domain).maybeSingle();

    if (!college) {
      toast.error(`Your college (${domain}) is not registered on SaathVerse yet.`);
      setLoading(false);
      return;
    }

    const { data: signupData, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { college_id: college.id, full_name: fullName } },
    });

    if (error) { toast.error(error.message); setLoading(false); return; }
    const userId = signupData.user?.id;
    if (!userId) { toast.error("Signup failed"); setLoading(false); return; }

    let photoUrl: string | null = null;
    if (photo) {
      const ext = photo.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("avatars").upload(path, photo, { upsert: true });
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }
    }

    // Look up main_branch_id from main_branches table
    let mainBranchId: string | null = null;
    let specializationId: string | null = null;
    if (mainBranch) {
      const { data: mbRow } = await supabase
        .from("main_branches" as any).select("id").eq("name", mainBranch).maybeSingle();
      if (mbRow) mainBranchId = (mbRow as any).id;
    }
    // Look up specialization_id from specializations table
    if (subBranch && mainBranchId) {
      const { data: spRow } = await supabase
        .from("specializations" as any).select("id").eq("name", subBranch).eq("branch_id", mainBranchId).maybeSingle();
      if (spRow) specializationId = (spRow as any).id;
    }

    await supabase.from("profiles").update({
      full_name: fullName.trim(),
      college_id: college.id,
      branch: subBranch || mainBranch || null,
      main_branch_id: mainBranchId,
      specialization_id: specializationId,
      degree_level: degreeLevel || null,
      year_of_study: isAlumni ? "Alumni" : yearOfStudy || null,
      passout_year: isAlumni && passoutYear ? passoutYear : null,
      is_alumni: isAlumni,
      company: company || null,
      company_type: companyType || null,
      skills,
      bio: bio || null,
      photo_url: photoUrl,
      hackathon_interest: hackathonInterest,
      gender: gender || null,
      hide_photo: gender === "female" ? hidePhoto : false,
    } as any).eq("user_id", userId);

    toast.success(`Welcome to SaathVerse! You're joining ${college.name}`);
    navigate("/");
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Enter your email first to reset your password");
      return;
    }

    setResettingPassword(true);
    const appUrl =
      import.meta.env.VITE_APP_URL ||
      import.meta.env.VITE_SITE_URL ||
      "https://saathverse.com";

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${appUrl.replace(/\/$/, "")}/profile`,
    });

    if (error) {
      toast.error(error.message);
      setResettingPassword(false);
      return;
    }

    toast.success("Password reset link sent. Check your inbox.");
    setResettingPassword(false);
  };

  const inputClass = "h-12 bg-secondary/50 border-border/40 focus:border-accent rounded-xl text-sm transition-all duration-300 focus:shadow-[0_0_20px_hsl(var(--accent)/0.15)]";

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className="mobile-auth-screen bg-background flex relative overflow-x-hidden">
      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      {/* Deep radial glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/[0.06] blur-[200px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[200px]" />

      {/* Mobile/Tablet orbital background */}
      <div className={`${forceMobileLayout ? "" : "lg:hidden "}absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.18]`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent/[0.08] blur-[100px]" />
        <DashedOrbit size={320} duration={60} direction={1} opacity={0.15} />
        <DashedOrbit size={240} duration={45} direction={-1} opacity={0.2} />
        <DashedOrbit size={160} duration={30} direction={1} opacity={0.12} />
        <SpinningGradientRing size={140} duration={6} />
        <div className="relative z-10 h-[110px] w-[110px] rounded-full bg-background border border-border/20 flex items-center justify-center">
          <span className="font-display text-3xl font-bold gradient-text">S</span>
        </div>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute" style={{ width: 320, height: 320 }}>
          <OrbitingIcon icon={<Cpu className="h-3 w-3 text-accent" />} orbitSize={320} angle={45} duration={3} delay={0} />
          <OrbitingIcon icon={<Globe className="h-3 w-3 text-primary" />} orbitSize={320} angle={135} duration={3} delay={1} />
          <OrbitingIcon icon={<Layers className="h-3 w-3 text-accent" />} orbitSize={320} angle={225} duration={3} delay={2} />
          <OrbitingIcon icon={<Zap className="h-3 w-3 text-primary" />} orbitSize={320} angle={315} duration={3} delay={3} />
        </motion.div>
      </div>

      {/* ──────── Left Panel - Form ──────── */}
      <div className={`w-full ${forceMobileLayout ? "" : "lg:w-[55%]"} flex flex-col justify-center px-6 md:px-12 lg:px-16 py-8 relative z-10`}>
        {/* Header */}
        <div className="flex items-center mb-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div whileHover={{ rotate: 12, scale: 1.05 }}
              className="h-10 w-10 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))" }}
            >
              <Zap className="h-5 w-5 text-accent-foreground" />
            </motion.div>
            <span className="font-display text-xl font-bold text-foreground group-hover:text-accent transition-colors">SaathVerse</span>
          </Link>
        </div>

        {/* Step indicator */}
        {!isLogin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <motion.div key={s} animate={{ y: step === i ? -2 : 0 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  step === i ? "bg-accent/15 text-accent border border-accent/30"
                    : step > i ? "bg-muted/30 text-muted-foreground/70"
                    : "text-muted-foreground/40"
                }`}>
                {step > i ? <CheckCircle2 className="h-3 w-3 text-accent" /> : (
                  <span className={`h-2 w-2 rounded-full ${step === i ? "bg-accent" : "bg-muted-foreground/30"}`} />
                )}
                {s}
              </motion.div>
            ))}
          </motion.div>
        )}

        <AnimatePresence mode="wait" custom={1}>
          {/* LOGIN */}
          {isLogin && (
            <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Welcome back ✨</h1>
              <p className="text-muted-foreground mb-8">Sign in to continue with your campus community.</p>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Email</label>
                  <Input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Password</label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} className={inputClass + " pr-12"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={resettingPassword}
                      className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors disabled:opacity-60"
                    >
                      {resettingPassword ? "Sending reset link..." : "Forgot password?"}
                    </button>
                  </div>
                </div>
                <Button onClick={handleSubmit} disabled={loading}
                  className="w-full h-12 text-base font-bold rounded-full glow-accent mt-2"
                  style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))", color: "hsl(var(--accent-foreground))" }}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 0: Account */}
          {!isLogin && step === 0 && (
            <motion.div key="step0" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Create account</h1>
              <p className="text-muted-foreground mb-8">Use your college email to auto-detect your institution.</p>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">College Email *</label>
                  <Input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourcollege.edu" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Password *</label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} className={inputClass + " pr-12"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Confirm Password *</label>
                  <Input type={showPassword ? "text" : "password"} className={inputClass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
                </div>
                <Button onClick={nextStep}
                  disabled={stepChecking}
                  className="w-full h-12 text-base font-bold rounded-full glow-accent gap-2 mt-2"
                  style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))", color: "hsl(var(--accent-foreground))" }}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 1: Profile */}
          {!isLogin && step === 1 && (
            <motion.div key="step1" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Your profile</h1>
              <p className="text-muted-foreground mb-8">Tell us about yourself.</p>
              <div className="space-y-5 max-w-md">
                {/* Photo with cropper */}
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <motion.div whileHover={{ scale: 1.05 }} onClick={() => fileRef.current?.click()}
                      className="h-20 w-20 rounded-2xl bg-secondary/60 border-2 border-dashed border-border/60 hover:border-accent/60 flex items-center justify-center cursor-pointer overflow-hidden transition-colors">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <Camera className="h-6 w-6 text-muted-foreground" />
                      )}
                    </motion.div>
                    {photo && (
                      <button onClick={removePhoto} className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Profile Photo</p>
                    <p className="text-[11px] text-muted-foreground">Max 1 MB · JPG, PNG, WebP</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Full Name *</label>
                  <Input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
                </div>

                {/* Gender */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Gender *</label>
                  <div className="flex gap-3">
                    {(["male", "female"] as const).map((g) => (
                      <motion.button key={g} whileTap={{ scale: 0.95 }} onClick={() => { setGender(g); if (g === "male") setHidePhoto(false); }}
                        className={`flex-1 h-12 rounded-xl border text-sm font-medium transition-all ${gender === g ? "bg-accent/15 border-accent/40 text-accent" : "bg-secondary/30 border-border/30 text-muted-foreground hover:border-border/60"}`}>
                        {g === "male" ? "👨 Male" : "👩 Female"}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Bio</label>
                  <textarea className="h-20 w-full px-3 py-3 resize-none rounded-xl bg-secondary/50 border border-border/40 focus:border-accent text-sm transition-all duration-300"
                    value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short intro about yourself..." />
                </div>

                {/* Alumni Toggle */}
                <motion.div onClick={() => setIsAlumni(!isAlumni)} whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${isAlumni ? "bg-accent/10 border-accent/40" : "bg-secondary/30 border-border/30 hover:border-border/60"}`}>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isAlumni ? "bg-accent/20" : "bg-secondary/60"}`}>
                    <Briefcase className={`h-5 w-5 ${isAlumni ? "text-accent" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">I'm an Alumni</p>
                    <p className="text-[11px] text-muted-foreground">Already graduated? Tell us about your career.</p>
                  </div>
                  <motion.div animate={{ backgroundColor: isAlumni ? "hsl(var(--accent))" : "hsl(var(--muted))" }} className="h-6 w-11 rounded-full p-0.5 relative">
                    <motion.div animate={{ x: isAlumni ? 20 : 0 }} className="h-5 w-5 rounded-full bg-background shadow-sm" />
                  </motion.div>
                </motion.div>

                <AnimatePresence>
                  {isAlumni && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Company Name</label>
                        <Input className={inputClass} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google, TCS" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Company Type</label>
                        <div className="flex gap-3">
                          {(["tech", "non-tech"] as const).map((t) => (
                            <motion.button key={t} whileTap={{ scale: 0.95 }} onClick={() => setCompanyType(t)}
                              className={`flex-1 h-12 rounded-xl border text-sm font-medium transition-all ${companyType === t ? "bg-accent/15 border-accent/40 text-accent" : "bg-secondary/30 border-border/30 text-muted-foreground hover:border-border/60"}`}>
                              {t === "tech" ? "🖥️ Tech" : "🏢 Non-Tech"}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      {/* Passout Year Picker for Alumni */}
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Passout Year</label>
                        <div className="relative">
                          <select
                            className="h-12 bg-secondary/50 border border-border/40 rounded-xl w-full px-3 text-foreground text-sm focus:border-accent transition-all duration-300"
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

                <div className="flex gap-3 mt-2">
                  <Button onClick={() => setStep(0)} variant="outline" className="h-12 rounded-full flex-1 gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={nextStep}
                    className="h-12 rounded-full flex-1 glow-accent gap-2"
                    style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))", color: "hsl(var(--accent-foreground))" }}
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Branch */}
          {!isLogin && step === 2 && (
            <motion.div key="step2" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Academics</h1>
              <p className="text-muted-foreground mb-8">Select your branch & specialization.</p>
              <div className="space-y-5 max-w-md">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Main Branch</label>
                  <BranchDropdown value={mainBranch} onChange={(v) => { setMainBranch(v); setSubBranch(""); }} branches={filteredBranches} />
                </div>

                <AnimatePresence>
                  {mainBranch && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Specialization</label>
                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                        {getFilteredSubBranches(mainBranch).map((sb) => (
                          <motion.button key={sb} whileTap={{ scale: 0.95 }}
                            onClick={() => setSubBranch(sb === subBranch ? "" : sb)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${subBranch === sb ? "bg-accent/15 border-accent/40 text-accent shadow-[0_0_12px_hsl(var(--accent)/0.2)]" : "bg-secondary/30 border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60"}`}>
                            {sb}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 mt-2">
                  <Button onClick={() => setStep(1)} variant="outline" className="h-12 rounded-full flex-1 gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={nextStep}
                    className="h-12 rounded-full flex-1 glow-accent gap-2"
                    style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))", color: "hsl(var(--accent-foreground))" }}
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Degree Level & Year */}
          {!isLogin && step === 3 && (
            <motion.div key="step3" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Degree & Year</h1>
              <p className="text-muted-foreground mb-8">Select your degree level and current year.</p>
              <div className="space-y-5 max-w-md">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Degree Level</label>
                  <div className="flex gap-3">
                    {degreeLevels.map((d) => (
                      <motion.button key={d} whileTap={{ scale: 0.95 }}
                        onClick={() => setDegreeLevel(d === degreeLevel ? "" : d)}
                        className={`flex-1 h-12 rounded-xl border text-sm font-medium transition-all ${degreeLevel === d ? "bg-accent/15 border-accent/40 text-accent" : "bg-secondary/30 border-border/30 text-muted-foreground hover:border-border/60"}`}>
                        {d === "UG" ? "🎓 UG" : d === "PG" ? "📚 PG" : "🔬 PhD"}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {!isAlumni && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Year of Study</label>
                    <div className="flex flex-wrap gap-2">
                      {years.map((y) => (
                        <motion.button key={y} whileTap={{ scale: 0.95 }}
                          onClick={() => setYearOfStudy(y === yearOfStudy ? "" : y)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition-all ${yearOfStudy === y ? "bg-primary/15 border-primary/40 text-primary" : "bg-secondary/30 border-border/30 text-muted-foreground hover:border-border/60"}`}>
                          {y}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-2">
                  <Button onClick={() => setStep(2)} variant="outline" className="h-12 rounded-full flex-1 gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={nextStep}
                    className="h-12 rounded-full flex-1 glow-accent gap-2"
                    style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))", color: "hsl(var(--accent-foreground))" }}
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Finalize */}
          {!isLogin && step === 4 && (
            <motion.div key="step3" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Almost there!</h1>
              <p className="text-muted-foreground mb-8">Add your skills and launch into SaathVerse.</p>
              <div className="space-y-5 max-w-md">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Skills (up to 8)</label>
                  <div className="flex gap-2">
                    <Input className={inputClass + " flex-1"} value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="e.g. React, Python, Figma" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
                    <Button type="button" variant="outline" onClick={addSkill} className="h-12 rounded-xl px-5">Add</Button>
                  </div>
                  {skills.length > 0 && (
                    <motion.div layout className="flex flex-wrap gap-2 mt-3">
                      {skills.map((s) => (
                        <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Badge variant="secondary" className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors px-3 py-1" onClick={() => setSkills(skills.filter((sk) => sk !== s))}>
                            {s} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        </motion.div>
                      ))}
                    </motion.div>
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
                    <p className="text-[11px] text-muted-foreground">Show this on your profile for team-ups.</p>
                  </div>
                  <motion.div animate={{ backgroundColor: hackathonInterest ? "hsl(var(--accent))" : "hsl(var(--muted))" }} className="h-6 w-11 rounded-full p-0.5 relative">
                    <motion.div animate={{ x: hackathonInterest ? 20 : 0 }} className="h-5 w-5 rounded-full bg-background shadow-sm" />
                  </motion.div>
                </motion.div>

                {/* Hide Photo (females only) */}
                {gender === "female" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                    <motion.div onClick={() => setHidePhoto(!hidePhoto)} whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${hidePhoto ? "bg-primary/10 border-primary/40" : "bg-secondary/30 border-border/30 hover:border-border/60"}`}>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${hidePhoto ? "bg-primary/20" : "bg-secondary/60"}`}>
                        <Shield className={`h-5 w-5 ${hidePhoto ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">Hide Profile Photo</p>
                        <p className="text-[11px] text-muted-foreground">Your photo won't be visible to others. You can change this later from your profile.</p>
                      </div>
                      <motion.div animate={{ backgroundColor: hidePhoto ? "hsl(var(--primary))" : "hsl(var(--muted))" }} className="h-6 w-11 rounded-full p-0.5 relative">
                        <motion.div animate={{ x: hidePhoto ? 20 : 0 }} className="h-5 w-5 rounded-full bg-background shadow-sm" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Summary Card */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="p-4 rounded-2xl bg-secondary/30 border border-border/30 space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Profile Summary</p>
                  <div className="flex items-center gap-3">
                    {photoPreview ? (
                      <img src={photoPreview} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-accent/15 flex items-center justify-center text-accent font-bold">{fullName?.[0] || "?"}</div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">{fullName || "—"}</p>
                      <p className="text-[11px] text-muted-foreground">{email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {mainBranch && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{mainBranch}</span>}
                    {subBranch && <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">{subBranch}</span>}
                    {degreeLevel && <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">{degreeLevel}</span>}
                    {isAlumni && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Alumni</span>}
                    {yearOfStudy && !isAlumni && <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">{yearOfStudy}</span>}
                    {hackathonInterest && <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">🏆 Hackathon Ready</span>}
                  </div>
                </motion.div>

                <div className="flex gap-3 mt-2">
                  <Button onClick={() => setStep(3)} variant="outline" className="h-12 rounded-full flex-1 gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading}
                    className="h-12 rounded-full flex-1 glow-accent gap-2 text-base font-bold"
                    style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))", color: "hsl(var(--accent-foreground))" }}
                  >
                    <Sparkles className="h-4 w-4" />
                    {loading ? "Creating..." : "Launch Profile"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* "Already a member" */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-10 text-sm text-muted-foreground text-center sm:text-left">
          {isLogin ? "New here? " : "Already a member? "}
          <button onClick={() => { setIsLogin(!isLogin); setStep(0); }} className="text-accent font-semibold hover:underline">
            {isLogin ? "Create account" : "Sign in"}
          </button>
        </motion.p>
      </div>

      {/* ──────── Right Panel - Web3 Orbital Visual ──────── */}
      {!forceMobileLayout && (
      <div className="hidden lg:flex w-[45%] items-center justify-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/[0.06] blur-[150px]" />
        <DashedOrbit size={450} duration={60} direction={1} opacity={0.12} />
        <DashedOrbit size={340} duration={45} direction={-1} opacity={0.18} />
        <DashedOrbit size={230} duration={30} direction={1} opacity={0.1} />
        <SpinningGradientRing size={200} duration={6} />
        <div className="relative z-10 flex items-center justify-center">
          <div className="h-[160px] w-[160px] rounded-full bg-background border border-border/20 flex items-center justify-center">
            <motion.span className="font-display text-5xl font-bold gradient-text"
              animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity }}>S</motion.span>
          </div>
          <div className="absolute inset-[-4px] rounded-full bg-accent/10 blur-xl -z-10" />
        </div>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute" style={{ width: 450, height: 450 }}>
          <OrbitingIcon icon={<Cpu className="h-4 w-4 text-accent" />} orbitSize={450} angle={30} duration={3} delay={0} />
          <OrbitingIcon icon={<Globe className="h-4 w-4 text-primary" />} orbitSize={450} angle={120} duration={3} delay={0.8} />
          <OrbitingIcon icon={<Layers className="h-4 w-4 text-accent" />} orbitSize={450} angle={210} duration={3} delay={1.6} />
          <OrbitingIcon icon={<Zap className="h-4 w-4 text-primary" />} orbitSize={450} angle={300} duration={3} delay={2.4} />
        </motion.div>
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute" style={{ width: 340, height: 340 }}>
          <OrbitingIcon icon={<Users className="h-4 w-4 text-accent" />} orbitSize={340} angle={60} duration={4} delay={0.5} />
          <OrbitingIcon icon={<BookOpen className="h-4 w-4 text-primary" />} orbitSize={340} angle={240} duration={4} delay={1.5} />
        </motion.div>
        {[...Array(8)].map((_, i) => (
          <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-accent/40"
            style={{ top: `${10 + Math.random() * 80}%`, left: `${10 + Math.random() * 80}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.15, 0.6, 0.15] }}
            transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }} />
        ))}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
          {STEPS.map((s, i) => (
            <motion.div key={s}
              animate={{ y: step === i ? -6 : 0, opacity: step === i ? 1 : 0.35 }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium backdrop-blur-sm transition-all duration-300 ${
                step === i ? "bg-card/80 border border-accent/30 text-foreground" : "text-muted-foreground"
              }`}>
              {step > i ? <CheckCircle2 className="h-3 w-3 text-accent" /> : (
                <span className={`h-2.5 w-2.5 rounded-full ${step === i ? "bg-accent" : "bg-muted-foreground/30"}`} />
              )}
              {s}
            </motion.div>
          ))}
        </div>
      </div>
      )}

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
};

export default Signup;
