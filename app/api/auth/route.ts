import { NextResponse } from "next/server";
import { WorkOS } from "@workos-inc/node";

export async function GET(req: Request) {
  const apiKey = process.env.WORKOS_API_KEY!;
  const clientId = process.env.WORKOS_CLIENT_ID!;
  const workos = new WorkOS(apiKey);

  // Works on localhost:3000/3001 and Vercel
  const origin = new URL(req.url).origin;
  const redirectUri = `${origin}/api/auth/callback`;

  // IMPORTANT: provider must match exactly what you enabled in WorkOS → Authentication → Providers
  const authorizationUrl = workos.userManagement.getAuthorizationUrl({
    clientId,
    provider: "GoogleOAuth", // <- keep this exact casing if you enabled Google OAuth
    redirectUri,
  });

  return NextResponse.redirect(authorizationUrl);
}
