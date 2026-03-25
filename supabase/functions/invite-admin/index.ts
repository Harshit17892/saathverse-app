import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPER_ADMIN_EMAILS = ["harshit02425@gmail.com"];

const buildInviteRedirectUrl = () => {
  const explicit = Deno.env.get("ADMIN_INVITE_REDIRECT_URL")?.trim();
  if (explicit) return explicit;

  const siteUrl = (Deno.env.get("SITE_URL") || "https://www.saathverse.com").trim().replace(/\/$/, "");
  return `${siteUrl}/auth/callback`;
};

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
    console.log("Authenticated caller:", callerId);

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
    const isSuperAdmin = roleSet.has("super_admin");

    const isEmailSuperAdmin = SUPER_ADMIN_EMAILS.includes(callerEmail);

    if (!isAdmin && !isSuperAdmin && !isEmailSuperAdmin) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
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
    const normalizedEmail = email.toLowerCase().trim();

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
      // If pending/rejected, delete old one and re-create (allows re-sending)
      if (existingInvite.status === "pending" || existingInvite.status === "rejected") {
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
    const { data: insertedInvite, error: inviteErr } = await adminClient
      .from("pending_admin_invites")
      .insert({
        email: normalizedEmail,
        college_id,
        role: "college_admin",
        invited_by: callerId,
      })
      .select("id")
      .single();

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
    const redirectTo = buildInviteRedirectUrl();
    const { error: authErr } = await adminClient.auth.admin.inviteUserByEmail(normalizedEmail, {
      data: {
        college_id,
        invited_as: "college_admin",
        college_name: college_name || "your college",
      },
      redirectTo,
    });

    if (authErr) {
      // Existing account path: assign role directly
      if (authErr.message?.toLowerCase().includes("already")) {
        const { data: usersPage, error: listErr } = await adminClient.auth.admin.listUsers();
        if (listErr) throw listErr;

        const found = usersPage?.users?.find(
          (u) => u.email?.toLowerCase() === normalizedEmail
        );

        if (found) {
          const { error: roleErr } = await adminClient
            .from("user_roles")
            .insert({
              user_id: found.id,
              role: "college_admin",
              college_id,
            });

          if (roleErr && roleErr.code !== "23505") {
            throw roleErr;
          }

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

      return new Response(JSON.stringify({
        success: true,
        message: `Invite saved for ${normalizedEmail}. Email delivery failed but invite will auto-apply on signup.`,
        email_failed: true,
        error: authErr.message || "Failed to send invite",
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
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
