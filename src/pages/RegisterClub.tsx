import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SocialLinks = {
  instagram?: string;
  linkedin?: string;
  website?: string;
  other?: string;
};

const RegisterClub = () => {
  const { user, collegeId } = useAuth();
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Public details
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [focusTags, setFocusTags] = useState("");

  // Internal justification
  const [objective, setObjective] = useState("");
  const [proposedActivities, setProposedActivities] = useState("");
  const [facultyAdvisor, setFacultyAdvisor] = useState("");

  // Branding/social
  const [logoLetter, setLogoLetter] = useState("");
  const [bannerGradient, setBannerGradient] = useState("from-blue-600/40 to-primary/30");
  const [social, setSocial] = useState<SocialLinks>({});

  const canSubmit = useMemo(() => {
    return !!user && !!collegeId && name.trim().length > 1 && category.trim().length > 1;
  }, [user, collegeId, name, category]);

  const handleSubmit = async () => {
    if (!user || !collegeId) {
      toast({ title: "Not ready", description: "Please log in and complete your profile first.", variant: "destructive" });
      return;
    }
    if (!canSubmit) {
      toast({ title: "Missing fields", description: "Please fill in club name and category.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("club_proposals")
        .insert({
          user_id: user.id,
          college_id: collegeId,
          name: name.trim(),
          category: category.trim(),
          tagline: tagline.trim() || null,
          description: description.trim() || null,
          objective: objective.trim() || null,
          proposed_activities: proposedActivities.trim() || null,
          faculty_advisor: facultyAdvisor.trim() || null,
          logo_letter: logoLetter.trim() || null,
          banner_gradient: bannerGradient,
          social_links: social,
          focus_tags: focusTags
            ? focusTags.split(",").map(t => t.trim()).filter(Boolean)
            : [],
          status: "pending",
        })
        .select("id")
        .single();

      if (error) throw error;

      setSuccessId(data?.id || null);
      toast({ title: "Submitted!", description: "Your club proposal is pending review." });
    } catch (e: any) {
      toast({ title: "Submission failed", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16 container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Register a New Club</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Submit a proposal for your college. Core team will review it.
          </p>

          {successId ? (
            <div className="mt-8 glass rounded-2xl p-6 border border-border/30">
              <p className="text-foreground font-medium">Proposal submitted successfully.</p>
              <p className="text-xs text-muted-foreground mt-1">Proposal ID: {successId}</p>
              <div className="mt-5">
                <Button variant="outline" onClick={() => setSuccessId(null)}>Submit another</Button>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {/* Public details */}
              <section className="glass rounded-2xl p-6 border border-border/30 space-y-4">
                <h2 className="font-display text-lg font-bold text-foreground">Public details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Club name *</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Category *</label>
                    <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Technical, Cultural, Sports..." />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Tagline</label>
                  <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                  <Textarea className="min-h-[110px]" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Focus tags (comma separated)</label>
                  <Input value={focusTags} onChange={(e) => setFocusTags(e.target.value)} placeholder="AI, Web, Robotics..." />
                </div>
              </section>

              {/* Internal justification */}
              <section className="glass rounded-2xl p-6 border border-border/30 space-y-4">
                <h2 className="font-display text-lg font-bold text-foreground">Internal justification</h2>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Objective</label>
                  <Textarea className="min-h-[90px]" value={objective} onChange={(e) => setObjective(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Proposed activities</label>
                  <Textarea className="min-h-[90px]" value={proposedActivities} onChange={(e) => setProposedActivities(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Faculty advisor</label>
                  <Input value={facultyAdvisor} onChange={(e) => setFacultyAdvisor(e.target.value)} placeholder="Optional" />
                </div>
              </section>

              {/* Branding/social */}
              <section className="glass rounded-2xl p-6 border border-border/30 space-y-4">
                <h2 className="font-display text-lg font-bold text-foreground">Branding & social links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Logo letter</label>
                    <Input value={logoLetter} onChange={(e) => setLogoLetter(e.target.value)} maxLength={2} placeholder="e.g. CS" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Banner gradient</label>
                    <Input value={bannerGradient} onChange={(e) => setBannerGradient(e.target.value)} placeholder="Tailwind gradient classes" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Instagram</label>
                    <Input value={social.instagram || ""} onChange={(e) => setSocial(prev => ({ ...prev, instagram: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">LinkedIn</label>
                    <Input value={social.linkedin || ""} onChange={(e) => setSocial(prev => ({ ...prev, linkedin: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Website</label>
                    <Input value={social.website || ""} onChange={(e) => setSocial(prev => ({ ...prev, website: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Other</label>
                    <Input value={social.other || ""} onChange={(e) => setSocial(prev => ({ ...prev, other: e.target.value }))} />
                  </div>
                </div>
              </section>

              <div className="flex items-center gap-3">
                <Button onClick={handleSubmit} disabled={!canSubmit || submitting} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  {submitting ? "Submitting..." : "Submit proposal"}
                </Button>
                {!collegeId && (
                  <span className="text-xs text-muted-foreground">
                    Your profile must be linked to a college to submit.
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterClub;

