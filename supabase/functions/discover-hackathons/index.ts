import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generateGeminiJson } from '../_shared/gemini.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'Missing configuration' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get optional college_id from request
    let collegeId: string | null = null;
    try {
      const body = await req.json();
      collegeId = body?.college_id || null;
    } catch {
      // No body is fine for scheduled calls
    }

    // Get existing hackathon titles to avoid duplicates
    const { data: existing } = await supabase
      .from('hackathons')
      .select('title')
      .order('created_at', { ascending: false })
      .limit(100);
    const existingTitles = (existing || []).map((h: any) => h.title.toLowerCase());

    const hackathons = await generateGeminiJson<any[]>({
      apiKey: GEMINI_API_KEY,
      model: 'gemini-2.0-flash',
      temperature: 0.7,
      systemPrompt: `You are a hackathon discovery assistant. Generate a JSON array of 5-8 real, currently upcoming hackathons happening in India (or globally popular ones). These should be REAL hackathons that are actually happening soon. Return ONLY a valid JSON array, no markdown.

Each hackathon object should have:
{
  "title": "exact hackathon name",
  "tagline": "short description",
  "date": "display date like 'Mar 15-17, 2026'",
  "location": "city or 'Online'",
  "prize": "prize pool",
  "max_participants": number or null,
  "tags": ["tag1", "tag2"],
  "status": "upcoming" or "open",
  "gradient": "from-purple-500 to-pink-500" (random tailwind gradient)
}

IMPORTANT: Do NOT include any of these existing hackathons: ${existingTitles.slice(0, 20).join(', ')}

Return ONLY the JSON array.`
  ,
      userPrompt: `Find real upcoming hackathons for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Focus on popular platforms like Devfolio, Unstop, MLH, etc.`,
    });

    if (!Array.isArray(hackathons)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid response format' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Filter out duplicates
    const newHackathons = hackathons.filter(
      (h: any) => !existingTitles.includes(h.title?.toLowerCase())
    );

    // Insert new hackathons
    const inserted = [];
    for (const h of newHackathons) {
      const { error } = await supabase.from('hackathons').insert({
        title: h.title,
        tagline: h.tagline || null,
        date: h.date || null,
        location: h.location || null,
        prize: h.prize || null,
        max_participants: h.max_participants || 100,
        participants: 0,
        tags: h.tags || [],
        status: h.status || 'upcoming',
        gradient: h.gradient || 'from-primary to-purple-400',
        icon: 'globe',
        college_id: collegeId,
      });
      if (!error) {
        inserted.push(h.title);
      } else {
        console.error('Insert error for', h.title, error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      discovered: hackathons.length,
      inserted: inserted.length,
      titles: inserted,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Discovery error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
