import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface VerifyPaymentRequest {
  payment_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const message = `${orderId}|${paymentId}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  const expectedSignature = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expectedSignature === signature;
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

    const body: VerifyPaymentRequest = await req.json();

    if (!body.payment_id || !body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify the payment belongs to this user
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .select("*")
      .eq("id", body.payment_id)
      .eq("user_id", user.id)
      .single();

    if (paymentError || !payment) {
      return new Response(JSON.stringify({ error: "Payment not found or unauthorized" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (payment.provider_order_id !== body.razorpay_order_id) {
      return new Response(JSON.stringify({ error: "Order ID mismatch" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify Razorpay signature server-side
    const isValid = await verifyRazorpaySignature(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature,
      RAZORPAY_KEY_SECRET
    );

    if (!isValid) {
      await supabaseClient
        .from("payments")
        .update({ status: "failed", failure_reason: "Signature verification failed" })
        .eq("id", body.payment_id);

      return new Response(JSON.stringify({ error: "Payment verification failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Complete the payment via DB function (activates subscription/ticket)
    const { error: completeError } = await supabaseClient.rpc(
      "complete_payment",
      {
        _payment_id: body.payment_id,
        _provider_payment_id: body.razorpay_payment_id,
        _provider_signature: body.razorpay_signature,
      }
    );

    if (completeError) {
      console.error("Complete payment error:", completeError);
      return new Response(JSON.stringify({ error: "Failed to complete payment" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and processed successfully",
        payment_id: body.payment_id,
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
