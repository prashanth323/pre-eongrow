import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const expectedSignature = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expectedSignature === signature;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const signature = req.headers.get("x-razorpay-signature") || "";
    const rawBody = await req.text();

    // Verify webhook signature if secret configured
    if (RAZORPAY_WEBHOOK_SECRET) {
      const isValid = await verifyWebhookSignature(rawBody, signature, RAZORPAY_WEBHOOK_SECRET);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    const eventId = payload.payload?.payment?.entity?.id || payload.payload?.refund?.entity?.id || crypto.randomUUID();

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Idempotency check: prevent duplicate webhook processing
    const { data: existingWebhook } = await supabaseClient
      .from("payment_webhooks")
      .select("id")
      .eq("provider", "razorpay")
      .eq("event_id", eventId)
      .single();

    if (existingWebhook) {
      return new Response(JSON.stringify({ message: "Already processed" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Store webhook event
    const { data: webhook, error: webhookError } = await supabaseClient
      .from("payment_webhooks")
      .insert({
        provider: "razorpay",
        event_type: eventType,
        event_id: eventId,
        payload: payload,
      })
      .select()
      .single();

    if (webhookError) {
      console.error("Failed to store webhook:", webhookError);
      return new Response(JSON.stringify({ error: "Failed to process" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Process based on event type
    let processed = false;
    let errorMessage = null;

    try {
      switch (eventType) {
        case "payment.captured": {
          const paymentEntity = payload.payload.payment.entity;
          const orderId = paymentEntity.order_id;
          const paymentId = paymentEntity.id;

          const { data: paymentRecord } = await supabaseClient
            .from("payments")
            .select("id, status")
            .eq("provider_order_id", orderId)
            .single();

          if (paymentRecord && (paymentRecord.status === "pending" || paymentRecord.status === "processing")) {
            await supabaseClient.rpc("complete_payment", {
              _payment_id: paymentRecord.id,
              _provider_payment_id: paymentId,
              _provider_signature: signature,
            });
          }
          processed = true;
          break;
        }

        case "payment.failed": {
          const paymentEntity = payload.payload.payment.entity;
          const orderId = paymentEntity.error_description ? paymentEntity.order_id : null;
          const reason = paymentEntity.error_description || "Payment failed";

          if (orderId) {
            await supabaseClient
              .from("payments")
              .update({ status: "failed", failure_reason: reason })
              .eq("provider_order_id", orderId);
          }

          processed = true;
          break;
        }

        case "refund.processed": {
          const refundEntity = payload.payload.refund.entity;
          const paymentId = refundEntity.payment_id;

          const { data: paymentRecord } = await supabaseClient
            .from("payments")
            .select("id, user_id")
            .eq("provider_payment_id", paymentId)
            .single();

          if (paymentRecord) {
            const refundAmount = refundEntity.amount / 100;
            await supabaseClient.from("refunds").insert({
              payment_id: paymentRecord.id,
              user_id: paymentRecord.user_id,
              amount: refundAmount,
              status: "completed",
              provider_refund_id: refundEntity.id,
              processed_at: new Date().toISOString(),
            });

            await supabaseClient
              .from("payments")
              .update({ status: "refunded" })
              .eq("id", paymentRecord.id);
          }
          processed = true;
          break;
        }

        default:
          console.log("Unhandled webhook event:", eventType);
          processed = true;
      }
    } catch (processErr) {
      errorMessage = processErr instanceof Error ? processErr.message : String(processErr);
      console.error("Error processing webhook:", errorMessage);
    }

    await supabaseClient
      .from("payment_webhooks")
      .update({
        processed,
        processed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq("id", webhook.id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
