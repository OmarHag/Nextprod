"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import SiteHeader from "@/components/SiteHeader";
import { trackEvent } from "@/lib/analytics-client";

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

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<"home" | "todo">("home");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"all" | "open" | "done" | "high">("all");
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get("tab");
    setTab(requestedTab === "todo" ? "todo" : "home");
  }, []);

  useEffect(() => {
    fetch("/api/me")
      .then(async (r) => (r.ok ? ((await r.json()) as Me) : ({} as Me)))
      .then((d) => {
        if (d.email) {
          setUserEmail(d.email);
          if (new URLSearchParams(window.location.search).get("tab") === "todo") {
            setTab("todo");
          }
        } else {
          setUserEmail(null);
        }
      })
      .catch(() => setUserEmail(null));
  }, []);

  useEffect(() => {
    if (!userEmail) return;
    setLoading(true);
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((d) => {
        if (d.tasks) setTasks(d.tasks);
      })
      .finally(() => setLoading(false));
  }, [userEmail]);

  const view = useMemo(() => {
    if (filter === "open") return tasks.filter((t) => !t.completed);
    if (filter === "done") return tasks.filter((t) => t.completed);
    if (filter === "high") return tasks.filter((t) => t.priority === "high");
    return tasks;
  }, [tasks, filter]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, notes, priority, due }),
    });

    if (res.ok) {
      const newTask: Task = await res.json();
      setTasks((prev) => [newTask, ...prev]);
      setTitle("");
      setNotes("");
      setPriority("normal");
      setDue("");
    }
  }

  async function toggle(id: number) {
    await fetch(`/api/tasks/${id}/toggle`, { method: "POST" });
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }

  async function edit(id: number) {
    if (!userEmail) return;
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    const newTitle = window.prompt("Edit title", task.title) ?? task.title;
    const newNotes = window.prompt("Edit notes", task.notes) ?? task.notes;

    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), notes: newNotes.trim() }),
    });

    if (res.ok) {
      const updated: Task = await res.json();
      setTasks((prev) => prev.map((item) => (item.id === id ? updated : item)));
    }
  }

  function openTodo() {
    void trackEvent("todo_open_clicked", {
      path: "/",
      metadata: { from: "home" },
    });

    if (!userEmail) {
      window.location.href = "/api/auth";
      return;
    }

    setTab("todo");
    router.replace("/?tab=todo");
  }

  function openHome() {
    setTab("home");
    router.replace("/");
  }

  useEffect(() => {
    if (tab === "home") {
      void trackEvent("home_viewed", { path: "/" });
      return;
    }

    if (tab === "todo" && userEmail) {
      void trackEvent("todo_viewed", { path: "/?tab=todo" });
    }
  }, [tab, userEmail]);

  return (
    <main className="theme-shell min-h-screen text-white">
      <SiteHeader currentSection={tab} />
      {tab === "home" && <PageViewTracker page="home" path="/" />}
      {tab === "todo" && userEmail && (
        <PageViewTracker page="todo" path="/?tab=todo" />
      )}

      {tab === "home" && (
        <section className="mx-auto flex min-h-[calc(100vh-88px)] max-w-4xl items-center px-4 py-16">
          <div className="theme-panel w-full rounded-[2rem] p-8 sm:p-12">
            <div className="theme-pill mb-6 inline-flex rounded-full px-4 py-2 text-sm font-medium">
              About me
            </div>

            <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">
              Omar Hagaley
            </h1>

            <p className="mt-5 max-w-2xl text-2xl font-semibold leading-9 text-slate-100">
              I&apos;m a Computer Science student building projects that keep growing with me.
            </p>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              This website is my personal hub. It brings together some of the
              work I have done over the years, along with the tools and projects
              I keep building as the site grows with me.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
              I want this to be one place that reflects who I am, what I am
              building, and the projects I care about most.
            </p>

            <div className="mt-10 rounded-3xl border border-white/10 bg-black/20 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                Access
              </p>
              <p className="mt-3 text-lg leading-8 text-slate-300">
                Please login to access all features, including the private
                interview workspace and the todo area.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/api/auth"
                onClick={() =>
                  void trackEvent("login_cta_clicked", {
                    path: "/",
                    metadata: { section: "home_access" },
                  })
                }
                className="theme-button-primary rounded-full px-7 py-3 text-sm font-semibold transition"
              >
                Login
              </a>
              <button
                onClick={openTodo}
                className="theme-button-secondary rounded-full px-7 py-3 text-sm font-semibold transition"
              >
                Open Todo
              </button>
              <Link
                href={userEmail ? "/interview" : "/api/auth"}
                onClick={() =>
                  void trackEvent("interview_open_clicked", {
                    path: "/",
                    metadata: { authenticated: Boolean(userEmail) },
                  })
                }
                className="theme-button-secondary rounded-full px-7 py-3 text-sm font-semibold transition"
              >
                Open Interview
              </Link>
            </div>
          </div>
        </section>
      )}

      {tab === "todo" && userEmail && (
        <section className="mx-auto max-w-4xl px-4 py-8">
          <div className="theme-panel rounded-[2rem] p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">{userEmail}</p>
                <h2 className="text-3xl font-extrabold text-white">My To-Do Life</h2>
              </div>
              <button
                onClick={openHome}
                className="theme-button-secondary rounded-full px-4 py-2 text-sm font-medium transition"
              >
                Back Home
              </button>
            </div>

            <form
              onSubmit={addTask}
              className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_140px_140px_1fr_96px]"
            >
              <input
                className="theme-input rounded-xl px-4 py-3"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                type="date"
                className="theme-input rounded-xl px-4 py-3"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
              <select
                className="theme-input rounded-xl px-4 py-3"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="low">low</option>
                <option value="normal">normal</option>
                <option value="high">high</option>
              </select>
              <input
                className="theme-input rounded-xl px-4 py-3"
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <button className="theme-button-primary rounded-xl px-4 py-2 font-semibold transition">
                Add
              </button>
            </form>

            <div className="mb-4 flex flex-wrap gap-2">
              {(["all", "open", "done", "high"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    filter === item
                      ? "theme-button-primary"
                      : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {item}
                </button>
              ))}
              <div className="ml-auto text-sm text-slate-400">
                {loading ? "Loading..." : `${view.length} visible / ${tasks.length} total`}
              </div>
            </div>

            <div className="space-y-3">
              {view.map((task) => (
                <div
                  key={task.id}
                  className="theme-panel-soft flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-start md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => toggle(task.id)}
                        className={`h-6 w-6 rounded-md border ${
                          task.completed
                            ? "border-emerald-400 bg-emerald-500"
                            : "border-white/30 bg-transparent"
                        }`}
                        aria-label="Toggle complete"
                      />
                      <h3
                        className={`text-lg font-semibold ${
                          task.completed ? "text-white/45 line-through" : "text-white"
                        }`}
                      >
                        {task.title}
                      </h3>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs uppercase tracking-wide text-slate-300">
                        {task.priority}
                      </span>
                      {task.due && (
                        <span className="rounded-full bg-cyan-400/12 px-2 py-0.5 text-xs text-cyan-100">
                          Due {task.due}
                        </span>
                      )}
                    </div>

                    {task.notes && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">
                        {task.notes}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => edit(task.id)}
                    className="theme-button-secondary self-start rounded-xl px-3 py-2 text-sm font-medium transition"
                  >
                    Edit
                  </button>
                </div>
              ))}

              {!loading && view.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">
                  No tasks in this view yet.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {tab === "todo" && !userEmail && (
        <section className="mx-auto flex min-h-[calc(100vh-88px)] max-w-3xl items-center justify-center px-4 py-16">
          <div className="theme-panel rounded-[2rem] p-10 text-center">
            <h2 className="text-3xl font-black text-white">Login required</h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Sign in to access your database-backed todo list inside the main
              `nextprod` app.
            </p>
            <a
              href="/api/auth"
              className="theme-button-primary mt-8 inline-flex rounded-full px-6 py-3 text-sm font-semibold transition"
            >
              Continue to Login
            </a>
          </div>
        </section>
      )}
    </main>
  );
}
