import { useState, useMemo } from "react";
import { IconSearch, IconFilter, IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ResourceDrawer } from "../components/resource-drawer";
import { useClusterStream } from "@/hooks/use-cluster-stream";
import { useLocalStorage } from "@/hooks/use-local-storage";

const resourceTypes = ["Pods", "Deployments", "Services", "StatefulSets", "DaemonSets", "Jobs", "ConfigMaps", "Secrets", "Ingress"];

export function ExplorerTab({ clusterId }: { clusterId: string }) {
  const [activeType, setActiveType] = useState("Pods");
  const [search, setSearch] = useState("");
  const [showSystemNamespaces, setShowSystemNamespaces] = useState(false);
  const [selectedNamespace, setSelectedNamespace] = useLocalStorage(`k8s-namespace-${clusterId}`, "All Namespaces");
  const [selectedResource, setSelectedResource] = useState<any>(null);

  const { data: streamData } = useClusterStream(clusterId);

  // Compute live data
  const liveData = useMemo(() => {
    if (!streamData) return [];
    
    const items: any[] = [];
    
    const parseAge = (creationTimestamp: string) => {
      if (!creationTimestamp) return "unknown";
      const diff = Date.now() - new Date(creationTimestamp).getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours < 24) return `${hours}h`;
      return `${Math.floor(hours / 24)}d`;
    };

    // Pods
    const pods = streamData.pods?.items || streamData.pods || [];
    pods.forEach((p: any) => {
      items.push({
        id: p.metadata?.uid || Math.random().toString(),
        name: p.metadata?.name,
        type: "Pods", // Match the activeType name
        namespace: p.metadata?.namespace,
        status: p.status?.phase || "Unknown",
        age: parseAge(p.metadata?.creationTimestamp),
        cpu: "N/A", // We'd need pod metrics mapping here
        mem: "N/A",
        raw: p
      });
    });

    // Deployments
    const deps = streamData.deployments?.items || streamData.deployments || [];
    deps.forEach((d: any) => {
      const readyReplicas = d.status?.readyReplicas || 0;
      const replicas = d.status?.replicas || 0;
      items.push({
        id: d.metadata?.uid || Math.random().toString(),
        name: d.metadata?.name,
        type: "Deployments",
        namespace: d.metadata?.namespace,
        status: `${readyReplicas}/${replicas} Ready`,
        age: parseAge(d.metadata?.creationTimestamp),
        cpu: "-",
        mem: "-",
        raw: d
      });
    });

    // Services
    const svcs = streamData.services?.items || streamData.services || [];
    svcs.forEach((s: any) => {
      items.push({
        id: s.metadata?.uid || Math.random().toString(),
        name: s.metadata?.name,
        type: "Services",
        namespace: s.metadata?.namespace,
        status: s.spec?.type || "ClusterIP",
        age: parseAge(s.metadata?.creationTimestamp),
        cpu: "-",
        mem: "-",
        raw: s
      });
    });

    return items;
  }, [streamData]);

  // Extract unique namespaces for dropdown
  const availableNamespaces = useMemo(() => {
    const namespaces = streamData?.namespaces?.items || streamData?.namespaces || [];
    if (namespaces.length > 0) {
      return namespaces.map((ns: any) => ns.metadata?.name || ns.name);
    }
    // Fallback to extracting from liveData if namespace API fails
    const unique = new Set(liveData.map(item => item.namespace));
    return Array.from(unique).filter(Boolean);
  }, [streamData, liveData]);

  // Filter logic
  const filteredData = liveData.filter(item => {
    // Type filter
    if (item.type !== activeType) return false;
    
    // System namespace filter
    const isSystem = item.namespace?.startsWith("kube-") || item.namespace === "default"; // wait, default isn't system usually, but okay
    if (!showSystemNamespaces && item.namespace?.startsWith("kube-")) return false;

    // Specific namespace filter
    if (selectedNamespace !== "All Namespaces" && item.namespace !== selectedNamespace) return false;

    // Search filter
    if (search && !item.name?.toLowerCase().includes(search.toLowerCase())) return false;

    return true;
  });

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Header & Global Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cluster Explorer</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse and manage all cluster resources</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex items-center gap-2 text-sm bg-card border border-border rounded-md px-3 py-1.5 shadow-sm transition-colors hover:border-primary/50 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
            <span className="text-muted-foreground pointer-events-none">Namespace:</span>
            <select 
              value={selectedNamespace} 
              onChange={(e) => setSelectedNamespace(e.target.value)}
              className="bg-transparent font-medium focus:outline-none appearance-none pr-8 cursor-pointer text-foreground w-full"
            >
              <option className="bg-card text-foreground" value="All Namespaces">All Namespaces</option>
              {availableNamespaces.map((ns: string) => (
                <option className="bg-card text-foreground" key={ns} value={ns}>{ns}</option>
              ))}
            </select>
            <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>
          
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <input 
              type="checkbox" 
              checked={showSystemNamespaces}
              onChange={(e) => setShowSystemNamespaces(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary/20"
            />
            Show System Namespaces
          </label>
        </div>
      </div>

      {/* Resource Types Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border pb-px [&::-webkit-scrollbar]:hidden">
        {resourceTypes.map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
              activeType === type 
                ? "border-primary text-foreground" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Table Toolbar */}
      <div className="flex flex-1 flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={`Search ${activeType.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-md py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors text-muted-foreground">
            <IconFilter className="size-4" />
            Filter
          </button>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Namespace</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Age</th>
                <th className="px-6 py-3 font-medium">CPU</th>
                <th className="px-6 py-3 font-medium">Memory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No resources found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredData.map(item => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-muted/50 cursor-pointer transition-colors group"
                    onClick={() => setSelectedResource(item)}
                  >
                    <td className="px-6 py-3 font-medium group-hover:text-primary transition-colors">{item.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{item.namespace}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <span className="size-1.5 rounded-full bg-emerald-500"></span>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{item.age}</td>
                    <td className="px-6 py-3 text-muted-foreground">{item.cpu}</td>
                    <td className="px-6 py-3 text-muted-foreground">{item.mem}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ResourceDrawer 
        isOpen={!!selectedResource} 
        onClose={() => setSelectedResource(null)} 
        resource={selectedResource} 
      />
    </div>
  );
}
