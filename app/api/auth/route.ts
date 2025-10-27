import { NextRequest, NextResponse } from "next/server";
import { WorkOS } from "@workos-inc/node";

// Force Node runtime (not Edge)
export const runtime = "nodejs";

const apiKey = process.env.WORKOS_API_KEY!;
const clientId = process.env.WORKOS_CLIENT_ID!;

export async function GET(req: NextRequest) {
  try {
    if (!apiKey || !clientId) {
      console.error("[auth] missing envs", { hasApiKey: !!apiKey, hasClientId: !!clientId });
      return NextResponse.json({ error: "server env missing" }, { status: 500 });
    }

    // Build absolute redirect URI
    const origin = req.nextUrl.origin; // e.g. http://localhost:3000
    const redirectUri = `${origin}/api/auth/callback`;

    const workos = new WorkOS(apiKey);

    // ✅ Use the correct provider name
    const authorizationUrl = workos.userManagement.getAuthorizationUrl({
      clientId,
      redirectUri,
      provider: "GoogleOAuth",
      // optional: state, prompt, etc.
    });

    console.log("[auth] redirecting to", authorizationUrl);
    return NextResponse.redirect(authorizationUrl);
  } catch (e) {
    console.error("[auth] error:", e);
    return NextResponse.json({ error: "auth route failed" }, { status: 500 });
  }
}
