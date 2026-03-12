import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { team_name, description, looking_for, college_id } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get profiles with matching skills from the same college
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, skills, branch, bio")
      .eq("college_id", college_id)
      .limit(50);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const profileList = profiles
      .filter((p: any) => p.full_name)
      .map((p: any) => `- ${p.full_name}: skills=${(p.skills || []).join(", ")}, branch=${p.branch || "N/A"}`)
      .join("\n");

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a teammate matcher. Given a team description and available people, suggest the best 3-5 matches. Return ONLY a JSON array of objects with fields: user_id, name, reason (1 sentence why they're a good fit). No markdown, just the JSON array.",
          },
          {
            role: "user",
            content: `Team: "${team_name}"\nDescription: "${description || ""}"\nLooking for domains: ${(looking_for || []).join(", ")}\n\nAvailable people:\n${profileList}\n\nSuggest the best teammates.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Parse AI response
    let suggestions = [];
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      suggestions = JSON.parse(cleaned);
    } catch {
      suggestions = [];
    }

    // Enrich with profile data
    const enriched = suggestions.map((s: any) => {
      const profile = profiles.find((p: any) => p.user_id === s.user_id);
      return {
        user_id: s.user_id || null,
        name: s.name || profile?.full_name || "Unknown",
        skills: profile?.skills || [],
        branch: profile?.branch || null,
        reason: s.reason || "Good skill match",
      };
    }).filter((s: any) => s.name);

    return new Response(JSON.stringify({ suggestions: enriched }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ suggestions: [], error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
