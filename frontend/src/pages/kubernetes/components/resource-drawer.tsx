import { useState } from "react";
import { IconX, IconBox, IconActivity, IconFileText, IconAlertCircle, IconCode, IconSparkles } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ResourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resource: { name: string; type: string; namespace: string; status: string } | null;
}

export function ResourceDrawer({ isOpen, onClose, resource }: ResourceDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!isOpen || !resource) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: IconBox },
    { id: "metrics", label: "Metrics", icon: IconActivity },
    { id: "logs", label: "Logs", icon: IconFileText },
    { id: "events", label: "Events", icon: IconAlertCircle },
    { id: "yaml", label: "YAML", icon: IconCode },
    { id: "ai", label: "AI Analysis", icon: IconSparkles },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Sliding Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border bg-muted/10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {resource.type}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                resource.status === "Running" || resource.status === "Active" 
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              )}>
                {resource.status}
              </span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight">{resource.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">Namespace: {resource.namespace}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          >
            <IconX className="size-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-6 border-b border-border gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                  isActive 
                    ? "border-primary text-foreground" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className={cn("size-4", tab.id === "ai" && isActive && "text-primary")} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-card rounded-lg border border-border p-5">
                <h3 className="font-semibold text-sm mb-4">Metadata</h3>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">Created At</span>
                    <span>2 hours ago</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Labels</span>
                    <span className="px-2 py-0.5 bg-muted rounded text-xs">app=frontend</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">UID</span>
                    <span className="font-mono text-xs">1a2b3c4d-5e6f-7g8h-9i0j</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "metrics" && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
              <IconActivity className="size-8 mb-2 opacity-20" />
              <p>Metrics visualization coming soon</p>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="bg-[#0D1117] text-[#C9D1D9] font-mono text-xs p-4 rounded-lg h-full overflow-y-auto">
              <div>[INFO] Starting application...</div>
              <div>[INFO] Listening on port 8080</div>
              <div className="text-emerald-400">[SUCCESS] Connected to database</div>
            </div>
          )}
          
          {activeTab === "ai" && (
            <div className="bg-card rounded-lg border border-primary/20 shadow-sm overflow-hidden">
               <div className="bg-primary/5 p-4 border-b border-primary/10 flex gap-3 items-start">
                  <div className="bg-primary/20 text-primary p-2 rounded-md mt-0.5">
                     <IconSparkles className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">AI Health Analysis</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      This resource is running optimally. CPU utilization is stable at 12% and memory is well within limits. No recent crash loops or error events detected in the log stream.
                    </p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
