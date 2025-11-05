import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL || null;
  const origin = new URL(req.url).origin; // the domain the request hit (prod/preview)
  const base = (envBase || origin).replace(/\/$/, "");
  const redirect = `${base}/api/auth/callback`;

  return NextResponse.json({
    envBase,
    origin,
    computedBase: base,
    redirectSentToWorkOS: redirect,
    hint: "Add redirectSentToWorkOS to WorkOS → Authentication → Redirect URIs.",
  });
}
