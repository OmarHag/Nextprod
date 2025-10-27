import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userEmail = req.cookies.get("user_email")?.value;
  return NextResponse.json({ email: userEmail || null });
}
