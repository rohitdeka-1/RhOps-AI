import { IconCube, IconRefresh } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/base/badge";
import { cn } from "@/lib/utils";
import { cluster, type K8sPod } from "@/data/kubernetes";

interface PodListProps {
  pods: K8sPod[];
  selectedNode: string | null;
}

function statusColor(pod: K8sPod) {
  switch (pod.status) {
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

export function PodList({ pods, selectedNode }: PodListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Pods
            {selectedNode && (
              <span className="ml-1.5 font-normal text-muted-foreground">
                on {selectedNode}
              </span>
            )}
          </CardTitle>
          <Badge color="gray" className="text-xs">
            {pods.length} / {cluster.pods.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="max-h-[420px] space-y-2 overflow-auto pr-1">
        {pods.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No pods on this node.
          </p>
        ) : (
          pods.map((pod) => (
            <div
              key={pod.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                <IconCube className="size-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium">{pod.name}</span>
                  <Badge
                    color={statusColor(pod)}
                    className="shrink-0 text-[10px] px-1.5 py-0"
                  >
                    {pod.status}
                  </Badge>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span>{pod.namespace}</span>
                  <span>{pod.node}</span>
                  <span className="inline-flex items-center gap-1">
                    <IconRefresh className="size-3" />
                    {pod.restarts} restarts
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {Object.entries(pod.labels).slice(0, 2).map(([key, value]) => (
                    <span
                      key={key}
                      className="rounded bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border"
                    >
                      {key}: {value}
                    </span>
                  ))}
                  {Object.keys(pod.labels).length > 2 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{Object.keys(pod.labels).length - 2}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="font-medium">{pod.cpu}</div>
                <div className="text-muted-foreground">{pod.memory}</div>
                <div className="text-muted-foreground">{pod.age}</div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
