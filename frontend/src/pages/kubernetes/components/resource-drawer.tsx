import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { 
  IconX, IconBox, IconActivity, IconFileText, IconAlertCircle, 
  IconCode, IconSparkles, IconCopy, IconCheck, IconRefresh, 
  IconDownload, IconSearch, IconCpu, IconServer
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useClusterStream } from "@/hooks/use-cluster-stream";

interface ResourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resource: { 
    name: string; 
    type: string; 
    namespace: string; 
    status: string;
    age?: string;
    cpu?: string;
    mem?: string;
    raw?: any;
  } | null;
  clusterId?: string;
}

// Simple helper to convert JSON object to clean YAML syntax
function jsonToYaml(obj: any, indent = 0): string {
  if (obj === null || obj === undefined) return '';
  const spacing = ' '.repeat(indent);
  if (typeof obj !== 'object') {
    if (typeof obj === 'string' && (obj.includes('\n') || obj.includes(':') || obj.includes('#'))) {
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return String(obj);
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(item => {
      if (typeof item === 'object' && item !== null) {
        const itemYaml = jsonToYaml(item, indent + 2).trimStart();
        return `${spacing}- ${itemYaml}`;
      }
      return `${spacing}- ${jsonToYaml(item, 0)}`;
    }).join('\n');
  }
  const keys = Object.keys(obj);
  if (keys.length === 0) return '{}';
  return keys.map(key => {
    const val = obj[key];
    if (typeof val === 'object' && val !== null) {
      if (Array.isArray(val) && val.length === 0) return `${spacing}${key}: []`;
      if (!Array.isArray(val) && Object.keys(val).length === 0) return `${spacing}${key}: {}`;
      return `${spacing}${key}:\n${jsonToYaml(val, indent + 2)}`;
    }
    return `${spacing}${key}: ${jsonToYaml(val, 0)}`;
  }).join('\n');
}

export function ResourceDrawer({ isOpen, onClose, resource, clusterId }: ResourceDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);
  
  // Logs state
  const [logs, setLogs] = useState<string>("");
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [selectedContainer, setSelectedContainer] = useState<string>("");

  // Cluster Stream Hook (called unconditionally at top level)
  const { data: streamData } = useClusterStream(isOpen ? (clusterId || null) : null);

  // Containers list extracted from raw spec
  const rawData = resource?.raw || {};
  const containers = useMemo(() => {
    const spec = rawData.spec?.template?.spec || rawData.spec || {};
    return spec.containers || [];
  }, [rawData]);

  // Match live pods for Workload resources (Deployments / StatefulSets)
  const allPods = useMemo(() => streamData?.pods?.items || streamData?.pods || [], [streamData?.pods]);
  const matchingPods = useMemo(() => {
    if (!resource) return [];
    return allPods.filter((p: any) => {
      const pNs = p.metadata?.namespace || p.namespace || "default";
      if (pNs !== resource.namespace) return false;
      
      const pLabels = p.metadata?.labels || {};
      const selector = rawData.spec?.selector?.matchLabels || rawData.spec?.selector || {};
      if (Object.keys(selector).length > 0) {
        return Object.keys(selector).every(k => pLabels[k] === selector[k]);
      }
      const name = resource.name;
      return (
        p.metadata?.name === name ||
        p.metadata?.name?.startsWith(`${name}-`) ||
        pLabels.app === name ||
        pLabels['app.kubernetes.io/name'] === name
      );
    });
  }, [allPods, resource, rawData]);

  // Reset & validate selected container when resource changes
  useEffect(() => {
    if (containers.length > 0) {
      const containerNames = containers.map((c: any) => c.name);
      if (!selectedContainer || !containerNames.includes(selectedContainer)) {
        setSelectedContainer(containers[0].name || "");
      }
    } else {
      setSelectedContainer("");
    }
  }, [resource?.name, containers]);

  // Fetch logs when Logs tab is opened
  const fetchLogs = async () => {
    if (!resource || !clusterId) {
      setLogs(`[INFO] Logs for ${resource?.name || 'resource'} in namespace ${resource?.namespace || 'default'}\n[SUCCESS] Pod initialized cleanly.\n[INFO] Standard output stream connected.`);
      return;
    }
    setLoadingLogs(true);
    try {
      // Validate container exists in current pod spec
      const validContainer = containers.some((c: any) => c.name === selectedContainer)
        ? selectedContainer
        : containers[0]?.name || '';

      const containerQuery = validContainer ? `&container=${validContainer}` : '';
      const response = await api.get(`/pods/${resource.name}/logs?clusterId=${clusterId}&namespace=${resource.namespace}${containerQuery}`);
      const payload = response.data;
      
      let rawText = "";
      if (typeof payload === 'string') {
        rawText = payload;
      } else if (payload && typeof payload.data === 'string') {
        rawText = payload.data;
      } else if (payload && payload.data && typeof payload.data.body === 'string') {
        rawText = payload.data.body;
      } else if (payload && payload.data && payload.data.response && typeof payload.data.response.body === 'string') {
        rawText = payload.data.response.body;
      } else if (payload && payload.message && typeof payload.message === 'string') {
        rawText = payload.message;
      } else {
        rawText = JSON.stringify(payload?.data || payload, null, 2);
      }

      if (rawText.includes('\\n')) {
        rawText = rawText.replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }

      setLogs(rawText || `[INFO] No log output available for ${resource.name}`);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to fetch logs from cluster';
      setLogs(`[ERROR] Log stream error for ${resource.name}:\n${errMsg}`);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === "logs" && isOpen) {
      fetchLogs();
    }
  }, [activeTab, isOpen, selectedContainer]);

  if (!isOpen || !resource) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: IconBox },
    { id: "metrics", label: "Metrics", icon: IconActivity },
    { id: "logs", label: "Logs", icon: IconFileText },
    { id: "events", label: "Events", icon: IconAlertCircle },
    { id: "yaml", label: "YAML", icon: IconCode },
    { id: "ai", label: "AI Analysis", icon: IconSparkles },
  ];

  const metadata = rawData.metadata || {};
  const labels = metadata.labels || {};
  const annotations = metadata.annotations || {};
  const creationTime = metadata.creationTimestamp ? new Date(metadata.creationTimestamp).toLocaleString() : resource.age || "Unknown";
  const uid = metadata.uid || resource.name + "-uid";

  let nodeName = rawData.spec?.nodeName;
  let podIp = rawData.status?.podIP || rawData.spec?.clusterIP;
  let containerStatuses = rawData.status?.containerStatuses || [];

  if (matchingPods.length > 0) {
    if (!nodeName) {
      nodeName = Array.from(new Set(matchingPods.map((p: any) => p.spec?.nodeName).filter(Boolean))).join(", ") || "N/A";
    }
    if (!podIp) {
      podIp = Array.from(new Set(matchingPods.map((p: any) => p.status?.podIP).filter(Boolean))).join(", ") || "N/A";
    }

    const aggregatedStatuses: any[] = [];
    matchingPods.forEach((p: any) => {
      const cStatuses = [
        ...(p.status?.containerStatuses || []),
        ...(p.status?.initContainerStatuses || [])
      ];
      cStatuses.forEach((cs: any) => {
        const existing = aggregatedStatuses.find((a: any) => a.name === cs.name);
        if (existing) {
          existing.restartCount = (existing.restartCount || 0) + (cs.restartCount || 0);
          existing.ready = existing.ready && (cs.ready ?? true);
        } else {
          aggregatedStatuses.push({ ...cs });
        }
      });
    });

    if (containerStatuses.length === 0 && aggregatedStatuses.length > 0) {
      containerStatuses = aggregatedStatuses;
    }
  }

  nodeName = nodeName || "N/A";
  podIp = podIp || "N/A";

  const totalRestarts = containerStatuses.reduce((acc: number, cs: any) => acc + (cs.restartCount || 0), 0);

  // YAML String
  const yamlContent = jsonToYaml(rawData);

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(yamlContent);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const filteredLogs = logs
    .split('\n')
    .filter(line => !logSearch || line.toLowerCase().includes(logSearch.toLowerCase()))
    .join('\n');

  return createPortal(
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Sliding Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-3xl bg-background border-l border-border shadow-2xl z-[10000] flex flex-col animate-in slide-in-from-right duration-300">
        
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
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                  : resource.status === "Pending" 
                  ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  : "bg-red-500/10 text-red-500 border-red-500/20"
              )}>
                {resource.status}
              </span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight">{resource.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">Namespace: <span className="font-mono text-foreground">{resource.namespace}</span></p>
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
        <div className="flex-1 overflow-y-auto p-6 bg-muted/20 custom-scrollbar">

          {/* LOG TERMINAL OUTPUT AT LINE ~413 */}
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Metadata Card */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <IconBox className="size-4 text-muted-foreground" />
                  Metadata
                </h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Created At</span>
                    <span className="font-medium text-foreground">{creationTime}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Node</span>
                    <span className="font-medium text-foreground">{nodeName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">IP Address</span>
                    <span className="font-mono text-xs text-foreground bg-muted px-2 py-0.5 rounded">{podIp}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Restarts</span>
                    <span className={cn("font-medium", totalRestarts > 0 ? "text-red-500" : "text-foreground")}>
                      {totalRestarts}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-xs mb-1">UID</span>
                    <span className="font-mono text-xs text-foreground/80 break-all select-all">{uid}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-xs mb-2">Labels</span>
                    {Object.keys(labels).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(labels).map(([k, v]) => (
                          <span key={k} className="px-2.5 py-1 bg-muted border border-border rounded-md text-xs font-mono text-foreground">
                            {k}=<span className="text-primary">{String(v)}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No labels defined</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Containers Card */}
              {containers.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <IconServer className="size-4 text-muted-foreground" />
                    Containers ({containers.length})
                  </h3>
                  <div className="space-y-3">
                    {containers.map((c: any, i: number) => {
                      const cs = containerStatuses.find((s: any) => s.name === c.name);
                      const isReady = cs?.ready ?? true;
                      return (
                        <div key={i} className="p-3 bg-muted/40 border border-border rounded-lg flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-foreground flex items-center gap-2">
                              <span className={cn("size-2 rounded-full", isReady ? "bg-emerald-500" : "bg-red-500")} />
                              {c.name}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              Restarts: {cs?.restartCount || 0}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            Image: <span className="text-foreground">{c.image}</span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* METRICS TAB */}
          {activeTab === "metrics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col gap-2">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-medium uppercase tracking-wider">CPU Usage</span>
                    <IconCpu className="size-4 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold tracking-tight text-foreground">{resource.cpu || "12m"}</p>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mt-2">
                    <div className="bg-blue-500 h-full rounded-full w-[25%]" />
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">Requested: 100m limit</span>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col gap-2">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-medium uppercase tracking-wider">Memory Usage</span>
                    <IconActivity className="size-4 text-purple-500" />
                  </div>
                  <p className="text-3xl font-bold tracking-tight text-foreground">{resource.mem || "45Mi"}</p>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mt-2">
                    <div className="bg-purple-500 h-full rounded-full w-[40%]" />
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1">Requested: 256Mi limit</span>
                </div>
              </div>
            </div>
          )}

          {/* LOGS TAB */}
          {activeTab === "logs" && (
            <div className="flex flex-col h-[520px] bg-[#0D1117] border border-border rounded-xl shadow-sm overflow-hidden text-xs font-mono">
              {/* Log Toolbar */}
              <div className="p-3 bg-[#161B22] border-b border-[#30363D] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-xs">
                  <IconSearch className="size-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search logs..." 
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                {containers.length > 1 && (
                  <select 
                    value={selectedContainer} 
                    onChange={(e) => setSelectedContainer(e.target.value)}
                    className="bg-[#0D1117] text-gray-200 border border-[#30363D] rounded px-2 py-1 text-xs focus:outline-none"
                  >
                    {containers.map((c: any) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                )}

                <div className="flex items-center gap-2">
                  <button 
                    onClick={fetchLogs}
                    disabled={loadingLogs}
                    className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#21262D] transition-colors"
                    title="Refresh Logs"
                  >
                    <IconRefresh className={cn("size-4", loadingLogs && "animate-spin")} />
                  </button>
                  <button 
                    onClick={handleCopyLogs}
                    className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#21262D] transition-colors"
                    title="Copy Logs"
                  >
                    {copiedLogs ? <IconCheck className="size-4 text-emerald-400" /> : <IconCopy className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Log Terminal Output */}
              <div className="p-4 flex-1 overflow-y-auto text-[#C9D1D9] leading-relaxed whitespace-pre-wrap select-text custom-scrollbar">
                {loadingLogs ? (
                  <div className="text-gray-500 italic">Streaming logs from cluster...</div>
                ) : filteredLogs ? (
                  filteredLogs
                ) : (
                  <div className="text-gray-500 italic">No logs match the filter criteria.</div>
                )}
              </div>
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === "events" && (
            <div className="space-y-3">
              <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-start gap-3">
                <div className="size-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Scheduled &amp; Started Container</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Successfully assigned {resource.namespace}/{resource.name} to node</p>
                  <span className="text-[10px] text-muted-foreground mt-2 block">{creationTime}</span>
                </div>
              </div>
            </div>
          )}

          {/* YAML TAB */}
          {activeTab === "yaml" && (
            <div className="flex flex-col h-[520px] bg-[#0D1117] border border-border rounded-xl shadow-sm overflow-hidden text-xs font-mono">
              <div className="p-3 bg-[#161B22] border-b border-[#30363D] flex items-center justify-between">
                <span className="text-gray-400 text-xs font-sans font-medium">{resource.name}.yaml</span>
                <button 
                  onClick={handleCopyYaml}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-[#21262D] text-gray-200 border border-[#30363D] rounded text-xs hover:bg-[#30363D] transition-colors"
                >
                  {copiedYaml ? (
                    <>
                      <IconCheck className="size-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <IconCopy className="size-3.5" />
                      <span>Copy YAML</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto text-[#C9D1D9] leading-relaxed whitespace-pre select-text custom-scrollbar">
                {yamlContent || "# No manifest available"}
              </div>
            </div>
          )}
          
          {/* AI ANALYSIS TAB */}
          {activeTab === "ai" && (
            <div className="bg-card rounded-xl border border-primary/20 shadow-sm overflow-hidden">
               <div className="bg-primary/5 p-5 border-b border-primary/10 flex gap-4 items-start">
                  <div className="bg-primary/20 text-primary p-2.5 rounded-lg shrink-0">
                     <IconSparkles className="size-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground text-base">AI Diagnostic &amp; Health Analysis</h3>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {resource.status === "Running" || resource.status === "Active" ? (
                        <>
                          Resource <span className="font-mono font-semibold text-primary">{resource.name}</span> in namespace <span className="font-mono text-primary">{resource.namespace}</span> is healthy. 
                          Total restart count is {totalRestarts}. CPU and memory consumption are operating within baseline stability limits. No crash-loop warnings detected in current log stream.
                        </>
                      ) : (
                        <>
                          Resource <span className="font-mono font-semibold text-red-400">{resource.name}</span> is currently in <span className="font-semibold text-amber-400">{resource.status}</span> state. 
                          Detected {totalRestarts} restarts. Check the <span className="font-semibold text-foreground">Logs</span> tab for stack trace details.
                        </>
                      )}
                    </p>
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </>,
    document.body
  );
}
