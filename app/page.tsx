"use client";

import { useEffect, useMemo, useState } from "react";

type Priority = "low" | "normal" | "high";
type Task = {
  id: number;
  title: string;
  notes: string;
  priority: Priority;
  due: string;
  completed: boolean;
  created_at: string;
};

type Me = { email?: string | null };

const STORAGE_KEY = "todos_v1";

export default function Home() {
  const [tab, setTab] = useState<"home" | "todo">("home");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"all" | "open" | "done" | "high">("all");
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [notes, setNotes] = useState("");

  // ----- auth: read /api/me, show email, and auto-switch to Todo when logged in
  useEffect(() => {
    fetch("/api/me")
      .then(async (r) => (r.ok ? (await r.json()) as Me : ({} as Me)))
      .then((d) => {
        if (d.email) {
          setUserEmail(d.email);
          setTab("todo");
        } else {
          setUserEmail(null);
        }
      })
      .catch(() => setUserEmail(null));
  }, []);

  // ----- load/save tasks locally
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  const view = useMemo(() => {
    if (filter === "open") return tasks.filter((t) => !t.completed);
    if (filter === "done") return tasks.filter((t) => t.completed);
    if (filter === "high") return tasks.filter((t) => t.priority === "high");
    return tasks;
  }, [tasks, filter]);

  function addTask(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const t: Task = {
      id: Date.now(),
      title: trimmed,
      notes: notes.trim(),
      priority,
      due,
      completed: false,
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [t, ...prev]);
    setTitle("");
    setNotes("");
    setPriority("normal");
    setDue("");
  }
  function del(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }
  function toggle(id: number) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }
  function edit(id: number) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    const newTitle = window.prompt("Edit title", t.title) ?? t.title;
    const newNotes = window.prompt("Edit notes", t.notes) ?? t.notes;
    setTasks((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, title: newTitle.trim(), notes: newNotes.trim() }
          : x
      )
    );
  }

  // Backgrounds to match your preferred look
  const pageBg =
    tab === "home"
      ? "bg-gray-100 text-black"
      : "bg-neutral-950 text-white"; // dark for Todo

  return (
    <main className={`min-h-screen ${pageBg}`}>
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("home")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                tab === "home"
                  ? "bg-gray-200 text-black"
                  : "hover:bg-gray-100 text-black dark:text-white dark:hover:bg-neutral-800"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setTab("todo")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                tab === "todo"
                  ? "bg-neutral-800 text-white"
                  : "hover:bg-gray-100 text-black dark:text-white dark:hover:bg-neutral-800"
              }`}
            >
              Todo
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {userEmail && (
              <span className="hidden sm:block text-xs sm:text-sm text-black/70 dark:text-white/70 truncate max-w-[180px]">
                {userEmail}
              </span>
            )}
            {userEmail ? (
              <a
                href="/api/logout"
                className="px-3 py-1.5 rounded-md bg-neutral-800 text-white hover:bg-neutral-700 text-sm"
              >
                Logout
              </a>
            ) : (
              <a
                href="/api/auth"
                className="px-3 py-1.5 rounded-md bg-black text-white hover:bg-neutral-800 text-sm"
              >
                Login
              </a>
            )}
          </div>
        </div>
      </header>

      {/* HOME */}
      {tab === "home" && (
        <section className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Omar Hagaley</h1>
            <p className="text-lg">
              This website is <span className="font-semibold">deployed with Vercel</span> 🚀
            </p>
          </div>
        </section>
      )}

      {/* TODO */}
      {tab === "todo" && (
        <section className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-2xl border border-white/10 bg-neutral-900/90 p-5 shadow-2xl">
            {userEmail && (
              <p className="mb-2 text-sm text-white/80">
                👋 Welcome back, <span className="font-semibold">{userEmail}</span>!
              </p>
            )}

            <h2 className="text-2xl md:text-3xl font-extrabold mb-4">My To-Do Life</h2>

            {/* Form */}
            <form
              onSubmit={addTask}
              className="grid grid-cols-1 md:grid-cols-[1fr_140px_120px_1fr_96px] gap-2 mb-4"
            >
              <input
                className="px-3 py-2 rounded-lg border border-white/15 bg-neutral-800 text-white placeholder-white/50"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                type="date"
                className="px-3 py-2 rounded-lg border border-white/15 bg-neutral-800 text-white placeholder-white/50"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
              <select
                className="px-3 py-2 rounded-lg border border-white/15 bg-neutral-800 text-white"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="low">low</option>
                <option value="normal">normal</option>
                <option value="high">high</option>
              </select>
              <input
                className="px-3 py-2 rounded-lg border border-white/15 bg-neutral-800 text-white placeholder-white/50"
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <button className="px-3 py-2 rounded-lg border border-white/15 bg-white text-black font-medium hover:bg-white/90">
                Add
              </button>
            </form>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(["all", "open", "done", "high"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${
                    filter === f
                      ? "border-blue-400 text-blue-300 bg-blue-400/10"
                      : "border-white/15 text-white/80 hover:bg-white/5"
                  }`}
                >
                  {f === "all"
                    ? "All"
                    : f === "open"
                    ? "Open"
                    : f === "done"
                    ? "Completed"
                    : "High Priority"}
                </button>
              ))}
            </div>

            {/* List */}
            <ul className="grid gap-2 p-0 m-0 list-none">
              {view.map((t) => (
                <li
                  key={t.id}
                  className={`rounded-xl p-3 border ${
                    t.completed
                      ? "bg-neutral-800/70 border-white/10 opacity-80"
                      : "bg-neutral-800 border-white/10"
                  }`}
                >
                  <div className="grid grid-cols-[28px_1fr_auto_auto_auto] gap-3 items-center">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => toggle(t.id)}
                      className="h-4 w-4 accent-blue-500"
                    />
                    <span className="font-semibold">{t.title}</span>
                    <span className="text-xs text-white/60">
                      {t.priority.toUpperCase()} {t.due ? `• due ${t.due}` : ""}
                    </span>
                    <button
                      className="underline text-sm text-blue-300 hover:text-blue-200"
                      onClick={() => edit(t.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="underline text-sm text-rose-300 hover:text-rose-200"
                      onClick={() => del(t.id)}
                    >
                      Delete
                    </button>
                  </div>
                  {t.notes ? <div className="mt-1 text-white/80">{t.notes}</div> : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
