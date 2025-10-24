"use client";

import { useState, useEffect, useMemo } from "react";

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

const STORAGE_KEY = "todos_v1";

export default function Home() {
  const [tab, setTab] = useState<"home" | "todo">("home");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"all" | "open" | "done" | "high">("all");
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setTasks(JSON.parse(raw));
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const view = useMemo(() => {
    if (filter === "open") return tasks.filter((t) => !t.completed);
    if (filter === "done") return tasks.filter((t) => t.completed);
    if (filter === "high") return tasks.filter((t) => t.priority === "high");
    return tasks;
  }, [tasks, filter]);

  function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const t: Task = {
      id: Date.now(),
      title: title.trim(),
      notes: notes.trim(),
      priority,
      due,
      completed: false,
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [t, ...prev]);
    setTitle(""); setNotes(""); setPriority("normal"); setDue("");
  }
  function del(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }
  function toggle(id: number) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }
  function edit(id: number) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    const newTitle = window.prompt("Edit title", t.title) ?? t.title;
    const newNotes = window.prompt("Edit notes", t.notes) ?? t.notes;
    setTasks((prev) => prev.map((x) => (x.id === id ? { ...x, title: newTitle.trim(), notes: newNotes.trim() } : x)));
  }

  const mainClasses =
    tab === "home" ? "min-h-screen bg-gray-100 text-black" : "min-h-screen bg-black text-white";

  return (
    <main className={mainClasses}>
      {/* Tabs */}
      <nav className="flex gap-4 p-4 border-b border-gray-300 dark:border-gray-700 justify-center sticky top-0 bg-transparent">
        <button
          onClick={() => setTab("home")}
          className={`px-4 py-2 rounded ${tab === "home" ? "bg-gray-300 text-black" : "bg-transparent"}`}
        >
          Home
        </button>
        <button
          onClick={() => setTab("todo")}
          className={`px-4 py-2 rounded ${tab === "todo" ? "bg-gray-800 text-white" : "bg-transparent"}`}
        >
          Todo
        </button>
      </nav>

      {/* Home (white) */}
      {tab === "home" && (
        <section className="flex flex-col items-center justify-center h-[80vh]">
          <h1 className="text-4xl font-bold mb-4">Omar Hagaley</h1>
          <p className="text-lg">
            This website is <strong>deployed with Vercel 🚀</strong>
          </p>
        </section>
      )}

      {/* Todo (black) */}
      {tab === "todo" && (
        <section className="max-w-3xl mx-auto p-4 md:p-8">
          <h1 className="text-3xl font-bold mb-4">My To-Do Life</h1>

          <form
            onSubmit={addTask}
            className="grid grid-cols-1 md:grid-cols-[1fr_140px_120px_1fr_100px] gap-2 mb-4"
          >
            <input
              className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="date"
              className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
            <select
              className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="low">low</option>
              <option value="normal">normal</option>
              <option value="high">high</option>
            </select>
            <input
              className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:border-blue-500">
              Add
            </button>
          </form>

          <div className="flex gap-2 mb-4">
            {(["all", "open", "done", "high"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg border ${filter === f ? "border-blue-500" : "border-gray-700"}`}
              >
                {f === "all" ? "All" : f === "open" ? "Open" : f === "done" ? "Completed" : "High Priority"}
              </button>
            ))}
          </div>

          <ul className="grid gap-2 p-0 m-0 list-none">
            {view.map((t: Task) => (
              <li
                key={t.id}
                className={`bg-gray-800 border border-gray-700 rounded-xl p-3 ${t.completed ? "opacity-70" : ""}`}
              >
                <div className="grid grid-cols-[28px_1fr_auto_auto_auto] gap-2 items-center">
                  <input type="checkbox" checked={t.completed} onChange={() => toggle(t.id)} />
                  <span className="font-semibold">{t.title}</span>
                  <span className="text-xs text-gray-400">
                    {t.priority.toUpperCase()} {t.due ? `• due ${t.due}` : ""}
                  </span>
                  <button className="underline text-sm" onClick={() => edit(t.id)}>Edit</button>
                  <button className="underline text-sm" onClick={() => del(t.id)}>Delete</button>
                </div>
                {t.notes ? <div className="mt-1 text-gray-300">{t.notes}</div> : null}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
