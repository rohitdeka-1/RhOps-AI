import { useClusterStream } from "@/hooks/use-cluster-stream";
import { IconAlertCircle, IconCheck, IconInfoCircle, IconLoader2, IconAlertTriangle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function ErrorsTab({ clusterId }: { clusterId: string }) {
  const { data: streamData, status } = useClusterStream(clusterId);
  const events = streamData?.events || [];
  
  const [filter, setFilter] = useState<"All" | "Warning" | "Normal">("All");

  const eventList = events?.items || events || [];
  
  const filteredEvents = eventList.filter((e: any) => {
    if (filter === "All") return true;
    return e.type === filter;
  }).sort((a: any, b: any) => {
    const timeA = new Date(a.lastTimestamp || a.metadata?.creationTimestamp).getTime();
    const timeB = new Date(b.lastTimestamp || b.metadata?.creationTimestamp).getTime();
    return timeB - timeA;
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Cluster Events & Errors
        </h1>
        <p className="text-sm text-muted-foreground">
          View all real-time events, warnings, and errors across your cluster.
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/10">
          <div className="flex gap-2">
            {(["All", "Warning", "Normal"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  filter === f 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            Showing {filteredEvents.length} events
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Message</th>
                <th className="px-5 py-3 font-medium">Source / Object</th>
                <th className="px-5 py-3 font-medium">Reason</th>
                <th className="px-5 py-3 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEvents.length > 0 ? filteredEvents.map((e: any, i: number) => {
                const isWarning = e.type === "Warning";
                const timeStr = new Date(e.lastTimestamp || e.metadata?.creationTimestamp).toLocaleString();
                const source = `${e.involvedObject?.kind?.toLowerCase() || 'resource'} / ${e.involvedObject?.name || 'unknown'}`;
                
                return (
                  <tr key={i} className="hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold uppercase tracking-wider",
                        isWarning ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        {isWarning ? <IconAlertTriangle className="size-3.5" /> : <IconInfoCircle className="size-3.5" />}
                        <span>{e.type}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium max-w-lg truncate" title={e.message}>
                      {e.message}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {source}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {e.reason}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-right whitespace-nowrap">
                      {timeStr}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    No events found matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
