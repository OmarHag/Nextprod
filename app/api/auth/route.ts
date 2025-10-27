import { NextResponse } from "next/server";
import { WorkOS } from "@workos-inc/node";

export async function GET(req: Request) {
  const clientId = process.env.WORKOS_CLIENT_ID!;
  const apiKey = process.env.WORKOS_API_KEY!;
  const base = (process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin).replace(/\/$/, "");
  const redirectUri = `${base}/api/auth/callback`;

  const workos = new WorkOS(apiKey);
  const url = workos.userManagement.getAuthorizationUrl({
    clientId,
    provider: "GoogleOAuth",   // case-sensitive
    redirectUri,
  });

  return NextResponse.redirect(url);
}
