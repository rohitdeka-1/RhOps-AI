import { useState, useEffect } from "react";
import { cluster as mockCluster } from "@/data/kubernetes";
import { IconServer2, IconDatabase, IconNetwork, IconCpu, IconCloud, IconSparkles, IconLayersLinked, IconBox, IconChartLine, IconAlertCircle, IconX, IconCopy, IconCheck, IconTerminal2, IconLoader2 } from "@tabler/icons-react";
import { useAiSummary } from "@/contexts/ai-summary-context";
import { cn } from "@/lib/utils";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useClusterStream } from "@/hooks/use-cluster-stream";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface OverviewTabProps {
  clusterId: string;
  cluster: any;
}

export function OverviewTab({ clusterId, cluster }: OverviewTabProps) {
  const [isPrometheusEnabled, setIsPrometheusEnabled] = useState(false);
  const [isPrometheusModalOpen, setIsPrometheusModalOpen] = useState(false);
  const [isCheckingPrometheus, setIsCheckingPrometheus] = useState(false);
  const [prometheusCheckMessage, setPrometheusCheckMessage] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const helmSnippet = `helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(helmSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleCheckPrometheus = async () => {
    setIsCheckingPrometheus(true);
    setPrometheusCheckMessage(null);
    try {
      const res = await api.get(`/metrics/prometheus/check?clusterId=${clusterId}`);
      if (res.data?.data?.connected) {
        setIsPrometheusEnabled(true);
        setPrometheusCheckMessage("Successfully connected to Prometheus service inside cluster!");
        setTimeout(() => setIsPrometheusModalOpen(false), 1500);
      } else {
        setPrometheusCheckMessage(res.data?.data?.reason || "Prometheus service not detected yet. Run the Helm command below first.");
      }
    } catch (err: any) {
      setPrometheusCheckMessage("Error verifying Prometheus: " + (err.response?.data?.message || err.message));
    } finally {
      setIsCheckingPrometheus(false);
    }
  };

  // AI Summary Context
  const { summaryData, isGenerating, isDismissed, fetchSummary, dismissSummary } = useAiSummary();

  useEffect(() => {
    if (clusterId) {
      fetchSummary(clusterId);

      // Silently check if Prometheus is already connected on mount
      api.get(`/metrics/prometheus/check?clusterId=${clusterId}`).then(res => {
        if (res.data?.data?.connected) {
          setIsPrometheusEnabled(true);
        }
      }).catch(err => {
        // silently ignore background check errors
      });
    }
  }, [clusterId, fetchSummary]);

  // Fetch real data from WebSocket stream
  const { data: streamData, status } = useClusterStream(clusterId);
  const { nodes, pods, deployments, services, namespaces, events, nodeMetrics } = streamData || {};

  // Filter out system resources
  const SYSTEM_NAMESPACES = ['kube-system', 'kube-public', 'kube-node-lease', 'local-path-storage'];
  const isNotSystemNs = (ns: string) => !SYSTEM_NAMESPACES.includes(ns);
  const getNs = (item: any) => item?.metadata?.namespace || item?.namespace || "default";

  const filteredPods = (pods?.items || pods || []).filter((p: any) => isNotSystemNs(getNs(p)));
  const filteredDeployments = (deployments?.items || deployments || []).filter((d: any) => isNotSystemNs(getNs(d)));
  const filteredServices = (services?.items || services || []).filter((s: any) => isNotSystemNs(getNs(s)));
  const filteredNamespaces = (namespaces?.items || namespaces || []).filter((ns: any) => isNotSystemNs(ns.metadata?.name || ns.name));

  // Parse counts
  const nodeCount = nodes?.items?.length || nodes?.length || 0;
  const podCount = filteredPods.length;
  const deploymentCount = filteredDeployments.length;
  const serviceCount = filteredServices.length;
  const namespaceCount = filteredNamespaces.length;

  // Calculate total cluster capacity
  let totalCpuCores = 0;
  let totalMemGB = 0;

  const nodeList = nodes?.items || nodes || [];
  nodeList.forEach((n: any) => {
    const cpuStr = n.status?.allocatable?.cpu || "0";
    if (cpuStr.endsWith('m')) {
      totalCpuCores += parseInt(cpuStr) / 1000;
    } else {
      totalCpuCores += parseFloat(cpuStr);
    }

    const memStr = n.status?.allocatable?.memory || "0";
    if (memStr.endsWith('Ki')) {
      totalMemGB += parseInt(memStr) / (1024 * 1024);
    } else if (memStr.endsWith('Mi')) {
      totalMemGB += parseInt(memStr) / 1024;
    } else if (memStr.endsWith('Gi')) {
      totalMemGB += parseInt(memStr);
    } else {
      totalMemGB += parseInt(memStr) / (1024 * 1024 * 1024); // raw bytes
    }
  });

  // Format to 1 decimal place
  totalCpuCores = Math.round(totalCpuCores * 10) / 10;
  totalMemGB = Math.round(totalMemGB * 10) / 10;

  // Local state for rolling charts
  const [cpuData, setCpuData] = useState<any[]>([]);
  const [memData, setMemData] = useState<any[]>([]);
  const [networkData, setNetworkData] = useState<any[]>([]);
  const [eventRateData, setEventRateData] = useState<any[]>([]);
  const [promNamespaceData, setPromNamespaceData] = useState<any[]>([]);

  // Seed initial data if empty
  useEffect(() => {
    if (cpuData.length === 0) {
      const now = new Date();
      const seedCpu = [];
      const seedMem = [];
      const seedNet = [];
      const seedErr = [];
      for (let i = 6; i >= 0; i--) {
        const t = new Date(now.getTime() - i * 10000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        seedCpu.push({ time: t, value: 0 });
        seedMem.push({ time: t, value: 0 });
        seedNet.push({ time: t, in: 0, out: 0 });
        seedErr.push({ time: t, errors: 0 });
      }
      setCpuData(seedCpu);
      setMemData(seedMem);
      setNetworkData(seedNet);
      setEventRateData(seedErr);
    }
  }, []);

  // Fetch Prometheus data if connected
  useEffect(() => {
    if (!isPrometheusEnabled || !clusterId) return;

    const fetchPrometheusData = async () => {
      try {
        const end = Math.floor(Date.now() / 1000);
        const start = end - 5 * 60; // last 5 minutes
        const step = "10s";

        const [cpuRes, memRes, netRes, nsRes] = await Promise.all([
          api.get(`/graph/cpu?clusterId=${clusterId}&namespace=.*&start=${start}&end=${end}&step=${step}`),
          api.get(`/graph/memory?clusterId=${clusterId}&namespace=.*&start=${start}&end=${end}&step=${step}`),
          api.get(`/graph/network?clusterId=${clusterId}&namespace=.*&start=${start}&end=${end}&step=${step}`),
          api.get(`/graph/namespaces?clusterId=${clusterId}`)
        ]);

        // Parse CPU (convert to cores)
        if (cpuRes.data?.data?.data?.result) {
          const matrix = cpuRes.data.data.data.result;
          const timeMap: Record<number, number> = {};
          matrix.forEach((series: any) => {
            series.values.forEach(([ts, val]: [number, string]) => {
              timeMap[ts] = (timeMap[ts] || 0) + parseFloat(val);
            });
          });
          const newCpuData = Object.keys(timeMap).sort().map(ts => ({
            time: new Date(Number(ts) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            value: Math.round(timeMap[Number(ts)] * 1000) / 1000
          }));
          if (newCpuData.length > 0) setCpuData(newCpuData);
        }

        // Parse Memory (convert to GB)
        if (memRes.data?.data?.data?.result) {
          const matrix = memRes.data.data.data.result;
          const timeMap: Record<number, number> = {};
          matrix.forEach((series: any) => {
            series.values.forEach(([ts, val]: [number, string]) => {
              timeMap[ts] = (timeMap[ts] || 0) + parseFloat(val);
            });
          });
          const newMemData = Object.keys(timeMap).sort().map(ts => ({
            time: new Date(Number(ts) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            value: Math.round((timeMap[Number(ts)] / (1024 * 1024 * 1024)) * 100) / 100
          }));
          if (newMemData.length > 0) setMemData(newMemData);
        }

        // Parse Network (convert to MB/s)
        if (netRes.data?.data?.receive?.data?.result && netRes.data?.data?.transmit?.data?.result) {
          const rxMatrix = netRes.data.data.receive.data.result;
          const txMatrix = netRes.data.data.transmit.data.result;

          const rxMap: Record<number, number> = {};
          const txMap: Record<number, number> = {};

          rxMatrix.forEach((series: any) => {
            series.values.forEach(([ts, val]: [number, string]) => { rxMap[ts] = (rxMap[ts] || 0) + parseFloat(val); });
          });
          txMatrix.forEach((series: any) => {
            series.values.forEach(([ts, val]: [number, string]) => { txMap[ts] = (txMap[ts] || 0) + parseFloat(val); });
          });

          const newNetData = Object.keys(rxMap).sort().map(ts => {
            const rx = rxMap[Number(ts)] || 0;
            const tx = txMap[Number(ts)] || 0;
            return {
              time: new Date(Number(ts) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              in: Math.round((rx / (1024 * 1024)) * 100) / 100, // MB/s
              out: Math.round((tx / (1024 * 1024)) * 100) / 100 // MB/s
            }
          });
          if (newNetData.length > 0) setNetworkData(newNetData);
        }

        // Parse Namespaces (handles both instant queries and matrix range queries)
        if (nsRes.data?.data?.cpu?.data?.result && nsRes.data?.data?.mem?.data?.result) {
          const cpuVector = nsRes.data.data.cpu.data.result;
          const memVector = nsRes.data.data.mem.data.result;

          const nsMap: Record<string, { cpu: number, mem: number }> = {};

          cpuVector.forEach((res: any) => {
            const ns = res.metric.namespace || "unknown";
            const val = res.value ? parseFloat(res.value[1]) : (res.values ? parseFloat(res.values[res.values.length - 1][1]) : 0);
            if (!nsMap[ns]) nsMap[ns] = { cpu: 0, mem: 0 };
            nsMap[ns].cpu = Math.round(val * 1000); // millicores
          });

          memVector.forEach((res: any) => {
            const ns = res.metric.namespace || "unknown";
            const val = res.value ? parseFloat(res.value[1]) : (res.values ? parseFloat(res.values[res.values.length - 1][1]) : 0);
            if (!nsMap[ns]) nsMap[ns] = { cpu: 0, mem: 0 };
            nsMap[ns].mem = Math.round(val / (1024 * 1024)); // MiB
          });

          const newNsData = Object.keys(nsMap).map(ns => ({
            name: ns,
            cpu: nsMap[ns].cpu,
            mem: nsMap[ns].mem
          })).sort((a, b) => b.cpu - a.cpu).slice(0, 5); // top 5 by cpu

          if (newNsData.length > 0) setPromNamespaceData(newNsData);
        }
      } catch (e) {
        console.error("Prometheus fetch error", e);
      }
    };

    fetchPrometheusData();
    const interval = setInterval(fetchPrometheusData, 10000);
    return () => clearInterval(interval);
  }, [isPrometheusEnabled, clusterId]);

  // Update rolling charts when metrics arrive (fallback if Prometheus is NOT connected)
  useEffect(() => {
    if (!nodeMetrics && cpuData.length === 0) return;

    // Only fallback CPU/Mem if Prometheus is NOT enabled
    if (!isPrometheusEnabled) {
      let totalCpu = 0;
      let totalMem = 0;

      if (nodeMetrics?.items && nodeMetrics.items.length > 0) {
        nodeMetrics.items.forEach((nm: any) => {
          if (nm.usage?.cpu) {
            const cpuVal = parseInt(nm.usage.cpu.replace(/[^0-9]/g, '')) || 0;
            totalCpu += (cpuVal / 1000000);
          }
          if (nm.usage?.memory) {
            const memVal = parseInt(nm.usage.memory.replace(/[^0-9]/g, '')) || 0;
            totalMem += (memVal / 1024 / 1024);
          }
        });
      } else {
        totalCpu = Math.max(10, Math.min(90, (cpuData[cpuData.length - 1]?.value || 15) + (Math.random() * 10 - 5)));
        totalMem = Math.max(2, Math.min(16, (memData[memData.length - 1]?.value || 3.1) + (Math.random() * 0.4 - 0.2)));
      }

      const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCpuData(prev => prev.length > 0 ? [...prev.slice(1), { time: t, value: Math.round(totalCpu * 10) / 10 }] : prev);
      setMemData(prev => prev.length > 0 ? [...prev.slice(1), { time: t, value: Math.round(totalMem * 100) / 100 }] : prev);
    }

    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Only fallback network if Prometheus is NOT enabled
    if (!isPrometheusEnabled) {
      // Fake network I/O based on pod count activity (to be replaced with Prometheus Network endpoints later)
      const netIn = Math.round(Math.random() * 50 + (podCount * 2));
      const netOut = Math.round(Math.random() * 30 + podCount);
      setNetworkData(prev => prev.length > 0 ? [...prev.slice(1), { time: t, in: netIn, out: netOut }] : prev);
    }

    // Update error rate from live events
    const eventList = events?.items || events || [];
    const recentErrors = eventList.filter((e: any) => e.type === "Warning").length;
    setEventRateData(prev => prev.length > 0 ? [...prev.slice(1), { time: t, errors: recentErrors }] : prev);

  }, [nodeMetrics, podCount, events, isPrometheusEnabled]);

  // Calculate Pod Status Distribution
  let running = 0;
  let pending = 0;
  let failed = 0;

  filteredPods.forEach((p: any) => {
    let status = p.status?.phase || "Unknown";
    let hasError = false;

    const containerStatuses = [
      ...(p.status?.initContainerStatuses || []),
      ...(p.status?.containerStatuses || []),
      ...(p.status?.ephemeralContainerStatuses || [])
    ];

    for (const cs of containerStatuses) {
      if (cs.state?.waiting?.reason && cs.state.waiting.reason !== "ContainerCreating" && cs.state.waiting.reason !== "PodInitializing") {
        hasError = true;
        break;
      }
      if (cs.state?.terminated?.reason && cs.state.terminated.reason !== "Completed") {
        hasError = true;
        break;
      }
    }

    if (hasError) {
      failed++;
    } else if (status === "Running" || status === "Succeeded") {
      running++;
    } else if (status === "Pending" || status === "ContainerCreating" || status === "PodInitializing") {
      pending++;
    } else {
      failed++;
    }
  });

  const podStatusData = [
    { name: "Running", value: running || 0, color: "#10b981" },
    { name: "Pending", value: pending || 0, color: "#f59e0b" },
    { name: "Failed", value: failed || 0, color: "#ef4444" },
  ];

  const totalPodsForStatus = running + pending + failed || 1; // avoid div by zero

  // Map namespaces
  const namespaceResourceData = isPrometheusEnabled && promNamespaceData.length > 0
    ? promNamespaceData
    : filteredNamespaces.slice(0, 5).map((ns: any) => ({
      name: ns.metadata?.name || ns.name || "unknown",
      cpu: Math.floor(Math.random() * 300 + 50), // Mock fallback
      mem: Math.floor(Math.random() * 1000 + 200),
    }));

  if (namespaceResourceData.length === 0) {
    namespaceResourceData.push(
      { name: "default", cpu: 450, mem: 1200 }
    );
  }

  // Map events
  const eventList = events?.items || events || [];
  const mappedEvents = eventList.slice(0, 15).map((e: any) => {
    return {
      title: e.message || e.reason || "Unknown event",
      source: `${e.involvedObject?.kind?.toLowerCase() || 'resource'}/${e.involvedObject?.name || 'unknown'}`,
      time: new Date(e.lastTimestamp || e.metadata?.creationTimestamp).toLocaleTimeString(),
      status: e.type === "Warning" ? "error" : "success"
    };
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">

      {/* Header Area */}
      <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">

        {/* Left: Title & Meta */}
        <div className="space-y-1 shrink-0">
          <div className="flex items-center gap-3">
            <img src="/kubernetes.svg" alt="Kubernetes" className="size-8" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {cluster?.name || "Production Cluster"}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="flex items-center gap-1.5"><IconCloud className="size-4" /> {cluster?.provider?.toUpperCase() || "AWS"}</span>
            &bull;
            <span>ap-southeast-1</span>
            &bull;
            <span>Kubernetes {mockCluster.version}</span>
          </p>
        </div>

        {/* Right: AI Summary & Status Badge */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 max-w-4xl">

          {/* Vertical Pod Status Color Band with Legend */}
          <div className="flex items-center gap-3">
            <div className="h-14 w-6 flex flex-col bg-muted shrink-0 shadow-sm" title={failed === 0 && pending === 0 ? "All Pods Healthy" : `${failed} Failed, ${pending} Pending`}>
              {podStatusData.map(status => (
                <div
                  key={status.name}
                  style={{
                    height: `${(status.value / totalPodsForStatus) * 100}%`,
                    backgroundColor: status.value > 0 ? status.color : 'transparent'
                  }}
                  className="w-full transition-all duration-500"
                  title={`${status.name}: ${status.value}`}
                />
              ))}
            </div>
            
            <div className="flex flex-col justify-between h-14 py-0.5">
              {podStatusData.map(status => (
                <div key={status.name} className="flex items-center gap-2">
                  <div className="size-2 shrink-0" style={{ backgroundColor: status.color }} />
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                    {status.name === "Running" ? "Active" : status.name === "Pending" ? "Warning" : "Failed"}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: "Nodes", value: nodeCount, icon: IconServer2 },
          { label: "Namespaces", value: namespaceCount, icon: IconLayersLinked },
          { label: "Total Pods", value: podCount, icon: IconBox },
          { label: "Deployments", value: deploymentCount, icon: IconDatabase },
          { label: "Services", value: serviceCount, icon: IconNetwork },
          { label: "CPU Usage", value: `${cpuData.length > 0 ? cpuData[cpuData.length - 1].value : 0} / ${totalCpuCores || '?'} c`, icon: IconCpu },
          { label: "Mem Usage", value: `${memData.length > 0 ? memData[memData.length - 1].value : 0} / ${totalMemGB || '?'} GB`, icon: IconCpu },
        ].map((stat, idx) => (
          <div key={idx} className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col items-start gap-3">
            <div className="text-muted-foreground">
              <stat.icon className="size-5" stroke={1.5} />
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Graphs Section (3 Columns) */}
      <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/10">
          <div className="flex items-center gap-2">
            <IconChartLine className="size-5 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Cluster Utilization</h2>
          </div>

          {!isPrometheusEnabled ? (
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground hidden md:inline-block">
                Showing live polling metrics. Enable Prometheus for historical data.
              </span>
              <button
                onClick={() => setIsPrometheusModalOpen(true)}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded hover:bg-primary/90 transition-colors shadow-sm"
              >
                Connect Prometheus
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Prometheus Connected</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* CPU Chart */}
          <div className="p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">CPU Usage (Cores)</h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <AreaChart data={cpuData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} itemStyle={{ color: "hsl(var(--foreground))" }} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Memory Chart */}
          <div className="p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Memory Usage (GB)</h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <AreaChart data={memData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} itemStyle={{ color: "hsl(var(--foreground))" }} />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Network I/O Chart */}
          <div className="p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Network I/O (MB/s)</h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <AreaChart data={networkData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} itemStyle={{ color: "hsl(var(--foreground))" }} />
                  <Area type="monotone" dataKey="in" name="Inbound" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" isAnimationActive={false} />
                  <Area type="monotone" dataKey="out" name="Outbound" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Namespaces & Pod Health */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Namespace Resource Chart & Table */}
          <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">Namespace Resources</h2>
              <button className="text-xs text-muted-foreground hover:text-foreground">View Details</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Bar Chart */}
              <div className="p-5">
                <h3 className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">CPU Allocation (m)</h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%" debounce={100}>
                    <BarChart data={namespaceResourceData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#e2e8f0" }} width={80} />
                      <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                      <Bar dataKey="cpu" name="CPU (m)" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto p-0">
                <table className="w-full text-sm text-left h-full">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/30 sticky top-0 z-10">
                    <tr>
                      <th className="px-5 py-3 font-medium">Namespace</th>
                      <th className="px-5 py-3 font-medium text-right">CPU</th>
                      <th className="px-5 py-3 font-medium text-right">Memory</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {namespaceResourceData.map((ns: any) => (
                      <tr key={ns.name} className="hover:bg-muted/50 transition-colors">
                        <td className="px-5 py-3 font-medium">{ns.name}</td>
                        <td className="px-5 py-3 text-muted-foreground text-right">{ns.cpu}m</td>
                        <td className="px-5 py-3 text-muted-foreground text-right">{ns.mem}Mi</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pod Status Distribution */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h2 className="font-semibold mb-6">Pod Status Distribution</h2>
            <div className="h-[60px] w-full flex rounded-lg overflow-hidden shadow-inner bg-muted">
              {podStatusData.map(status => (
                <div
                  key={status.name}
                  style={{
                    width: `${(status.value / totalPodsForStatus) * 100}%`,
                    backgroundColor: status.value > 0 ? status.color : 'transparent'
                  }}
                  className="h-full flex items-center justify-center group relative hover:opacity-90 transition-opacity cursor-pointer border-r border-background/20 last:border-0"
                >
                  {status.value > 0 && (
                    <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">{status.value}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-6">
              {podStatusData.map(status => (
                <div key={status.name} className="flex items-center gap-2">
                  <div className="size-3 rounded-full" style={{ backgroundColor: status.color }} />
                  <span className="text-sm font-medium">{status.name}</span>
                  <span className="text-sm text-muted-foreground">({status.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Events & Errors */}
        <div className="flex flex-col gap-6">

          {/* Error Rate Chart */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconAlertCircle className="size-5 text-red-500" />
                <h2 className="font-semibold">Warning & Error Rate</h2>
              </div>
              <Link
                to={`/cluster?clusterId=${cluster?.projectId}&tab=errors`}
                className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors"
              >
                View Details
              </Link>
            </div>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <LineChart data={eventRateData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} itemStyle={{ color: "hsl(var(--foreground))" }} />
                  <Line type="monotone" dataKey="errors" name="Errors" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: "#ef4444" }} activeDot={{ r: 6 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Events List */}
          <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col flex-1 h-[350px]">
            <div className="p-5 border-b border-border">
              <h2 className="font-semibold">Recent Events</h2>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="space-y-5">
                {mappedEvents.length > 0 ? mappedEvents.reverse().map((event: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <div className={cn(
                      "mt-1 size-2 rounded-full shrink-0",
                      event.status === "error" ? "bg-red-500" :
                        event.status === "info" ? "bg-blue-500" : "bg-emerald-500"
                    )} />
                    <div>
                      <p className="text-sm font-medium line-clamp-2">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.source} &bull; {event.time}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-muted-foreground text-center py-10">No recent events</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Connect Prometheus Dialog */}
      <Dialog open={isPrometheusModalOpen} onOpenChange={setIsPrometheusModalOpen}>
        <DialogContent className="sm:max-w-xl w-[92vw] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-xl shrink-0">
                <IconTerminal2 className="size-5" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-base font-semibold">Connect Prometheus</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Install or connect Prometheus in your Kubernetes cluster to stream rich metrics.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2 text-left">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Step 1: Install Prometheus via Helm 3</p>
              <div className="relative bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-[11px] font-mono text-zinc-200 overflow-x-auto max-w-full">
                <pre className="whitespace-pre-wrap break-all leading-relaxed">{helmSnippet}</pre>
                <button
                  onClick={handleCopySnippet}
                  className="absolute top-2.5 right-2.5 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors flex items-center gap-1 text-[11px] shadow-sm"
                >
                  {copiedSnippet ? <IconCheck className="size-3 text-emerald-400" /> : <IconCopy className="size-3" />}
                  <span>{copiedSnippet ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-border">
              <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Step 2: Test & Verify In-Cluster Connection</p>
              <p className="text-xs text-muted-foreground">
                Our in-cluster agent will search for Prometheus endpoints inside the <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-[11px]">monitoring</code> namespace automatically over the WebSocket connection.
              </p>

              {prometheusCheckMessage && (
                <div className={cn(
                  "p-3 rounded-lg text-xs border font-medium flex items-center gap-2 mt-2",
                  isPrometheusEnabled || prometheusCheckMessage.includes("Successfully")
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                )}>
                  {isPrometheusEnabled || prometheusCheckMessage.includes("Successfully") ? (
                    <IconCheck className="size-4 shrink-0" />
                  ) : (
                    <IconAlertCircle className="size-4 shrink-0" />
                  )}
                  <span>{prometheusCheckMessage}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-1">
            <button
              onClick={() => setIsPrometheusModalOpen(false)}
              className="px-4 py-2 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleCheckPrometheus}
              disabled={isCheckingPrometheus}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {isCheckingPrometheus && <IconLoader2 className="size-3.5 animate-spin" />}
              <span>{isCheckingPrometheus ? "Verifying Prometheus..." : "Verify Connection"}</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
