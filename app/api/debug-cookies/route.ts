import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const c = await cookies();
  // Dump all cookies the server can see
  const all = Array.from(c.getAll()).map(({ name, value }) => ({ name, value }));
  return NextResponse.json({ cookies: all }, { status: 200 });
}
