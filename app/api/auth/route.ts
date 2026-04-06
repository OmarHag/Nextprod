import { NextRequest, NextResponse } from "next/server";
import { WorkOS } from "@workos-inc/node";
import { trackServerEventSafely } from "@/lib/analytics";

const clientId = process.env.WORKOS_CLIENT_ID!;
const apiKey = process.env.WORKOS_API_KEY!;

export async function GET(req: NextRequest) {
  // Build absolute redirect URI that matches current host (works on localhost, Vercel, custom domain)
  const url = new URL(req.url);
  const origin = `${url.protocol}//${url.host}`;
  const redirectUri = `${origin}/api/auth/callback`;

  const workos = new WorkOS(apiKey); // ✅ pass string
  const authUrl = workos.userManagement.getAuthorizationUrl({
    clientId,
    provider: "GoogleOAuth", // make sure Google OAuth is enabled in WorkOS
    redirectUri,
  });

  await trackServerEventSafely({
    eventName: "login_clicked",
    path: "/api/auth",
    metadata: {
      redirectUri,
      origin,
    },
  });

  return NextResponse.redirect(authUrl);
}
