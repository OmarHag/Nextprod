// app/api/tasks/[id]/toggle/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";
import { trackServerEventSafely } from "@/lib/analytics";

async function getUserEmail(): Promise<string | null> {
  const c = await cookies();
  return c.get("user")?.value ?? null;
}

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // 👈 IMPORTANT in Next 15+
  const email = await getUserEmail();
  if (!email) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { rows } = await pool.query(
    `update tasks
       set completed = not completed
     where id = $1 and user_email = $2
     returning id, title, notes, priority,
               coalesce(to_char(due, 'YYYY-MM-DD'), '') as due,
               completed, created_at`,
    [id, email]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await trackServerEventSafely({
    eventName: "todo_toggled",
    path: "/?tab=todo",
    userEmail: email,
    metadata: {
      taskId: Number(id),
      completed: rows[0]?.completed ?? null,
    },
  });

  return NextResponse.json(rows[0]);
}
