"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowDown, ArrowRight, Boxes, Braces, ChevronDown, CircleStop, Cpu, Github, LockKeyhole, Play, Radio, RotateCcw, ServerCrash, ShieldCheck, Sparkles, Terminal, Zap } from "lucide-react";

type WorkerStatus = "healthy" | "recovering" | "offline";
type Worker = { id: string; region: string; status: WorkerStatus; load: number; processed: number };
type EventItem = { id: number; tone: "info" | "warn" | "good"; text: string };
type VisitTrace = { dns: number; connection: number; secure: number; server: number; download: number; dom: number; total: number; transfer: number; resources: number; resourceBytes: number; protocol: string; navigation: string };
type ExperimentResult = { baseline: number; injected: number; recovery: number };

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
  const [visit, setVisit] = useState<VisitTrace | null>(null);
  const [showTrace, setShowTrace] = useState(false);
  const [experiment, setExperiment] = useState<"idle" | "baseline" | "delay" | "retry" | "done">("idle");
  const [experimentResult, setExperimentResult] = useState<ExperimentResult | null>(null);
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

  useEffect(() => {
    const readTrace = () => {
      const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (!entry) return;
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      setVisit({
        dns: Math.max(0, entry.domainLookupEnd - entry.domainLookupStart),
        connection: Math.max(0, entry.connectEnd - entry.connectStart),
        secure: entry.secureConnectionStart > 0 ? Math.max(0, entry.connectEnd - entry.secureConnectionStart) : 0,
        server: Math.max(0, entry.responseStart - entry.requestStart),
        download: Math.max(0, entry.responseEnd - entry.responseStart),
        dom: Math.max(0, entry.domInteractive - entry.responseEnd),
        total: Math.max(0, entry.loadEventEnd || entry.domComplete),
        transfer: entry.transferSize,
        resources: resources.length,
        resourceBytes: resources.reduce((sum, resource) => sum + resource.transferSize, 0),
        protocol: entry.nextHopProtocol || "not exposed",
        navigation: entry.type,
      });
    };
    if (document.readyState === "complete") readTrace();
    else window.addEventListener("load", readTrace, { once: true });
    return () => window.removeEventListener("load", readTrace);
  }, []);

  const runResilienceTest = async () => {
    if (experiment !== "idle" && experiment !== "done") return;
    setExperimentResult(null);
    setExperiment("baseline");
    const probe = async (label: string) => {
      const start = performance.now();
      await fetch(`/favicon.ico?probe=${label}-${Date.now()}`, { cache: "no-store" });
      return performance.now() - start;
    };
    try {
      const baseline = await probe("baseline");
      setExperiment("delay");
      const injected = 650;
      await new Promise((resolve) => window.setTimeout(resolve, injected));
      setExperiment("retry");
      const recovery = await probe("retry");
      setExperimentResult({ baseline, injected, recovery });
      setExperiment("done");
    } catch {
      setExperiment("idle");
    }
  };

  const traceJson = visit ? JSON.stringify({
    source: "PerformanceNavigationTiming",
    navigationType: visit.navigation,
    protocol: visit.protocol,
    milliseconds: { dns: visit.dns, tcp: visit.connection, tls: visit.secure, server: visit.server, download: visit.download, dom: visit.dom, total: visit.total },
    transferBytes: visit.transfer,
    resourceCount: visit.resources,
    resourceTransferBytes: visit.resourceBytes,
  }, null, 2) : "Waiting for the browser timing record…";

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
        <a className="wordmark" href="#top"><span className="wordmark-mark"><Radio size={17} /></span>OMARH.DEV<em>LIVE</em></a>
        <div className="nav-status"><span className="pulse-dot" /> measuring this visit</div>
        <a className="github-link" href="https://github.com/OmarHag/Nextprod" target="_blank" rel="noreferrer"><Github size={16} /> source</a>
      </nav>

      <section className="journey-hero" id="top">
        <div className="journey-kicker"><span>01</span> YOUR VISIT / MEASURED LIVE</div>
        <h1>You crossed the internet<br />to get here.</h1>
        <p className="journey-intro">This page is reading its own arrival receipt. No tracking script, no made-up speed test—just timing data your browser recorded while loading <strong>omarh.dev</strong>.</p>
        <div className="arrival-readout">
          <div className="arrival-number"><span>{visit ? Math.round(visit.total) : "—"}</span><small>milliseconds to arrive</small></div>
          <div className="arrival-route" aria-label="The measured stages of this page load">
            <TraceStage label="find" value={visit?.dns} detail="DNS" />
            <i />
            <TraceStage label="secure" value={visit?.secure} detail="TLS" />
            <i />
            <TraceStage label="respond" value={visit?.server} detail="SERVER" />
            <i />
            <TraceStage label="receive" value={visit?.download} detail="PAGE" />
          </div>
        </div>
        <div className="journey-note"><LockKeyhole size={14} /> Measured in your browser. Nothing here is saved.</div>
        <button className="journey-next" onClick={() => setShowTrace((value) => !value)} aria-expanded={showTrace}>Open the engineer trace <ChevronDown className={showTrace ? "turned" : ""} size={16} /></button>
      </section>

      <section className={`trace-deck ${showTrace ? "open" : ""}`} aria-hidden={!showTrace}>
        <div className="section-label"><span>02</span> UNDER THE HOOD / REAL VALUES</div>
        <div className="trace-heading"><div><h2>Your browser kept the receipts.</h2><p>The friendly story above and the technical view below use the same navigation record. Zero means the browser reused a connection, served a cache, or withheld that measurement.</p></div><div className="truth-key"><span><i className="measured" /> measured</span><span><i className="simulated" /> simulated</span></div></div>
        <div className="waterfall-card">
          <div className="waterfall-head"><span>navigation waterfall</span><span>{visit?.protocol ?? "measuring protocol"} / {visit?.navigation ?? "navigation"}</span></div>
          <div className="waterfall-list">
            <WaterfallRow label="DNS lookup" value={visit?.dns} max={visit?.total} />
            <WaterfallRow label="TCP connection" value={visit?.connection} max={visit?.total} />
            <WaterfallRow label="TLS negotiation" value={visit?.secure} max={visit?.total} />
            <WaterfallRow label="server → first byte" value={visit?.server} max={visit?.total} />
            <WaterfallRow label="document transfer" value={visit?.download} max={visit?.total} />
            <WaterfallRow label="DOM construction" value={visit?.dom} max={visit?.total} />
          </div>
          <div className="trace-facts">
            <TraceFact label="navigation bytes" value={formatBytes(visit?.transfer)} />
            <TraceFact label="loaded resources" value={visit ? String(visit.resources) : "—"} />
            <TraceFact label="resource bytes" value={formatBytes(visit?.resourceBytes)} />
            <TraceFact label="source" value="browser API" />
          </div>
        </div>

        <div className="trace-lower">
          <div className="experiment-card">
            <div className="experiment-top"><div><span className="card-kicker">CONTROLLED EXPERIMENT</span><h3>Make a fast request feel slow.</h3></div><Zap size={22} /></div>
            <p>Run a real same-origin request, inject a clearly labeled 650 ms application delay, then retry. It demonstrates why latency budgets and recovery behavior matter without pretending to alter your network.</p>
            <div className="experiment-track">
              <ExperimentStep label="baseline" value={experimentResult ? `${Math.round(experimentResult.baseline)} ms` : "real request"} active={experiment === "baseline"} done={experiment !== "idle" && experiment !== "baseline"} />
              <ExperimentStep label="delay" value="+650 ms" active={experiment === "delay"} done={experiment === "retry" || experiment === "done"} simulated />
              <ExperimentStep label="retry" value={experimentResult ? `${Math.round(experimentResult.recovery)} ms` : "real request"} active={experiment === "retry"} done={experiment === "done"} />
            </div>
            <button onClick={runResilienceTest} disabled={experiment !== "idle" && experiment !== "done"}>{experiment === "idle" ? "run the experiment" : experiment === "done" ? "run it again" : "experiment running…"}<ArrowRight size={16} /></button>
          </div>
          <div className="raw-card"><div className="raw-head"><span><Braces size={15} /> raw trace</span><em>not uploaded</em></div><pre>{traceJson}</pre></div>
        </div>
        <a className="journey-next trace-next" href="#faultline">Continue into Faultline <ArrowDown size={16} /></a>
      </section>

      <section className="hero" id="faultline">
        <div className="hero-copy">
          <div className="eyebrow"><span>03</span><Terminal size={14} /> distributed systems, without the whiteboard</div>
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
      <footer><span>REAL TIMINGS + LABELED SIMULATIONS / NO VISITOR DATA STORED</span><span>designed and built by <a href="https://github.com/OmarHag">Omar Hagaley</a></span></footer>
    </main>
  );
}

function Metric({ label, value, detail, warning = false }: { label: string; value: string; detail: string; warning?: boolean }) {
  return <div className={`metric ${warning ? "warning" : ""}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}
function PanelHeader({ icon, title, meta }: { icon: React.ReactNode; title: string; meta: string }) {
  return <div className="panel-head"><span>{icon}{title}</span><em>{meta}</em></div>;
}
function TraceStage({ label, value, detail }: { label: string; value?: number; detail: string }) {
  return <div className="trace-stage"><small>{detail}</small><strong>{label}</strong><span>{value === undefined ? "measuring" : `${Math.round(value)} ms`}</span></div>;
}
function WaterfallRow({ label, value, max }: { label: string; value?: number; max?: number }) {
  const width = value === undefined || max === undefined ? 0 : Math.max(value > 0 ? 2 : 0, Math.min(100, (value / Math.max(max, 1)) * 100));
  return <div className="waterfall-row"><span>{label}</span><div><i style={{ width: `${width}%` }} /></div><b>{value === undefined ? "—" : `${Math.round(value)} ms`}</b></div>;
}
function TraceFact({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}
function ExperimentStep({ label, value, active, done, simulated = false }: { label: string; value: string; active: boolean; done: boolean; simulated?: boolean }) {
  return <div className={`experiment-step ${active ? "active" : ""} ${done ? "done" : ""} ${simulated ? "simulated" : ""}`}><i /><span>{label}</span><strong>{value}</strong></div>;
}
function formatBytes(value?: number) {
  if (value === undefined) return "—";
  if (value === 0) return "cached";
  if (value < 1024) return `${value} B`;
  return `${(value / 1024).toFixed(1)} KB`;
}
