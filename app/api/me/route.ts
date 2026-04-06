import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminEmail } from "@/lib/admin";

export async function GET() {
  const c = await cookies();
  const email = c.get("user")?.value || null;
  return NextResponse.json(
    email ? { email, isAdmin: isAdminEmail(email) } : {},
    { status: 200 },
  );
}
