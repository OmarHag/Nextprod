// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";

async function getUserEmail(): Promise<string | null> {
  const c = await cookies();
  return c.get("user")?.value ?? null;
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // 👈 IMPORTANT in Next 15+
  const email = await getUserEmail();
  if (!email) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const title = String(body.title ?? "").trim();
  const notes = String(body.notes ?? "").trim();

  const { rows } = await pool.query(
    `update tasks
        set title = coalesce(nullif($1, ''), title),
            notes = $2
      where id = $3 and user_email = $4
      returning id, title, notes, priority,
                coalesce(to_char(due, 'YYYY-MM-DD'), '') as due,
                completed, created_at`,
    [title, notes, id, email]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(rows[0]);
}