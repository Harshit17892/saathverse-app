import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPER_ADMIN_EMAILS = ["harshit02425@gmail.com"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const jwt = authHeader.replace("Bearer ", "").trim();

    const {
      data: { user: callerUser },
      error: userErr,
    } = await adminClient.auth.getUser(jwt);

    if (userErr || !callerUser) {
      console.error("Caller auth failed:", userErr);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = callerUser.id;
    const callerEmail = (callerUser.email || "").toLowerCase();
    console.log("Authenticated caller:", callerId, callerEmail);

    // ✅ FIXED: removed .in("role", [...]) which was crashing on unknown enum values
    const { data: roleRows, error: roleErr } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId);

    if (roleErr) {
      console.error("Role lookup failed:", roleErr);
      return new Response(JSON.stringify({ error: "Role lookup failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const roleSet = new Set((roleRows || []).map((r: any) => String(r.role)));
    const isAdmin = roleSet.has("admin") || roleSet.has("college_admin");
    const isEmailSuperAdmin = SUPER_ADMIN_EMAILS.includes(callerEmail);

    console.log("Roles found:", [...roleSet], "isAdmin:", isAdmin, "isEmailSuperAdmin:", isEmailSuperAdmin);

    if (!isAdmin && !isEmailSuperAdmin) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { email, college_id, college_name } = body;

    if (!email || !college_id) {
      return new Response(JSON.stringify({ error: "email and college_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the college exists
    const { data: collegeCheck } = await adminClient
      .from("colleges")
      .select("id, name")
      .eq("id", college_id)
      .maybeSingle();

    if (!collegeCheck) {
      return new Response(JSON.stringify({ error: "College not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const resolvedCollegeName = college_name || collegeCheck.name || "your college";

    // Check if this exact email+college already has an invite
    const { data: existingInvite } = await adminClient
      .from("pending_admin_invites")
      .select("id, status")
      .eq("email", normalizedEmail)
      .eq("college_id", college_id)
      .maybeSingle();

    if (existingInvite) {
      if (existingInvite.status === "accepted") {
        return new Response(JSON.stringify({ error: "This email is already an admin for this college" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // pending or rejected — delete and re-create to allow re-sending
      await adminClient.from("pending_admin_invites").delete().eq("id", existingInvite.id);
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
        email: normalizedEmail,
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

    // Try to send invite email via Supabase Auth
    const siteUrl = Deno.env.get("SITE_URL") || "https://saathverse.com";
    const { error: authErr } = await adminClient.auth.admin.inviteUserByEmail(normalizedEmail, {
      data: {
        college_id,
        invited_as: "college_admin",
        college_name: resolvedCollegeName,
      },
      redirectTo: `${siteUrl}/auth/callback`,
    });

    if (authErr) {
      // User already exists — assign role directly
      if (authErr.message?.toLowerCase().includes("already")) {
        const { data: usersPage, error: listErr } = await adminClient.auth.admin.listUsers();
        if (listErr) throw listErr;

        const found = usersPage?.users?.find(
          (u: any) => u.email?.toLowerCase() === normalizedEmail
        );

        if (found) {
          const { error: assignErr } = await adminClient
            .from("user_roles")
            .insert({ user_id: found.id, role: "college_admin", college_id });

          if (assignErr && assignErr.code !== "23505") throw assignErr;

          await adminClient
            .from("pending_admin_invites")
            .update({ status: "accepted", updated_at: new Date().toISOString() })
            .eq("email", normalizedEmail)
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
      // Don't fail — invite is saved in DB, will auto-apply on signup
      return new Response(JSON.stringify({
        success: true,
        message: `Invite saved for ${normalizedEmail}. Email delivery failed but invite will auto-apply on signup.`,
        email_failed: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Invite sent to ${normalizedEmail}`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("Unhandled error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
