import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  userAgent: z.string().max(512).optional(),
});

const unsubscribeSchema = z.object({
  endpoint: z.string().url(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = subscribeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const { endpoint, keys, userAgent } = parsed.data;
  const now = new Date().toISOString();

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      user_agent: userAgent ?? null,
      updated_at: now,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    console.error("push subscribe error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Ensure preferences row exists with defaults
  await supabase.from("notification_preferences").upsert(
    { user_id: user.id, updated_at: now },
    { onConflict: "user_id", ignoreDuplicates: true }
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = unsubscribeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", parsed.data.endpoint);

  if (error) {
    console.error("push unsubscribe error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
