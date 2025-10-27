import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect("http://localhost:3000");
  res.cookies.set("user_email", "", { maxAge: 0, path: "/" });
  return res;
}
