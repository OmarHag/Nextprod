import { NextRequest, NextResponse } from "next/server";
import { WorkOS } from "@workos-inc/node";

export const runtime = "nodejs";

const apiKey = process.env.WORKOS_API_KEY!;
const clientId = process.env.WORKOS_CLIENT_ID!;

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;

  try {
    const code = req.nextUrl.searchParams.get("code");
    if (!code) {
      console.error("[callback] missing code");
      return NextResponse.redirect(`${origin}/?error=missing_code`);
    }

    const workos = new WorkOS(apiKey);
    const { user } = await workos.userManagement.authenticateWithCode({
      code,
      clientId,
    });

    console.log("[callback] user:", user);

    // Create a response and set the cookie with the user email
    const res = NextResponse.redirect(`${origin}/?login=success`);
    res.cookies.set("user_email", user?.email ?? "", {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return res;
  } catch (e) {
    console.error("[callback] error:", e);
    return NextResponse.redirect(`${origin}/?error=callback_failed`);
  }
}
