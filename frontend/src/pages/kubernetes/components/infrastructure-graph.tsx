import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IconWorldWww,
  IconRoute,
  IconShieldLock,
  IconServer2,
  IconDatabase,
  IconBolt,
  IconStack2,
  IconBrandReact,
  IconCpu,
  IconArrowsMove,
  IconRefresh,
  type Icon,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/base/button";
import {
  serviceGraph,
  type ServiceKind,
  type ServiceNode,
  type ServiceStatus,
} from "@/data/service-graph";

const CANVAS_W = 1120;
const CANVAS_H = 640;
const NODE_W = 176;
const NODE_H = 88;

const KIND_ICON: Record<ServiceKind, Icon> = {
  ingress: IconWorldWww,
  proxy: IconRoute,
  auth: IconShieldLock,
  service: IconServer2,
  worker: IconCpu,
  database: IconDatabase,
  cache: IconBolt,
  queue: IconStack2,
  frontend: IconBrandReact,
};

const STATUS_STYLES: Record<
  ServiceStatus,
  { dot: string; ring: string; stroke: string; badge: string }
> = {
  healthy: {
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/40",
    stroke: "hsl(152 76% 45%)",
    badge: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    dot: "bg-amber-500",
    ring: "ring-amber-500/40",
    stroke: "hsl(38 92% 55%)",
    badge: "text-amber-600 dark:text-amber-400",
  },
  critical: {
    dot: "bg-red-500",
    ring: "ring-red-500/40",
    stroke: "hsl(0 84% 60%)",
    badge: "text-red-600 dark:text-red-400",
  },
  pending: {
    dot: "bg-sky-500",
    ring: "ring-sky-500/40",
    stroke: "hsl(210 90% 60%)",
    badge: "text-sky-600 dark:text-sky-400",
  },
};

function initialPositions(): Record<string, { x: number; y: number }> {
  return Object.fromEntries(
    serviceGraph.nodes.map((n) => [n.id, { x: n.x, y: n.y }]),
  );
}

interface InfrastructureGraphProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function InfrastructureGraph({
  selectedId,
  onSelect,
}: InfrastructureGraphProps) {
  const [positions, setPositions] = useState(initialPositions);
  const [dragId, setDragId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const nodesById = useMemo(
    () => Object.fromEntries(serviceGraph.nodes.map((n) => [n.id, n])),
    [],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      e.stopPropagation();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pos = positions[id];
      dragOffset.current = {
        x: e.clientX - rect.left - pos.x,
        y: e.clientY - rect.top - pos.y,
      };
      setDragId(id);
      onSelect(id);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [positions, onSelect],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragId) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nx = Math.max(
        4,
        Math.min(
          CANVAS_W - NODE_W - 4,
          e.clientX - rect.left - dragOffset.current.x,
        ),
      );
      const ny = Math.max(
        4,
        Math.min(
          CANVAS_H - NODE_H - 4,
          e.clientY - rect.top - dragOffset.current.y,
        ),
      );
      setPositions((prev) => ({ ...prev, [dragId]: { x: nx, y: ny } }));
    },
    [dragId],
  );

  const handlePointerUp = useCallback(() => setDragId(null), []);

  useEffect(() => {
    if (!dragId) return;
    const up = () => setDragId(null);
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [dragId]);

  const relatedIds = useMemo(() => {
    const active = hoverId ?? selectedId;
    if (!active) return null;
    const set = new Set<string>([active]);
    serviceGraph.edges.forEach((e) => {
      if (e.from === active) set.add(e.to);
      if (e.to === active) set.add(e.from);
    });
    return set;
  }, [hoverId, selectedId]);

  const activeEdge = hoverId ?? selectedId;

  return (
    <div className="relative">
      {/* keyframes for the animated flowing dashes */}
      <style>{`
        @keyframes lv-flow { to { stroke-dashoffset: -32; } }
        @keyframes lv-pulse-ring {
          0% { transform: scale(1); opacity: .55; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        .lv-edge { animation: lv-flow 1.4s linear infinite; }
        .lv-edge-slow { animation: lv-flow 3.2s linear infinite; }
      `}</style>

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <IconArrowsMove className="size-4" />
          Drag services to rearrange · click to inspect
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setPositions(initialPositions());
            onSelect(null);
          }}
          className="h-8"
        >
          <IconRefresh className="mr-1.5 size-3.5" />
          Reset layout
        </Button>
      </div>

      <div
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={() => onSelect(null)}
        className="relative overflow-hidden rounded-xl border border-border bg-[hsl(220_20%_98%)] dark:bg-[hsl(220_15%_9%)]"
        style={{
          height: CANVAS_H,
          backgroundImage:
            "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          touchAction: "none",
        }}
      >
        {/* Edges */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          preserveAspectRatio="none"
        >
          <defs>
            <marker
              id="lv-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
          </defs>
          {serviceGraph.edges.map((edge) => {
            const a = positions[edge.from];
            const b = positions[edge.to];
            if (!a || !b) return null;
            const x1 = a.x + NODE_W / 2;
            const y1 = a.y + NODE_H / 2;
            const x2 = b.x + NODE_W / 2;
            const y2 = b.y + NODE_H / 2;
            const dx = Math.abs(x2 - x1);
            const cx1 = x1 + dx * 0.4;
            const cx2 = x2 - dx * 0.4;
            const path = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
            const isActive =
              activeEdge &&
              (edge.from === activeEdge || edge.to === activeEdge);
            const targetStatus = nodesById[edge.to]?.status ?? "healthy";
            const stroke = STATUS_STYLES[targetStatus].stroke;
            return (
              <g
                key={edge.id}
                style={{ color: stroke }}
                opacity={
                  activeEdge === null ? 0.85 : isActive ? 1 : 0.18
                }
              >
                {/* base track */}
                <path
                  d={path}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity={0.22}
                  strokeWidth={2}
                />
                {/* animated dashed flow */}
                <path
                  d={path}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={isActive ? 2.5 : 1.75}
                  strokeDasharray="6 10"
                  strokeLinecap="round"
                  className={isActive ? "lv-edge" : "lv-edge-slow"}
                  markerEnd="url(#lv-arrow)"
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {serviceGraph.nodes.map((node) => {
          const pos = positions[node.id];
          const Icon = KIND_ICON[node.kind];
          const styles = STATUS_STYLES[node.status];
          const isSelected = selectedId === node.id;
          const isDimmed =
            relatedIds !== null && !relatedIds.has(node.id) && !isSelected;
          return (
            <div
              key={node.id}
              onPointerDown={(e) => handlePointerDown(e, node.id)}
              onMouseEnter={() => setHoverId(node.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(isSelected ? null : node.id);
              }}
              style={{
                left: pos.x,
                top: pos.y,
                width: NODE_W,
                height: NODE_H,
              }}
              className={cn(
                "absolute select-none rounded-xl border bg-background p-3 shadow-sm transition-all duration-200",
                "hover:shadow-lg",
                dragId === node.id
                  ? "cursor-grabbing scale-[1.03] shadow-xl border-primary"
                  : "cursor-grab",
                isSelected && "border-primary ring-2 ring-primary/30",
                !isSelected && "border-border",
                isDimmed && "opacity-40",
              )}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={cn(
                    "relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted",
                    styles.badge,
                  )}
                >
                  <Icon className="size-4" />
                  <span className="absolute -right-0.5 -top-0.5 flex size-2.5">
                    <span
                      className={cn(
                        "absolute inline-flex h-full w-full rounded-full",
                        styles.dot,
                      )}
                      style={{
                        animation:
                          node.status === "healthy"
                            ? undefined
                            : "lv-pulse-ring 1.6s ease-out infinite",
                      }}
                    />
                    <span
                      className={cn(
                        "relative inline-flex size-2.5 rounded-full ring-2 ring-background",
                        styles.dot,
                      )}
                    />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold leading-tight">
                    {node.label}
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[10.5px] text-muted-foreground">
                    {node.image}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10.5px] text-muted-foreground">
                <span className="font-mono uppercase tracking-wide">
                  {node.kind}
                </span>
                <span>
                  <span className="font-mono text-foreground">
                    {node.replicas}
                  </span>{" "}
                  replica{node.replicas > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        {(["healthy", "warning", "critical", "pending"] as ServiceStatus[]).map(
          (s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span
                className={cn("size-2 rounded-full", STATUS_STYLES[s].dot)}
              />
              <span className="capitalize">{s}</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export function ServiceInspector({
  nodeId,
  onClose,
}: {
  nodeId: string | null;
  onClose: () => void;
}) {
  const node: ServiceNode | undefined = nodeId
    ? serviceGraph.nodes.find((n) => n.id === nodeId)
    : undefined;

  if (!node) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-xs text-muted-foreground">
        Select a service on the graph to inspect its details, dependencies, and
        traffic.
      </div>
    );
  }

  const upstream = serviceGraph.edges
    .filter((e) => e.to === node.id)
    .map((e) => ({
      node: serviceGraph.nodes.find((n) => n.id === e.from)!,
      protocol: e.protocol,
    }));
  const downstream = serviceGraph.edges
    .filter((e) => e.from === node.id)
    .map((e) => ({
      node: serviceGraph.nodes.find((n) => n.id === e.to)!,
      protocol: e.protocol,
    }));

  const styles = STATUS_STYLES[node.status];
  const Icon = KIND_ICON[node.kind];

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-lg bg-muted",
              styles.badge,
            )}
          >
            <Icon className="size-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">{node.label}</div>
            <div className="font-mono text-[11px] text-muted-foreground">
              {node.image}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-[11px] text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
        <div>
          <dt className="text-muted-foreground">Status</dt>
          <dd className={cn("mt-0.5 font-medium capitalize", styles.badge)}>
            {node.status}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Replicas</dt>
          <dd className="mt-0.5 font-mono">{node.replicas}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Region</dt>
          <dd className="mt-0.5 font-mono">{node.region}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Kind</dt>
          <dd className="mt-0.5 font-mono uppercase">{node.kind}</dd>
        </div>
      </dl>

      {upstream.length > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Upstream ({upstream.length})
          </div>
          <ul className="space-y-1">
            {upstream.map((u) => (
              <li
                key={u.node.id}
                className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-2 py-1.5 text-[12px]"
              >
                <span>{u.node.label}</span>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  {u.protocol}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {downstream.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Downstream ({downstream.length})
          </div>
          <ul className="space-y-1">
            {downstream.map((d) => (
              <li
                key={d.node.id}
                className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-2 py-1.5 text-[12px]"
              >
                <span>{d.node.label}</span>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  {d.protocol}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
