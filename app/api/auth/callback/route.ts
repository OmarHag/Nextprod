import { NextResponse } from "next/server";
import { WorkOS } from "@workos-inc/node";

export async function GET(req: Request) {
  const apiKey = process.env.WORKOS_API_KEY!;
  const clientId = process.env.WORKOS_CLIENT_ID!;
  const base = (process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin).replace(/\/$/, "");

  const code = new URL(req.url).searchParams.get("code");
  if (!code) return NextResponse.redirect(`${base}/?error=missing_code`);

  try {
    const workos = new WorkOS(apiKey);
    const { user } = await workos.userManagement.authenticateWithCode({ code, clientId });

    const res = NextResponse.redirect(`${base}/?login=success`);
    // IMPORTANT: cookie name must match /api/me
    res.cookies.set("user", user.email ?? "", {
      httpOnly: true,
      sameSite: "lax",
      secure: base.startsWith("https://"), // true on Vercel, false locally
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    console.error("[callback] auth failed:", e);
    return NextResponse.redirect(`${base}/?error=callback_failed`);
  }
}
