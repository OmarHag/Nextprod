import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { trackServerEvent } from "@/lib/analytics";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const eventName = String(body.eventName ?? "").trim();
    const path = typeof body.path === "string" ? body.path : null;
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;
    const metadata =
      body.metadata && typeof body.metadata === "object" ? body.metadata : {};

    if (!eventName) {
      return NextResponse.json({ error: "event_name_required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const userEmail = cookieStore.get("user")?.value ?? null;

    await trackServerEvent({
      eventName,
      path,
      sessionId,
      userEmail,
      metadata,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[analytics] failed to capture event", error);
    return NextResponse.json({ error: "analytics_failed" }, { status: 500 });
  }
}
