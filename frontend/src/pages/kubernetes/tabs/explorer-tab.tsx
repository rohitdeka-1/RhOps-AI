import { useState } from "react";
import { IconSearch, IconFilter, IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ResourceDrawer } from "../components/resource-drawer";

const resourceTypes = ["Pods", "Deployments", "Services", "StatefulSets", "DaemonSets", "Jobs", "ConfigMaps", "Secrets", "Ingress"];

const mockData = [
  { id: 1, name: "frontend-deployment-7f89c4b", type: "Pod", namespace: "default", status: "Running", age: "2d", cpu: "12m", mem: "128Mi" },
  { id: 2, name: "backend-api-core-2", type: "Pod", namespace: "default", status: "Running", age: "5h", cpu: "45m", mem: "256Mi" },
  { id: 3, name: "redis-cache-0", type: "Pod", namespace: "cache", status: "Running", age: "12d", cpu: "5m", mem: "1Gi" },
  { id: 4, name: "kube-dns-5c5445b4", type: "Pod", namespace: "kube-system", status: "Running", age: "45d", cpu: "2m", mem: "64Mi" },
  { id: 5, name: "metrics-server-84f5g", type: "Pod", namespace: "kube-system", status: "Running", age: "45d", cpu: "1m", mem: "32Mi" },
];

export function ExplorerTab() {
  const [activeType, setActiveType] = useState("Pods");
  const [search, setSearch] = useState("");
  const [showSystemNamespaces, setShowSystemNamespaces] = useState(false);
  const [selectedNamespace, setSelectedNamespace] = useState("All Namespaces");
  const [selectedResource, setSelectedResource] = useState<any>(null);

  // Filter logic
  const filteredData = mockData.filter(item => {
    // Type filter
    if (item.type !== activeType) return false;
    
    // System namespace filter
    const isSystem = item.namespace.startsWith("kube-");
    if (!showSystemNamespaces && isSystem) return false;

    // Specific namespace filter
    if (selectedNamespace !== "All Namespaces" && item.namespace !== selectedNamespace) return false;

    // Search filter
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;

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
          <div className="flex items-center gap-2 text-sm bg-card border border-border rounded-md px-3 py-1.5 shadow-sm">
            <span className="text-muted-foreground">Namespace:</span>
            <select 
              value={selectedNamespace} 
              onChange={(e) => setSelectedNamespace(e.target.value)}
              className="bg-transparent font-medium focus:outline-none appearance-none pr-4"
            >
              <option>All Namespaces</option>
              <option>default</option>
              <option>cache</option>
              {showSystemNamespaces && <option>kube-system</option>}
            </select>
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
