import { cluster } from "@/data/kubernetes";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClusterTopologyProps {
  selectedNode: string | null;
  onSelectNode: (name: string | null) => void;
}

function nodeFill(status: string) {
  switch (status) {
    case "healthy":
      return "bg-green-500";
    case "warning":
      return "bg-amber-500";
    case "critical":
      return "bg-red-500";
    case "pending":
      return "bg-blue-500";
    default:
      return "bg-muted-foreground";
  }
}

function nodeRing(status: string) {
  switch (status) {
    case "healthy":
      return "ring-green-500/30";
    case "warning":
      return "ring-amber-500/30";
    case "critical":
      return "ring-red-500/30";
    case "pending":
      return "ring-blue-500/30";
    default:
      return "ring-border";
  }
}

export function ClusterTopology({
  selectedNode,
  onSelectNode,
}: ClusterTopologyProps) {
  const nodes = cluster.nodes;
  const controlPlane = nodes.filter((n) => n.role === "control-plane");
  const workers = nodes.filter((n) => n.role === "worker");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Cluster topology</CardTitle>
        <p className="text-xs text-muted-foreground">
          Click a node to filter pods by that host. Click again to clear.
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative min-h-[200px] overflow-hidden rounded-lg border border-border bg-muted/30 p-4">
          {/* Control plane row */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Control plane
            </span>
            <div className="flex flex-wrap justify-center gap-4">
              {controlPlane.map((node) => (
                <button
                  key={node.id}
                  onClick={() =>
                    onSelectNode(selectedNode === node.name ? null : node.name)
                  }
                  className={cn(
                    "group flex w-36 flex-col items-center gap-2 rounded-lg border border-border bg-background p-3 shadow-sm transition-all hover:shadow-md",
                    selectedNode === node.name && "ring-2 ring-primary",
                  )}
                >
                  <div
                    className={cn(
                      "relative flex size-8 items-center justify-center rounded-full ring-4 ring-offset-2 ring-offset-background",
                      nodeRing(node.status),
                    )}
                  >
                    <div className={cn("size-2.5 rounded-full", nodeFill(node.status))} />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{node.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {node.cpu.used.toFixed(1)} / {node.cpu.total} CPU
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Connector line */}
          <div className="absolute left-1/2 top-16 h-8 w-px -translate-x-1/2 bg-border" />

          {/* Worker row */}
          <div className="flex flex-col items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Workers
            </span>
            <div className="flex flex-wrap justify-center gap-4">
              {workers.map((node) => (
                <button
                  key={node.id}
                  onClick={() =>
                    onSelectNode(selectedNode === node.name ? null : node.name)
                  }
                  className={cn(
                    "group flex w-36 flex-col items-center gap-2 rounded-lg border border-border bg-background p-3 shadow-sm transition-all hover:shadow-md",
                    selectedNode === node.name && "ring-2 ring-primary",
                  )}
                >
                  <div
                    className={cn(
                      "relative flex size-8 items-center justify-center rounded-full ring-4 ring-offset-2 ring-offset-background",
                      nodeRing(node.status),
                    )}
                  >
                    <div className={cn("size-2.5 rounded-full", nodeFill(node.status))} />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{node.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {node.podCount} pods
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {node.memory.used.toFixed(1)} / {node.memory.total} GiB
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pod dots scattered between workers */}
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {cluster.pods.slice(0, 12).map((pod) => (
              <div
                key={pod.id}
                title={`${pod.name} on ${pod.node}`}
                className={cn("size-2 rounded-full", nodeFill(pod.status))}
              />
            ))}
            {cluster.pods.length > 12 && (
              <span className="ml-1 text-[11px] text-muted-foreground">
                +{cluster.pods.length - 12}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
