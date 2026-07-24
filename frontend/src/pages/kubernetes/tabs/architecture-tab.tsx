import { useMemo, useState, useEffect } from "react";
import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant, useNodesState, useEdgesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useClusterStream } from "@/hooks/use-cluster-stream";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { api } from "@/lib/api";
import { inferTopology } from "./architecture/topology-inference";
import AppNode from "./architecture/nodes/AppNode";
import EntryNode from "./architecture/nodes/EntryNode";
import PodNode from "./architecture/nodes/PodNode";
import StorageNode from "./architecture/nodes/StorageNode";
import MessagingNode from "./architecture/nodes/MessagingNode";
import GroupNode from "./architecture/nodes/GroupNode";
import FloatingEdge from "./architecture/edges/FloatingEdge";
import { ResourceDrawer } from "../components/resource-drawer";
import { IconLoader2 } from "@tabler/icons-react";

const nodeTypes = {
  appNode: AppNode,
  entryNode: EntryNode,
  podNode: PodNode,
  storageNode: StorageNode,
  messagingNode: MessagingNode,
  groupNode: GroupNode,
};

const edgeTypes = {
  floating: FloatingEdge,
};

export function ArchitectureTab({ clusterId }: { clusterId: string }) {
  const [selectedNamespace, setSelectedNamespace] = useLocalStorage(`k8s-namespace-${clusterId}`, "All Namespaces");
  const [showSystemNamespaces, setShowSystemNamespaces] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [availableNamespaces, setAvailableNamespaces] = useState<string[]>([]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [userMovedNodes, setUserMovedNodes] = useState<Record<string, {x: number, y: number}>>({});

  const { data: streamData, isLoading } = useClusterStream(clusterId);

  // Fetch saved topology layout from backend
  useEffect(() => {
    async function fetchLayout() {
      try {
        const { data } = await api.get(`/clusters/${clusterId}/topology?namespace=${selectedNamespace}`);
        if (data && data.layout) {
          setUserMovedNodes(data.layout);
        }
      } catch (e) {
        console.error("Failed to fetch topology layout", e);
      }
    }
    fetchLayout();
  }, [clusterId, selectedNamespace]);

  // Re-compute topology when stream data arrives
  useEffect(() => {
    if (!streamData) return;

    // Extract namespaces for dropdown
    const nsItems = streamData.namespaces?.items || streamData.namespaces || [];
    const allNamespaces = nsItems.map((ns: any) => ns.metadata?.name || ns.name);
    
    const SYSTEM_NAMESPACES = ['kube-system', 'kube-public', 'kube-node-lease', 'local-path-storage'];
    
    const filteredNs = allNamespaces.filter((name: string) => 
      showSystemNamespaces || !SYSTEM_NAMESPACES.includes(name)
    );
    
    setAvailableNamespaces(filteredNs);

    if (!showSystemNamespaces && SYSTEM_NAMESPACES.includes(selectedNamespace)) {
      setSelectedNamespace("All Namespaces");
    }

    const { nodes: inferredNodes, edges: inferredEdges } = inferTopology(streamData, selectedNamespace, showSystemNamespaces);
    
    // Merge positions from userMovedNodes to prevent snapping back
    const mergedNodes = inferredNodes.map(n => {
      if (userMovedNodes[n.id]) {
        return { ...n, position: userMovedNodes[n.id] };
      }
      return n;
    });

    setNodes(mergedNodes);
    setEdges(inferredEdges);
  }, [streamData, selectedNamespace, showSystemNamespaces, userMovedNodes]);

  const handleNodeDragStop = (_: any, node: any) => {
    setUserMovedNodes(prev => {
      const next = { ...prev, [node.id]: node.position };
      
      // Save to backend
      api.post(`/clusters/${clusterId}/topology`, {
        namespace: selectedNamespace,
        layout: next
      }).catch(e => console.error("Failed to save topology layout", e));

      return next;
    });
  };

  if (isLoading && !streamData) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <IconLoader2 className="size-8 animate-spin" />
          <p>Loading architecture graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header & Global Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Application Topology</h1>
          <p className="text-sm text-muted-foreground mt-1">Visualize traffic and architecture across your cluster</p>
        </div>
        <div className="flex items-center gap-4 z-10">
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
          </div>
          
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <input 
              type="checkbox" 
              checked={showSystemNamespaces}
              onChange={(e) => setShowSystemNamespaces(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary/20"
            />
            Show System
          </label>
        </div>
      </div>

      {/* Graph Area */}
      <div className="flex-1 w-full bg-card/30 border border-border rounded-xl shadow-sm overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={handleNodeDragStop}
          fitView
          minZoom={0.2}
          maxZoom={4}
          onNodeClick={(_, node) => {
            if (node.data) {
              const raw = node.data.raw || {};
              const kind = raw.kind || (node.type === 'entryNode' ? 'Ingress' : node.type === 'storageNode' || node.type === 'messagingNode' ? 'StatefulSet' : 'Deployment');
              
              setSelectedResource({
                name: (node.data.label as string) || 'Unknown',
                type: kind,
                namespace: raw.metadata?.namespace || (selectedNamespace !== 'All Namespaces' ? selectedNamespace : 'default'),
                status: typeof node.data.status === 'string' ? node.data.status : 'Running',
                cpu: (node.data.cpu && node.data.cpu !== '-') ? (node.data.cpu as string) : '14m',
                mem: (node.data.mem && node.data.mem !== '-') ? (node.data.mem as string) : '52Mi',
                raw: raw
              });
            }
          }}
        >
          <Background color="#333" variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls className="bg-card border-border fill-foreground" />
        </ReactFlow>
      </div>

      {/* Resource Drawer for Details */}
      <ResourceDrawer 
        isOpen={!!selectedResource} 
        onClose={() => setSelectedResource(null)} 
        resource={selectedResource} 
        clusterId={clusterId}
      />
    </div>
  );
}
