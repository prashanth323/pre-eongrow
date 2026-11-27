import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface PaymentOrderRequest {
  purpose: "membership_subscription" | "event_ticket" | "service_purchase";
  reference_type: string;
  reference_id: string;
  amount: number;
  currency?: string;
  tax_amount?: number;
  discount_amount?: number;
  notes?: Record<string, string>;
}

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

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body: PaymentOrderRequest = await req.json();

    if (!body.purpose || !body.reference_type || !body.reference_id || !body.amount) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (body.amount <= 0) {
      return new Response(JSON.stringify({ error: "Amount must be positive" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const currency = body.currency || "INR";
    const amountInSmallestUnit = Math.round(body.amount * 100);

    const razorpayAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${razorpayAuth}`,
      },
      body: JSON.stringify({
        amount: amountInSmallestUnit,
        currency: currency,
        receipt: `ngf_${body.reference_type}_${body.reference_id.substring(0, 8)}`,
        notes: body.notes || {},
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error("Razorpay order creation failed:", errorText);
      return new Response(JSON.stringify({ error: "Payment order creation failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const razorpayOrder = await razorpayResponse.json();

    const { data: paymentId, error: dbError } = await supabaseClient.rpc(
      "create_payment_order",
      {
        _user_id: user.id,
        _purpose: body.purpose,
        _amount: body.amount,
        _reference_type: body.reference_type,
        _reference_id: body.reference_id,
        _provider_order_id: razorpayOrder.id,
        _tax_amount: body.tax_amount || 0,
        _discount_amount: body.discount_amount || 0,
        _notes: body.notes || {},
      }
    );

    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to create payment record" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        payment_id: paymentId,
        order_id: razorpayOrder.id,
        amount: body.amount,
        currency: currency,
        key_id: RAZORPAY_KEY_ID,
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
