import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Search, Code, GraduationCap, ArrowLeft, X } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

interface StudentResult {
  id: string;
  name: string;
  email: string | null;
  skills: string[] | null;
  branch_id: string | null;
  avatar_url: string | null;
  bio: string | null;
  status: string | null;
  branch_name?: string;
}

const SearchResults = () => {
  const { collegeId } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [input, setInput] = useState(query);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setInput(query);
    if (query.trim().length < 2) { setResults([]); return; }

    // Tenant isolation: search must always be scoped to the active college.
    if (!collegeId) { setResults([]); return; }

    const fetchResults = async () => {
      setLoading(true);
      const q = query.trim().toLowerCase();

      const { data } = await supabase
        .from("students")
        .select("id, name, email, skills, branch_id, avatar_url, bio, status")
        .eq("college_id", collegeId)
        .or(`name.ilike.%${q}%,email.ilike.%${q}%,bio.ilike.%${q}%`)
        .limit(50);

      let combined = data || [];

      // Branch name lookup
      const branchIds = [...new Set(combined.filter(s => s.branch_id).map(s => s.branch_id!))];
      let branchMap: Record<string, string> = {};
      if (branchIds.length > 0) {
        const { data: branches } = await supabase
          .from("branches")
          .select("id, name")
          .eq("college_id", collegeId)
          .in("id", branchIds);
        if (branches) branchMap = Object.fromEntries(branches.map(b => [b.id, b.name]));
      }

      setResults(combined.map(s => ({ ...s, branch_name: s.branch_id ? branchMap[s.branch_id] : undefined })));
      setLoading(false);
    };
    fetchResults();
  }, [query, collegeId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().length >= 2) setSearchParams({ q: input.trim() });
  };

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Back + Search */}
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => navigate("/")} className="h-10 w-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <form onSubmit={handleSearch} className="flex-1 flex items-center gap-3 rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl px-5 py-3 shadow-lg focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search students by name, skills, branch..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                autoFocus
              />
              {input && (
                <button type="button" onClick={() => { setInput(""); }} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
              <button type="submit" disabled={input.trim().length < 2} className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40">
                Search
              </button>
            </form>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : query.trim().length < 2 ? (
            <p className="text-center text-muted-foreground py-16">Enter at least 2 characters to search.</p>
          ) : results.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No students found for "{query}"</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">{results.length} result{results.length !== 1 ? "s" : ""} for "{query}"</p>
              <div className="grid gap-3">
                {results.map((student, i) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      to={`/profile/${student.id}`}
                      className="flex items-start gap-4 p-4 rounded-2xl border border-border/30 bg-card/60 hover:bg-card hover:border-primary/30 transition-all"
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary overflow-hidden">
                        {student.avatar_url ? (
                          <img src={student.avatar_url} alt={student.name} className="h-full w-full object-cover rounded-full" />
                        ) : (
                          getInitials(student.name)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{student.name}</span>
                          {student.status === "alumni" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-medium">Alumni</span>
                          )}
                        </div>
                        {student.branch_name && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{student.branch_name}</span>
                          </div>
                        )}
                        {student.bio && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{student.bio}</p>
                        )}
                        {student.skills && student.skills.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                            <Code className="h-3 w-3 text-muted-foreground shrink-0" />
                            {student.skills.slice(0, 5).map(skill => (
                              <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80">{skill}</span>
                            ))}
                            {student.skills.length > 5 && (
                              <span className="text-[10px] text-muted-foreground">+{student.skills.length - 5}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
