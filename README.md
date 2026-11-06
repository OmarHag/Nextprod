# Omar's Workbench

An interactive portfolio presented as Omar Hagaley's desk. Each object opens a real project, experiment, or piece of research; schematic mode reveals the engineering layer underneath.

## What is on the desk

- **Internet X-Ray** — local-first macOS network-connection inspector. Work in progress.
- **SuperDrop** — local-network device discovery prototype. Work in progress.
- **Faultline** — browser-based distributed-systems failure simulation.
- **ExplainMyCode** — UW capstone for structured, audience-aware code explanations.
- **Research notes** — the documented distributed-systems result showing a 20% processing-time reduction.

The project descriptions intentionally distinguish finished behavior from planned work.

## Interaction

- Select any desk object to open its project story, technical decisions, stack, and repository link.
- Toggle **schematic mode** to switch from the physical desk to a systems-oriented blueprint view.
- The layout becomes a readable project grid on tablets and phones.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Verify

```bash
npm run build
```

## Stack

Next.js 15, React 19, TypeScript, CSS, and Lucide icons.
