// app/api/tasks/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";

const getUserEmail = async (): Promise<string | null> => {
  const c = await cookies();
  return c.get("user")?.value ?? null;
};

// GET /api/tasks  -> list current user's tasks
export async function GET() {
  const email = await getUserEmail();
  if (!email) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { rows } = await pool.query(
    `select
       id::int as id,
       title,
       notes,
       priority,
       coalesce(to_char(due, 'YYYY-MM-DD'), '') as due,
       completed,
       created_at
     from tasks
     where user_email = $1
     order by created_at desc`,
    [email]
  );

  return NextResponse.json({ tasks: rows });
}

// POST /api/tasks  -> create a task
export async function POST(req: Request) {
  const email = await getUserEmail();
  if (!email) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({} as any));
  const title = String(body.title ?? "").trim();
  const notes = String(body.notes ?? "").trim();
  const priority = String(body.priority ?? "normal").trim();
  const due = String(body.due ?? "").trim(); // "YYYY-MM-DD" or ""

  if (!title) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }

  const { rows } = await pool.query(
    `insert into tasks (user_email, title, notes, priority, due, completed)
     values ($1, $2, $3, $4, nullif($5,'')::date, false)
     returning
       id::int as id,
       title,
       notes,
       priority,
       coalesce(to_char(due, 'YYYY-MM-DD'), '') as due,
       completed,
       created_at`,
    [email, title, notes, priority, due]
  );

  return NextResponse.json(rows[0], { status: 201 });
}
