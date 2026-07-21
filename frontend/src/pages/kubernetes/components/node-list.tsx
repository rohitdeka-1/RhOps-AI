import { IconServer, IconAlertTriangle } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/base/badge";
import { cn } from "@/lib/utils";
import { cluster, type K8sNode } from "@/data/kubernetes";

interface NodeListProps {
  selectedNode: string | null;
  onSelectNode: (name: string | null) => void;
}

function statusColor(node: K8sNode) {
  switch (node.status) {
    case "healthy":
      return "green";
    case "warning":
      return "amber";
    case "critical":
      return "red";
    case "pending":
      return "blue";
  }
}

function StatusDot({ status }: { status: K8sNode["status"] }) {
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full",
        status === "healthy" && "bg-green-500",
        status === "warning" && "bg-amber-500",
        status === "critical" && "bg-red-500",
        status === "pending" && "bg-blue-500",
      )}
    />
  );
}

export function NodeList({ selectedNode, onSelectNode }: NodeListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Nodes</CardTitle>
          <Badge color="gray" className="text-xs">
            {cluster.nodes.length} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {cluster.nodes.map((node) => {
          const cpuPct = Math.round((node.cpu.used / node.cpu.total) * 100);
          const memPct = Math.round((node.memory.used / node.memory.total) * 100);
          const hasPressure = node.conditions.some(
            (c) => c.type === "MemoryPressure" && c.status === "true",
          );

          return (
            <button
              key={node.id}
              onClick={() =>
                onSelectNode(selectedNode === node.name ? null : node.name)
              }
              className={cn(
                "flex w-full flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3 text-left transition-colors hover:bg-muted/50",
                selectedNode === node.name && "ring-2 ring-primary bg-muted/50",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-md border border-border bg-background">
                    <IconServer className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium">{node.name}</span>
                      <Badge color={statusColor(node)} className="text-[10px] px-1.5 py-0">
                        {node.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {node.role} · {node.zone} · {node.podCount} / {node.podCapacity} pods
                    </div>
                  </div>
                </div>
                <StatusDot status={node.status} />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">CPU</span>
                    <span className="font-medium">
                      {node.cpu.used.toFixed(1)} / {node.cpu.total} {node.cpu.unit}
                    </span>
                  </div>
                  <Progress
                    value={cpuPct}
                    className="h-1.5"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Memory</span>
                    <span className="font-medium">
                      {node.memory.used.toFixed(1)} / {node.memory.total} {node.memory.unit}
                    </span>
                  </div>
                  <Progress
                    value={memPct}
                    className="h-1.5"
                  />
                </div>
              </div>

              {hasPressure && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <IconAlertTriangle className="size-3.5" />
                  Memory pressure detected
                </div>
              )}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
