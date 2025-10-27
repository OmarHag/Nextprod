import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  // 👇 await cookies() in Next 15
  const cookieStore = await cookies();
  const email = cookieStore.get("user")?.value || null;
  return NextResponse.json({ email });
}
