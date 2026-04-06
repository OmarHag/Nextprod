import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { trackServerEventSafely } from "@/lib/analytics";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const email = cookieStore.get("user")?.value ?? null;

  await trackServerEventSafely({
    eventName: "logout",
    path: "/api/logout",
    userEmail: email,
  });

  const base = (process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin).replace(/\/$/, "");
  const res = NextResponse.redirect(`${base}/?logout=1`);
  res.cookies.set("user", "", { httpOnly: true, sameSite: "lax", secure: base.startsWith("https://"), path: "/", maxAge: 0 });
  return res;
}
