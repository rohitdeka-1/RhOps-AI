import { IconHeartbeat, IconClock } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/base/badge";
import { cn } from "@/lib/utils";
import { cluster, type K8sHealthCheck } from "@/data/kubernetes";

function statusColor(check: K8sHealthCheck) {
  switch (check.status) {
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

function StatusDot({ status }: { status: K8sHealthCheck["status"] }) {
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

function formatLastChecked(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function HealthChecks() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconHeartbeat className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Health checks</CardTitle>
          </div>
          <Badge color="gray" className="text-xs">
            {cluster.healthChecks.length} checks
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {cluster.healthChecks.map((check) => (
          <div
            key={check.id}
            className="rounded-lg border border-border bg-muted/30 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <StatusDot status={check.status} />
                <span className="text-sm font-medium">{check.name}</span>
              </div>
              <Badge color={statusColor(check)} className="text-[10px] px-1.5 py-0">
                {check.status}
              </Badge>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {check.target}
              <span className="mx-1.5 text-border">·</span>
              {check.targetType}
            </div>
            <div className="mt-2 text-xs text-foreground">{check.message}</div>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <IconClock className="size-3" />
              Last checked {formatLastChecked(check.lastChecked)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
