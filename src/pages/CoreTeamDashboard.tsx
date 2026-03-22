import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Proposal = {
  id: string;
  user_id: string;
  college_id: string;
  name: string;
  category: string;
  tagline: string | null;
  description: string | null;
  objective: string | null;
  proposed_activities: string | null;
  faculty_advisor: string | null;
  status: string;
  created_at: string;
};

const CoreTeamDashboard = () => {
  const { collegeId, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [clubMembers, setClubMembers] = useState<any[]>([]);
  const [clubEvents, setClubEvents] = useState<any[]>([]);
  const [clubRequests, setClubRequests] = useState<any[]>([]);
  const [clubHeads, setClubHeads] = useState<any[]>([]);
  const [clubHeadQuery, setClubHeadQuery] = useState("");
  const [clubHeadSearchResults, setClubHeadSearchResults] = useState<any[]>([]);
  const [selectedClubHeadUserId, setSelectedClubHeadUserId] = useState("");
  const [assigningClubHead, setAssigningClubHead] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [removingClubHeadId, setRemovingClubHeadId] = useState<string | null>(null);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [busyProposalId, setBusyProposalId] = useState<string | null>(null);
  const [rejectReasonById, setRejectReasonById] = useState<Record<string, string>>({});

  const canLoad = !!collegeId;

  const selectedClub = useMemo(() => clubs.find(c => c.id === selectedClubId) || null, [clubs, selectedClubId]);

  const loadProposalsAndClubs = async () => {
    if (!collegeId) return;
    setLoading(true);
    try {
      const [clubsRes, propRes] = await Promise.all([
        supabase.from("clubs").select("*").eq("college_id", collegeId).eq("is_active", true).order("name"),
        supabase.from("club_proposals").select("*").eq("college_id", collegeId).eq("status", "pending").order("created_at", { ascending: false }),
      ]);

      if (clubsRes.error) throw clubsRes.error;
      if (propRes.error) throw propRes.error;

      setClubs(clubsRes.data || []);
      const firstClubId = (clubsRes.data || [])[0]?.id || "";
      setSelectedClubId(prev => prev || firstClubId);
      setProposals((propRes.data as any) || []);
    } catch (e: any) {
      toast({ title: "Load failed", description: e?.message || "Please refresh.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedClubDetails = async (clubId: string) => {
    if (!collegeId || !clubId) return;
    const [mRes, eRes, rRes, headRes] = await Promise.all([
      supabase.from("club_members").select("*").eq("college_id", collegeId).eq("club_id", clubId).order("joined_at", { ascending: true }),
      supabase.from("club_events").select("*").eq("college_id", collegeId).eq("club_id", clubId).order("created_at", { ascending: false }),
      supabase.from("club_join_requests").select("*").eq("college_id", collegeId).eq("club_id", clubId).eq("status", "pending").order("created_at", { ascending: false }),
      supabase
        .from("club_members")
        .select("id, user_id, name, role, joined_at, is_active")
        .eq("college_id", collegeId)
        .eq("club_id", clubId)
        .eq("role", "Club Head")
        .eq("is_active", true)
        .order("joined_at", { ascending: true }),
    ]);
    if (!mRes.error) setClubMembers(mRes.data || []);
    if (!eRes.error) setClubEvents(eRes.data || []);
    if (!rRes.error) setClubRequests(rRes.data || []);
    if (!headRes.error) setClubHeads(headRes.data || []);
  };

  useEffect(() => {
    loadProposalsAndClubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collegeId]);

  useEffect(() => {
    if (!selectedClubId) return;
    setClubHeadQuery("");
    setClubHeadSearchResults([]);
    setSelectedClubHeadUserId("");
    loadSelectedClubDetails(selectedClubId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClubId, collegeId]);

  useEffect(() => {
    if (!collegeId || !selectedClubId) return;
    if (clubHeadQuery.trim().length < 2) {
      setClubHeadSearchResults([]);
      return;
    }

    const t = setTimeout(async () => {
      const q = clubHeadQuery.trim();
      const { data, error } = await supabase
        .from("students")
        .select("id, name, email, branch_name")
        .eq("college_id", collegeId)
        .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
        .limit(8);

      if (error) {
        setClubHeadSearchResults([]);
        return;
      }

      const assignedIds = new Set((clubHeads || []).map((h: any) => h.user_id));
      const normalized = (data || [])
        .filter((s: any) => !assignedIds.has(s.id))
        .map((s: any) => ({
          user_id: s.id,
          full_name: s.name || "Unknown",
          email: s.email || "",
          branch: s.branch_name || "",
        }));

      setClubHeadSearchResults(normalized);
    }, 250);

    return () => clearTimeout(t);
  }, [clubHeadQuery, collegeId, selectedClubId, clubHeads]);

  const assignClubHead = async () => {
    if (!collegeId || !selectedClubId || !selectedClubHeadUserId) {
      toast({ title: "Select a student", description: "Pick a student before assigning.", variant: "destructive" });
      return;
    }

    setAssigningClubHead(true);
    try {
      const { data: student, error: sErr } = await supabase
        .from("students")
        .select("id, name")
        .eq("id", selectedClubHeadUserId)
        .eq("college_id", collegeId)
        .maybeSingle();
      if (sErr) throw sErr;
      if (!student) throw new Error("Student not found in selected college.");

      const payload = {
        club_id: selectedClubId,
        user_id: student.id,
        name: student.name || "Unknown",
        role: "Club Head",
        avatar_initials: (student.name || "??").substring(0, 2).toUpperCase(),
        added_by: user?.id || null,
        college_id: collegeId,
        is_active: true,
      };

      const { error } = await supabase
        .from("club_members")
        .upsert(payload, { onConflict: "club_id,user_id" });

      if (error) throw error;

      toast({ title: "Club Head assigned" });
      setSelectedClubHeadUserId("");
      setClubHeadQuery("");
      setClubHeadSearchResults([]);
      await loadSelectedClubDetails(selectedClubId);
    } catch (e: any) {
      toast({ title: "Assignment failed", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setAssigningClubHead(false);
    }
  };

  const removeClubHead = async (memberId: string) => {
    if (!selectedClubId) return;
    setRemovingClubHeadId(memberId);
    try {
      const { error } = await supabase
        .from("club_members")
        .update({ role: "Member" })
        .eq("id", memberId);
      if (error) throw error;

      toast({ title: "Club Head removed" });
      await loadSelectedClubDetails(selectedClubId);
    } catch (e: any) {
      toast({ title: "Failed", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setRemovingClubHeadId(null);
    }
  };

  const approveJoinRequest = async (req: any) => {
    if (!selectedClubId || processingRequestId) return;
    setProcessingRequestId(req.id);
    try {
      const { error: upErr } = await supabase
        .from("club_join_requests")
        .update({ status: "approved" })
        .eq("id", req.id);
      if (upErr) throw upErr;

      const { error: insErr } = await supabase
        .from("club_members")
        .upsert(
          {
            club_id: req.club_id,
            user_id: req.user_id,
            name: req.student_name,
            role: "Member",
            avatar_initials: (req.student_name || "??").substring(0, 2).toUpperCase(),
            college_id: collegeId,
            is_active: true,
          },
          { onConflict: "club_id,user_id" }
        );
      if (insErr) throw insErr;

      toast({ title: "Request approved" });
      await loadSelectedClubDetails(selectedClubId);
    } catch (e: any) {
      toast({ title: "Approval failed", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setProcessingRequestId(null);
    }
  };

  const rejectJoinRequest = async (requestId: string) => {
    if (!selectedClubId || processingRequestId) return;
    setProcessingRequestId(requestId);
    try {
      const { error } = await supabase
        .from("club_join_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);
      if (error) throw error;

      toast({ title: "Request rejected" });
      await loadSelectedClubDetails(selectedClubId);
    } catch (e: any) {
      toast({ title: "Reject failed", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setProcessingRequestId(null);
    }
  };

  const approveProposal = async (proposalId: string) => {
    if (busyProposalId) return;
    setBusyProposalId(proposalId);
    try {
      const { data, error } = await supabase.rpc("approve_club_proposal", { p_proposal_id: proposalId });
      if (error) throw error;
      const payload = data as any;
      if (!payload?.success && payload?.status === "already_processed") {
        toast({ title: "Already processed", description: `Current status: ${payload.current_status}` });
      } else if (payload?.success) {
        toast({ title: "Approved", description: "Club created and proposer set as President." });
      } else {
        toast({ title: "Approval failed", description: "Unexpected response.", variant: "destructive" });
      }
      await loadProposalsAndClubs();
    } catch (e: any) {
      toast({ title: "Approval failed", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setBusyProposalId(null);
    }
  };

  const rejectProposal = async (proposalId: string) => {
    if (busyProposalId) return;
    const reason = (rejectReasonById[proposalId] || "").trim();
    if (!reason) {
      toast({ title: "Rejection reason required", description: "Please enter a reason.", variant: "destructive" });
      return;
    }
    setBusyProposalId(proposalId);
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
      await loadProposalsAndClubs();
    } catch (e: any) {
      toast({ title: "Rejection failed", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setBusyProposalId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16 container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground">Core Team</h1>
          <p className="text-muted-foreground text-sm mt-1">Review proposals and monitor clubs in your college.</p>

          {!canLoad && (
            <div className="mt-6 glass rounded-2xl p-6 border border-border/30">
              <p className="text-muted-foreground">No college scope found. Please complete your profile.</p>
            </div>
          )}

          {canLoad && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Proposals */}
              <section className="glass rounded-2xl p-6 border border-border/30">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-foreground">Pending club proposals</h2>
                  <Badge variant="outline" className="text-xs">{proposals.length}</Badge>
                </div>

                {loading ? (
                  <div className="py-10 text-center text-muted-foreground text-sm">Loading...</div>
                ) : proposals.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground text-sm">No pending proposals.</div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {proposals.map((p) => (
                      <div key={p.id} className="p-4 rounded-xl border border-border/30 bg-secondary/10">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-foreground font-semibold">{p.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {p.category} • {new Date(p.created_at).toLocaleDateString()}
                            </p>
                            {p.tagline && <p className="text-xs text-muted-foreground mt-2 italic">"{p.tagline}"</p>}
                          </div>
                          <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                        </div>

                        {(p.description || p.objective || p.proposed_activities) && (
                          <div className="mt-3 space-y-2">
                            {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                            {p.objective && (
                              <div>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Objective</p>
                                <p className="text-xs text-muted-foreground">{p.objective}</p>
                              </div>
                            )}
                            {p.proposed_activities && (
                              <div>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Proposed activities</p>
                                <p className="text-xs text-muted-foreground">{p.proposed_activities}</p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-4 grid grid-cols-1 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Rejection reason (required to reject)</label>
                            <Textarea
                              className="min-h-[70px]"
                              value={rejectReasonById[p.id] || ""}
                              onChange={(e) => setRejectReasonById(prev => ({ ...prev, [p.id]: e.target.value }))}
                              disabled={busyProposalId === p.id}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => approveProposal(p.id)}
                              disabled={!!busyProposalId}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {busyProposalId === p.id ? "Working..." : "Approve"}
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => rejectProposal(p.id)}
                              disabled={!!busyProposalId}
                            >
                              {busyProposalId === p.id ? "Working..." : "Reject"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Clubs monitor */}
              <section className="glass rounded-2xl p-6 border border-border/30">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Clubs</h2>
                  <div className="min-w-[220px]">
                    <select
                      className="w-full bg-secondary/40 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground"
                      value={selectedClubId}
                      onChange={(e) => setSelectedClubId(e.target.value)}
                    >
                      <option value="">Select a club</option>
                      {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {!selectedClub && (
                  <div className="py-10 text-center text-muted-foreground text-sm">Select a club to view details.</div>
                )}

                {selectedClub && (
                  <div className="mt-5 space-y-5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-accent border-accent/30">{selectedClub.name}</Badge>
                      <Badge variant="outline" className="text-xs">{(clubMembers || []).filter(m => m.is_active).length} members</Badge>
                      <Badge variant="outline" className="text-xs">{(clubEvents || []).length} events</Badge>
                      <Badge variant="outline" className="text-xs">{(clubRequests || []).length} pending requests</Badge>
                    </div>

                    <div className="rounded-xl border border-border/30 bg-secondary/10 p-3 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Club Heads</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/club/dashboard?clubId=${selectedClubId}`)}
                          className="text-xs"
                        >
                          Open Full Club Dashboard
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Input
                          placeholder="Assign Club Head by student name or email..."
                          value={clubHeadQuery}
                          onChange={(e) => setClubHeadQuery(e.target.value)}
                          disabled={assigningClubHead}
                        />

                        {clubHeadSearchResults.length > 0 && (
                          <div className="border border-border/30 rounded-xl overflow-hidden">
                            {clubHeadSearchResults.map((p: any) => (
                              <button
                                key={p.user_id}
                                onClick={() => {
                                  setSelectedClubHeadUserId(p.user_id);
                                  setClubHeadQuery(p.full_name || "");
                                  setClubHeadSearchResults([]);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary/40 transition-colors ${
                                  selectedClubHeadUserId === p.user_id ? "bg-primary/10" : ""
                                }`}
                              >
                                <span className="text-foreground">{p.full_name}</span>
                                {p.email && <span className="text-xs text-muted-foreground ml-2">({p.email})</span>}
                                {p.branch && <span className="text-xs text-muted-foreground ml-2">• {p.branch}</span>}
                              </button>
                            ))}
                          </div>
                        )}

                        {clubHeadQuery.trim().length >= 2 && clubHeadSearchResults.length === 0 && (
                          <p className="text-xs text-muted-foreground px-2">No matching students found.</p>
                        )}

                        <Button
                          onClick={assignClubHead}
                          disabled={!selectedClubHeadUserId || assigningClubHead}
                          className="text-xs"
                        >
                          {assigningClubHead ? "Assigning..." : "Assign Club Head"}
                        </Button>
                      </div>

                      <div className="space-y-1">
                        {clubHeads.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No club heads assigned yet.</p>
                        ) : (
                          clubHeads.map((h: any) => (
                            <div key={h.id} className="flex items-center justify-between text-sm border border-border/20 rounded-lg px-3 py-2 bg-secondary/10">
                              <div>
                                <span className="text-foreground">{h.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">• Club Head</span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeClubHead(h.id)}
                                disabled={removingClubHeadId === h.id}
                                className="h-7 px-2 text-destructive hover:bg-destructive/10"
                              >
                                {removingClubHeadId === h.id ? "..." : "Remove"}
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Members</p>
                      <div className="space-y-1">
                        {(clubMembers || []).slice(0, 10).map((m) => (
                          <div key={m.id} className="flex items-center justify-between text-sm border border-border/20 rounded-lg px-3 py-2 bg-secondary/10">
                            <span className="text-foreground">{m.name}</span>
                            <Badge variant="outline" className="text-[10px]">{m.role}</Badge>
                          </div>
                        ))}
                        {(clubMembers || []).length === 0 && <p className="text-xs text-muted-foreground">No members found.</p>}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Recent events</p>
                      <div className="space-y-1">
                        {(clubEvents || []).slice(0, 5).map((e) => (
                          <div key={e.id} className="flex items-center justify-between text-sm border border-border/20 rounded-lg px-3 py-2 bg-secondary/10">
                            <span className="text-foreground">{e.name}</span>
                            <span className="text-xs text-muted-foreground">{e.date || "-"}</span>
                          </div>
                        ))}
                        {(clubEvents || []).length === 0 && <p className="text-xs text-muted-foreground">No events found.</p>}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Pending join requests</p>
                      <div className="space-y-1">
                        {(clubRequests || []).slice(0, 5).map((r) => (
                          <div key={r.id} className="flex items-center justify-between gap-3 text-sm border border-border/20 rounded-lg px-3 py-2 bg-secondary/10">
                            <div>
                              <span className="text-foreground">{r.student_name}</span>
                              <span className="text-xs text-muted-foreground ml-2">{new Date(r.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => approveJoinRequest(r)}
                                disabled={processingRequestId === r.id}
                                className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectJoinRequest(r.id)}
                                disabled={processingRequestId === r.id}
                                className="h-7 px-2 text-xs"
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                        {(clubRequests || []).length === 0 && <p className="text-xs text-muted-foreground">No pending requests.</p>}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default CoreTeamDashboard;

