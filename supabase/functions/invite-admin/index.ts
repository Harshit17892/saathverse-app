import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Validate caller using getClaims (works with ES256 signing keys)
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await callerClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.error("Claims validation failed:", claimsError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = claimsData.claims.sub as string;
    console.log("Authenticated caller:", callerId);

    // Check caller is admin using service role client
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Not an admin" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, college_id, college_name } = await req.json();

    if (!email || !college_id) {
      return new Response(JSON.stringify({ error: "email and college_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if this exact email+college already has a pending invite
    const { data: existingInvite } = await adminClient
      .from("pending_admin_invites")
      .select("id, status")
      .eq("email", email.toLowerCase().trim())
      .eq("college_id", college_id)
      .maybeSingle();

    if (existingInvite) {
      if (existingInvite.status === "accepted") {
        return new Response(JSON.stringify({ error: "This email is already an admin for this college" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // If pending, delete old one and re-create (allows re-sending)
      if (existingInvite.status === "pending") {
        await adminClient.from("pending_admin_invites").delete().eq("id", existingInvite.id);
      }
      // If rejected, delete and allow re-invite
      if (existingInvite.status === "rejected") {
        await adminClient.from("pending_admin_invites").delete().eq("id", existingInvite.id);
      }
    }

    // Check invite limit (max 3 per college)
    const { count } = await adminClient
      .from("pending_admin_invites")
      .select("*", { count: "exact", head: true })
      .eq("college_id", college_id)
      .in("status", ["pending", "accepted"]);

    if ((count || 0) >= 3) {
      return new Response(JSON.stringify({ error: "Maximum 3 college admins per college" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store the pending invite
    const { error: inviteErr } = await adminClient
      .from("pending_admin_invites")
      .insert({
        email: email.toLowerCase().trim(),
        college_id,
        role: "college_admin",
        invited_by: callerId,
      });

    if (inviteErr) {
      if (inviteErr.code === "23505") {
        return new Response(JSON.stringify({ error: "This email already has a pending invite for this college" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw inviteErr;
    }

    // Send invite via Supabase Auth (creates user if not exists, sends email)
    const { data: inviteData, error: authErr } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        college_id,
        invited_as: "college_admin",
        college_name: college_name || "your college",
      },
      redirectTo: `https://webdesignsv.lovable.app/onboarding`,
    });

    if (authErr) {
      if (authErr.message?.includes("already been registered")) {
        const { data: existingUser } = await adminClient.auth.admin.listUsers();
        const found = existingUser?.users?.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase().trim()
        );
        if (found) {
          await adminClient.from("user_roles").insert({
            user_id: found.id,
            role: "college_admin",
            college_id,
          }).select();

          await adminClient
            .from("pending_admin_invites")
            .update({ status: "accepted", updated_at: new Date().toISOString() })
            .eq("email", email.toLowerCase().trim())
            .eq("college_id", college_id);

          return new Response(JSON.stringify({
            success: true,
            message: "User already exists — assigned as college admin directly",
            already_registered: true,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
      console.error("Auth invite error:", authErr);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Invite sent to ${email}`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
