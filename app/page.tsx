"use client";

import { ArrowUpRight, CircuitBoard, Coffee, ExternalLink, FileCode2, Github, Laptop, Linkedin, Mail, MonitorUp, NotebookTabs, ServerCrash, X } from "lucide-react";
import { useState } from "react";

type Project = {
  id: string;
  name: string;
  kind: string;
  status?: string;
  hook: string;
  description: string;
  detail: string;
  tech: string[];
  href?: string;
};

const projects: Project[] = [
  { id: "xray", name: "Internet X-Ray", kind: "network inspector", status: "work in progress", hook: "See what your Mac is actually talking to.", description: "A local-first macOS app that connects active sockets to the processes behind them, then separates Internet, LAN, local, and listening traffic.", detail: "Rust collects machine-readable lsof output and returns typed snapshots across a narrow Tauri boundary. The React interface handles polling, filtering, and sorting without a cloud backend.", tech: ["Rust", "Tauri", "React", "TypeScript"], href: "https://github.com/OmarHag/internet-x-ray" },
  { id: "drop", name: "SuperDrop", kind: "nearby discovery", status: "work in progress", hook: "Find nearby computers without accounts or cloud storage.", description: "A cross-platform desktop prototype that discovers other SuperDrop devices on the same local network.", detail: "Rust owns mDNS advertisement and discovery, validates versioned device metadata, and exposes a small read-only command boundary to the interface. File transfer is still the next milestone.", tech: ["Rust", "Tauri", "mDNS", "React"], href: "https://github.com/OmarHag/SuperDrop" },
  { id: "fault", name: "Faultline", kind: "failure lab", hook: "A distributed system you are supposed to break.", description: "An interactive browser simulation for queues, workers, retries, backpressure, replication, and recovery.", detail: "Traffic bursts increase queue pressure. Worker failures reroute work, trigger retries, recover from replicated state, and expose the relationship between availability and latency.", tech: ["Next.js", "React", "TypeScript"], href: "https://github.com/OmarHag/Nextprod" },
  { id: "code", name: "ExplainMyCode", kind: "UW capstone", hook: "Code explanations that meet the reader where they are.", description: "A tool that shapes source-code explanations around a reader's experience level and chosen focus.", detail: "The backend applies input limits, detects language, requests schema-shaped model output, persists explanations in PostgreSQL, and manages password-based accounts with server-side sessions.", tech: ["Next.js", "PostgreSQL", "Applied AI"], href: "https://github.com/OmarHag/explainmycode" },
  { id: "research", name: "Distributed Systems Research", kind: "research notes", hook: "Measure the slow part before changing the system.", description: "My documented distributed-systems research recorded a 20% reduction in processing time.", detail: "That result pushed me toward the engineering work I enjoy most: finding a bottleneck, measuring the real behavior, and making the system easier to reason about.", tech: ["Distributed Systems", "Performance", "Research"] },
];

export default function Home() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [schematic, setSchematic] = useState(false);
  const active = projects.find((project) => project.id === activeId) ?? null;

  return (
    <main className={`workbench-page ${schematic ? "schematic-mode" : ""}`}>
      <header className="bench-nav">
        <a className="bench-name" href="#top">OMAR HAGALEY <span>/ WORKBENCH</span></a>
        <p>CS graduate · systems builder · Washington</p>
        <div className="bench-actions">
          <button className="schematic-toggle" onClick={() => setSchematic((value) => !value)} aria-pressed={schematic}><CircuitBoard size={15} /> {schematic ? "close schematic" : "schematic mode"}</button>
          <a href="https://github.com/OmarHag" aria-label="GitHub"><Github size={17} /></a><a href="mailto:omarhag396@gmail.com" aria-label="Email"><Mail size={17} /></a>
        </div>
      </header>

      <section className="bench-intro" id="top">
        <p className="bench-eyebrow">WELCOME TO MY DESK</p>
        <h1>I build things that make invisible systems easier to see.</h1>
        <p>Pick something up. Every object is a real project, experiment, or piece of research.</p>
      </section>

      <section className="desk" aria-label="Omar's interactive project workbench">
        <div className="desk-grain" />
        <DeskObject project={projects[0]} className="xray-object" onOpen={setActiveId}><span className="object-art monitor-art"><MonitorUp size={48} /><i /><i /><i /></span></DeskObject>
        <DeskObject project={projects[1]} className="drop-object" onOpen={setActiveId}><span className="object-art laptops-art"><Laptop size={42} /><b>···</b><Laptop size={42} /></span></DeskObject>
        <DeskObject project={projects[2]} className="fault-object" onOpen={setActiveId}><span className="object-art server-art"><ServerCrash size={50} /></span></DeskObject>
        <DeskObject project={projects[3]} className="code-object" onOpen={setActiveId}><span className="object-art paper-art"><FileCode2 size={46} /></span></DeskObject>
        <DeskObject project={projects[4]} className="research-object" onOpen={setActiveId}><span className="object-art notebook-art"><NotebookTabs size={45} /><b>20%</b></span></DeskObject>
        <div className="coffee-object" aria-hidden="true"><Coffee size={58} /><span>still warm</span></div>
        <div className="schematic-lines" aria-hidden="true"><i /><i /><i /><i /></div>
        <p className="desk-instruction">click an object to look closer ↗</p>
      </section>

      <section className="bench-footer">
        <div><span>ABOUT THE PERSON AT THE DESK</span><p>I'm a University of Washington Computer Science & Software Engineering graduate interested in backend systems, cloud infrastructure, and applied AI.</p></div>
        <div className="footer-links"><a href="https://www.linkedin.com/in/omar-hagaley-b46a04293"><Linkedin size={16} /> LinkedIn</a><a href="mailto:omarhag396@gmail.com"><Mail size={16} /> Email me</a></div>
      </section>

      {active && <div className="drawer-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveId(null); }}>
        <aside className="object-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
          <div className="drawer-top"><span>{String(projects.indexOf(active) + 1).padStart(2, "0")} / {active.kind}</span><button onClick={() => setActiveId(null)} aria-label="Close project"><X size={20} /></button></div>
          {active.status && <p className="drawer-status">● {active.status}</p>}
          <h2 id="drawer-title">{active.name}</h2>
          <h3>{active.hook}</h3>
          <p>{active.description}</p>
          <div className="drawer-detail"><span>LOOK INSIDE</span><p>{active.detail}</p></div>
          <div className="tech-list">{active.tech.map((item) => <span key={item}>{item}</span>)}</div>
          {active.href && <a className="project-link" href={active.href} target="_blank" rel="noreferrer">open the repository <ExternalLink size={16} /></a>}
        </aside>
      </div>}
    </main>
  );
}

function DeskObject({ project, className, onOpen, children }: { project: Project; className: string; onOpen: (id: string) => void; children: React.ReactNode }) {
  return <button className={`desk-object ${className}`} onClick={() => onOpen(project.id)} aria-label={`Open ${project.name}`}><span className="object-number">{String(projects.indexOf(project) + 1).padStart(2, "0")}</span>{children}<strong>{project.name}</strong><small>{project.kind}{project.status ? " · in progress" : ""}</small><span className="object-open">open <ArrowUpRight size={11} /></span></button>;
}
