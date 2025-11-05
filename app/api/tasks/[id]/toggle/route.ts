import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";

const getUserEmail = async (): Promise<string | null> => {
  const c = await cookies();
  return c.get("user")?.value ?? null;
};

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const email = await getUserEmail();
  if (!email) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  // Flip the completed flag only for the owner of the task
  const { rows } = await pool.query(
    `
    update tasks
       set completed = not completed
     where id = $1 and user_email = $2
     returning
       id::int as id,
       title,
       notes,
       priority,
       coalesce(to_char(due, 'YYYY-MM-DD'), '') as due,
       completed,
       created_at
    `,
    [id, email]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}
