import {
  IconServer,
  IconCube,
  IconCpu,
  IconDatabase,
  IconActivity,
  IconPackage,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/base/badge";
import {
  getClusterTotals,
  getNodesByStatus,
  getPodsByStatus,
  type K8sStatus,
} from "@/data/kubernetes";

function statusColor(status: K8sStatus) {
  switch (status) {
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

export function ClusterSummary() {
  const totals = getClusterTotals();
  const nodesByStatus = getNodesByStatus();
  const podsByStatus = getPodsByStatus();
  const cpuPct = Math.round((totals.cpu.used / totals.cpu.total) * 100);
  const memPct = Math.round((totals.memory.used / totals.memory.total) * 100);
  const podPct = Math.round((totals.podCapacity.used / totals.podCapacity.total) * 100);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nodes
          </CardTitle>
          <IconServer className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tracking-tight">
            {totals.nodes}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(
              Object.entries(nodesByStatus) as [K8sStatus, number][]
            ).map(([status, count]) =>
              count > 0 ? (
                <Badge key={status} color={statusColor(status)} className="text-xs">
                  {count} {status}
                </Badge>
              ) : null,
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pods
          </CardTitle>
          <IconCube className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tracking-tight">
            {totals.pods}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(
              Object.entries(podsByStatus) as [K8sStatus, number][]
            ).map(([status, count]) =>
              count > 0 ? (
                <Badge key={status} color={statusColor(status)} className="text-xs">
                  {count} {status}
                </Badge>
              ) : null,
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            CPU & memory
          </CardTitle>
          <IconCpu className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">CPU</span>
              <span className="font-medium">
                {totals.cpu.used.toFixed(1)} / {totals.cpu.total} {totals.cpu.unit}
              </span>
            </div>
            <Progress value={cpuPct} className="h-1.5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Memory</span>
              <span className="font-medium">
                {totals.memory.used.toFixed(1)} / {totals.memory.total}{" "}
                {totals.memory.unit}
              </span>
            </div>
            <Progress value={memPct} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Capacity
          </CardTitle>
          <IconDatabase className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Pod slots</span>
              <span className="font-medium">
                {totals.podCapacity.used} / {totals.podCapacity.total}
              </span>
            </div>
            <Progress value={podPct} className="h-1.5" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <IconPackage className="size-3.5" />
            {totals.namespaces} namespaces
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <IconActivity className="size-3.5" />
            {totals.healthyNodes} healthy nodes, {totals.healthyPods} healthy pods
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
