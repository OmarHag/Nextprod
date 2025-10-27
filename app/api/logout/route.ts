 import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const base = (process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin).replace(/\/$/, "");
  const res = NextResponse.redirect(`${base}/?logout=1`);
  res.cookies.set("user", "", { httpOnly: true, sameSite: "lax", secure: base.startsWith("https://"), path: "/", maxAge: 0 });
  return res;
}
