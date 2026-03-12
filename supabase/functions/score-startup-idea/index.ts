import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ideaId } = await req.json();
    if (!ideaId) throw new Error("ideaId is required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: idea, error } = await supabase
      .from("startup_ideas")
      .select("*")
      .eq("id", ideaId)
      .single();

    if (error || !idea) throw new Error("Idea not found");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a startup evaluator AI. Evaluate the startup idea and return a JSON response using the tool provided. Be honest but constructive. Score each dimension 1-10.`
          },
          {
            role: "user",
            content: `Evaluate this startup idea:\n\nName: ${idea.name}\nCategory: ${idea.category}\nDescription: ${idea.description}\nStage: ${idea.stage}\nLooking for: ${(idea.looking_for || []).join(", ")}\nTags: ${(idea.tags || []).join(", ")}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "score_idea",
              description: "Return the evaluation scores and feedback for a startup idea",
              parameters: {
                type: "object",
                properties: {
                  overall_score: { type: "number", description: "Overall score 1-10" },
                  clarity: { type: "number", description: "Clarity score 1-10" },
                  market: { type: "number", description: "Market potential score 1-10" },
                  feasibility: { type: "number", description: "Feasibility score 1-10" },
                  innovation: { type: "string", enum: ["Low", "Moderate", "High", "Very High"] },
                  difficulty: { type: "string", enum: ["Easy", "Medium", "Hard", "Very Hard"] },
                  strengths: { type: "array", items: { type: "string" }, description: "3 key strengths" },
                  risks: { type: "array", items: { type: "string" }, description: "3 key risks" }
                },
                required: ["overall_score", "clarity", "market", "feasibility", "innovation", "difficulty", "strengths", "risks"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "score_idea" } }
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const scores = JSON.parse(toolCall.function.arguments);

    // Update the idea with AI scores
    const { error: updateError } = await supabase
      .from("startup_ideas")
      .update({
        ai_score: scores.overall_score,
        ai_clarity: scores.clarity,
        ai_market: scores.market,
        ai_feasibility: scores.feasibility,
        ai_innovation: scores.innovation,
        ai_difficulty: scores.difficulty,
        ai_strengths: scores.strengths,
        ai_risks: scores.risks,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ideaId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, scores }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("score-startup-idea error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
