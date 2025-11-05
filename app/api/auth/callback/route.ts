import { NextRequest, NextResponse } from "next/server";
import { WorkOS } from "@workos-inc/node";

const clientId = process.env.WORKOS_CLIENT_ID!;
const apiKey = process.env.WORKOS_API_KEY!;

export async function GET(req: NextRequest) {
  try {
    const reqUrl = new URL(req.url);
    const code = reqUrl.searchParams.get("code");
    if (!code) {
      return NextResponse.redirect(new URL("/?error=missing_code", req.url));
    }

    const workos = new WorkOS(apiKey); // ✅ pass string
    const { user } = await workos.userManagement.authenticateWithCode({
      code,
      clientId,
    });

    // Set a simple cookie with the email
    const res = NextResponse.redirect(new URL("/?login=success", req.url));
    res.cookies.set("user", user.email ?? "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  } catch (e) {
    console.error("[callback] auth failed:", e);
    return NextResponse.redirect(new URL("/?error=callback_failed", req.url));
  }
}
