"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowRight, Boxes, CircleStop, Cpu, Github, Play, RotateCcw, ServerCrash, ShieldCheck, Sparkles, Terminal, Zap } from "lucide-react";

type WorkerStatus = "healthy" | "recovering" | "offline";
type Worker = { id: string; region: string; status: WorkerStatus; load: number; processed: number };
type EventItem = { id: number; tone: "info" | "warn" | "good"; text: string };

const initialWorkers: Worker[] = [
  { id: "edge-01", region: "us-west", status: "healthy", load: 18, processed: 1240 },
  { id: "edge-02", region: "us-east", status: "healthy", load: 31, processed: 982 },
  { id: "edge-03", region: "eu-west", status: "healthy", load: 24, processed: 1106 },
];
const initialEvents: EventItem[] = [
  { id: 3, tone: "good", text: "All workers passed health checks" },
  { id: 2, tone: "info", text: "Replication factor set to 2" },
  { id: 1, tone: "info", text: "Cluster initialized in simulation mode" },
];

export default function Home() {
  const [running, setRunning] = useState(true);
  const [workers, setWorkers] = useState(initialWorkers);
  const [queue, setQueue] = useState(7);
  const [completed, setCompleted] = useState(3328);
  const [retries, setRetries] = useState(3);
  const [latency, setLatency] = useState(42);
  const [events, setEvents] = useState(initialEvents);
  const eventId = useRef(4);
  const tick = useRef(0);
  const healthyCount = workers.filter((worker) => worker.status === "healthy").length;
  const availability = healthyCount === 3 ? "99.99" : healthyCount === 2 ? "99.72" : "97.10";

  const pushEvent = (text: string, tone: EventItem["tone"] = "info") => {
    setEvents((current) => [{ id: eventId.current++, text, tone }, ...current.slice(0, 5)]);
  };

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      tick.current += 1;
      const phase = tick.current;
      setWorkers((current) => {
        const healthy = current.filter((worker) => worker.status === "healthy").length;
        const throughput = Math.max(1, healthy * 2);
        setQueue((value) => Math.max(0, value + (phase % 4 === 0 ? 4 : 1) - throughput));
        setCompleted((value) => value + throughput);
        setLatency(healthy === 3 ? 38 + (phase % 9) : 73 + (phase % 18));
        return current.map((worker, index) => worker.status === "healthy" ? {
          ...worker,
          load: 18 + ((phase * 11 + index * 19) % 58),
          processed: worker.processed + 2,
        } : worker);
      });
      if (phase % 8 === 0) pushEvent(`Batch ${String(phase / 8).padStart(2, "0")} committed across replicas`, "good");
    }, 900);
    return () => window.clearInterval(timer);
  }, [running]);

  const injectFailure = () => {
    const target = workers.find((worker) => worker.status === "healthy");
    if (!target || healthyCount <= 1) return;
    setWorkers((current) => current.map((worker) => worker.id === target.id ? { ...worker, status: "offline", load: 0 } : worker));
    setRetries((value) => value + 4);
    setQueue((value) => value + 9);
    pushEvent(`${target.id} stopped responding — traffic rerouted`, "warn");
    window.setTimeout(() => {
      setWorkers((current) => current.map((worker) => worker.id === target.id ? { ...worker, status: "recovering", load: 8 } : worker));
      pushEvent(`${target.id} rejoining from replicated state`);
    }, 3200);
    window.setTimeout(() => {
      setWorkers((current) => current.map((worker) => worker.id === target.id ? { ...worker, status: "healthy", load: 22 } : worker));
      pushEvent(`${target.id} recovered — cluster fully healthy`, "good");
    }, 5900);
  };

  const sendBurst = () => {
    setQueue((value) => value + 24);
    setLatency((value) => value + 31);
    pushEvent("Traffic burst received — backpressure enabled", "warn");
  };

  const reset = () => {
    setRunning(true); setWorkers(initialWorkers); setQueue(7); setCompleted(3328);
    setRetries(3); setLatency(42); setEvents(initialEvents); tick.current = 0;
  };
  const queueBars = useMemo(() => Array.from({ length: 18 }, (_, index) => index < Math.min(queue, 18)), [queue]);

  return (
    <main className="lab-shell">
      <div className="noise" />
      <nav className="nav-wrap">
        <a className="wordmark" href="#top"><span className="wordmark-mark"><Boxes size={17} /></span>FAULTLINE<em>LAB</em></a>
        <div className="nav-status"><span className="pulse-dot" /> simulation online</div>
        <a className="github-link" href="https://github.com/OmarHag/Nextprod" target="_blank" rel="noreferrer"><Github size={16} /> source</a>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><Terminal size={14} /> distributed systems, without the whiteboard</div>
          <h1>Break the cluster.<br /><span>Watch it recover.</span></h1>
          <p>A hands-on failure lab for queues, workers, retries, and replication. Everything below is a live simulation running in your browser.</p>
          <div className="hero-actions">
            <button className="primary-action" onClick={injectFailure} disabled={healthyCount <= 1}><ServerCrash size={18} /> inject failure</button>
            <button className="secondary-action" onClick={sendBurst}><Zap size={18} /> send traffic burst</button>
          </div>
        </div>
        <div className="system-card">
          <div className="system-card-head"><span>cluster topology</span><span className="mono">RF=2 / QUORUM=2</span></div>
          <div className="topology">
            <div className="client-node"><Sparkles size={17} /><span>requests</span></div>
            <div className="route-line"><i /><i /><i /></div>
            <div className="queue-node"><span>{queue}</span><small>queued</small></div>
            <ArrowRight className="topology-arrow" size={20} />
            <div className="worker-stack">{workers.map((worker) => <div className={`mini-worker ${worker.status}`} key={worker.id}><span /><b>{worker.id}</b><small>{worker.status}</small></div>)}</div>
          </div>
          <div className="system-card-foot"><span><ShieldCheck size={14} /> replicated state</span><span>{healthyCount}/3 nodes available</span></div>
        </div>
      </section>

      <section className="metrics-strip" aria-label="Cluster metrics">
        <Metric label="availability" value={`${availability}%`} detail="rolling window" />
        <Metric label="p95 latency" value={`${latency}ms`} detail={latency > 70 ? "degraded" : "within target"} warning={latency > 70} />
        <Metric label="completed" value={completed.toLocaleString()} detail="jobs committed" />
        <Metric label="retries" value={String(retries)} detail="idempotent replay" />
      </section>

      <section className="lab-grid">
        <div className="panel workers-panel">
          <PanelHeader icon={<Cpu size={17} />} title="worker pool" meta={`${healthyCount} healthy`} />
          <div className="worker-list">{workers.map((worker) => <article className={`worker-row ${worker.status}`} key={worker.id}>
            <div className="worker-name"><span className="status-light" /><div><strong>{worker.id}</strong><small>{worker.region}</small></div></div>
            <div className="load-cell"><div><span>cpu load</span><b>{worker.load}%</b></div><div className="load-track"><i style={{ width: `${worker.load}%` }} /></div></div>
            <div className="processed-cell"><b>{worker.processed.toLocaleString()}</b><span>processed</span></div><span className="state-label">{worker.status}</span>
          </article>)}</div>
        </div>
        <div className="panel queue-panel"><PanelHeader icon={<Activity size={17} />} title="queue pressure" meta={`${queue} pending`} />
          <div className="queue-chart">{queueBars.map((active, index) => <i className={active ? "active" : ""} key={index} />)}</div>
          <div className="queue-legend"><span>empty</span><span>backpressure threshold</span></div>
          <button className="burst-button" onClick={sendBurst}><Zap size={15} /> add 24 jobs</button>
        </div>
        <div className="panel event-panel"><PanelHeader icon={<Terminal size={17} />} title="event stream" meta="live" />
          <div className="event-list">{events.map((event) => <div className={`event ${event.tone}`} key={event.id}><span>{String(event.id).padStart(3, "0")}</span><i /><p>{event.text}</p></div>)}</div>
        </div>
        <div className="panel control-panel"><PanelHeader icon={<Boxes size={17} />} title="simulation control" meta={running ? "running" : "paused"} />
          <div className="control-copy"><strong>Failure is a feature.</strong><p>Pause the clock, overload the queue, or remove a worker. The cluster keeps its promises through replication and retry.</p></div>
          <div className="control-actions"><button onClick={() => setRunning((value) => !value)}>{running ? <CircleStop size={16} /> : <Play size={16} />}{running ? "pause" : "resume"}</button><button onClick={reset}><RotateCcw size={16} /> reset</button></div>
        </div>
      </section>
      <footer><span>FAULTLINE / browser-based systems lab</span><span>designed and built by <a href="https://github.com/OmarHag">Omar Hagaley</a></span></footer>
    </main>
  );
}

function Metric({ label, value, detail, warning = false }: { label: string; value: string; detail: string; warning?: boolean }) {
  return <div className={`metric ${warning ? "warning" : ""}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}
function PanelHeader({ icon, title, meta }: { icon: React.ReactNode; title: string; meta: string }) {
  return <div className="panel-head"><span>{icon}{title}</span><em>{meta}</em></div>;
}
