import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Create user-authenticated client to verify who the scanner is
    const userClient = createClient(SUPABASE_URL, token, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { qr_token } = await req.json();

    if (!qr_token) {
      return new Response(JSON.stringify({ error: "Missing QR token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Use service role client to execute the hardened validate_event_ticket RPC
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data, error } = await serviceClient.rpc("validate_event_ticket", {
      _qr_token: qr_token,
    });

    if (error) {
      console.error("Validation error:", error);
      return new Response(
        JSON.stringify({
          error: error.message || "Ticket validation failed",
          is_valid: false,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    const result = Array.isArray(data) ? data[0] : data;

    return new Response(
      JSON.stringify({
        is_valid: result?.is_valid || false,
        scan_result: result?.scan_result || "invalid",
        ticket_number: result?.ticket_number,
        event_title: result?.event_title,
        attendee_name: result?.attendee_name,
        ticket_status: result?.ticket_status,
        checked_in_at: result?.checked_in_at,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
