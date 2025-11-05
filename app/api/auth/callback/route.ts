import { NextResponse } from "next/server";
import { WorkOS } from "@workos-inc/node";

export async function GET(req: Request) {
  const apiKey = process.env.WORKOS_API_KEY!;
  const clientId = process.env.WORKOS_CLIENT_ID!;
  const workos = new WorkOS(apiKey);

  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

  try {
    const { user } = await workos.userManagement.authenticateWithCode({
      code,
      clientId,
    });

    // Set cookie (secure only on https)
    const res = NextResponse.redirect(`${origin}/?login=success`);
    res.cookies.set("user", user.email ?? "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: origin.startsWith("https"),
    });
    return res;
  } catch (e) {
    console.error("[callback] auth failed:", e);
    return NextResponse.redirect(`${origin}/?error=callback_failed`);
  }
}
