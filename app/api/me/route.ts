import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const c = await cookies();
  const email = c.get("user")?.value || null;
  return NextResponse.json(email ? { email } : {}, { status: 200 });
}
