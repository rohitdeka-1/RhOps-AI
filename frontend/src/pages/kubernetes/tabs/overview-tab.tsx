import { useState } from "react";
import { cluster as mockCluster } from "@/data/kubernetes";
import { IconServer2, IconDatabase, IconNetwork, IconCpu, IconCloud, IconSparkles, IconLayersLinked, IconBox, IconChartLine, IconAlertCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

interface OverviewTabProps {
  clusterId: string;
  cluster: any;
}

// Mock Data for charts
const cpuData = [
  { time: "10:00", value: 12 }, { time: "10:05", value: 15 }, { time: "10:10", value: 14 },
  { time: "10:15", value: 18 }, { time: "10:20", value: 25 }, { time: "10:25", value: 22 },
  { time: "10:30", value: 14 },
];

const memData = [
  { time: "10:00", value: 3.1 }, { time: "10:05", value: 3.1 }, { time: "10:10", value: 3.2 },
  { time: "10:15", value: 3.5 }, { time: "10:20", value: 3.8 }, { time: "10:25", value: 3.6 },
  { time: "10:30", value: 3.2 },
];

const networkData = [
  { time: "10:00", in: 120, out: 80 }, { time: "10:05", in: 132, out: 95 }, { time: "10:10", in: 101, out: 70 },
  { time: "10:15", in: 180, out: 120 }, { time: "10:20", in: 350, out: 250 }, { time: "10:25", in: 210, out: 140 },
  { time: "10:30", in: 150, out: 100 },
];

const podStatusData = [
  { name: "Running", value: 42, color: "#10b981" },
  { name: "Pending", value: 4, color: "#f59e0b" },
  { name: "Failed", value: 2, color: "#ef4444" },
];

const namespaceResourceData = [
  { name: "default", cpu: 450, mem: 1200 },
  { name: "kube-system", cpu: 120, mem: 800 },
  { name: "monitoring", cpu: 200, mem: 1050 },
  { name: "ingress", cpu: 50, mem: 150 },
];

const eventRateData = [
  { time: "08:00", errors: 2 }, { time: "08:30", errors: 1 }, { time: "09:00", errors: 0 },
  { time: "09:30", errors: 5 }, { time: "10:00", errors: 12 }, { time: "10:30", errors: 3 },
];

export function OverviewTab({ clusterId, cluster }: OverviewTabProps) {
  const [isPrometheusEnabled, setIsPrometheusEnabled] = useState(false);

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
          
          {/* AI Health Summary Panel */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-3 flex gap-3 items-start shadow-sm text-sm">
            <div className="bg-primary/20 p-1.5 rounded-md text-primary shrink-0">
              <IconSparkles className="size-4" />
            </div>
            <div className="leading-snug">
              <span className="font-semibold text-foreground mr-2">AI Summary:</span>
              <span className="text-foreground">
                The cluster is operating normally. A recent traffic spike at 10:20 caused CPU utilization to briefly jump to 25%, but HPA successfully scaled workloads. 
                There are 2 failed pods in the <span className="font-mono text-xs text-foreground bg-muted px-1 py-0.5 rounded">default</span> namespace crash-looping due to a missing ConfigMap, but core services remain highly available.
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-600 tracking-wide uppercase">Healthy</span>
          </div>
          
        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: "Nodes", value: "3", icon: IconServer2 },
          { label: "Namespaces", value: "12", icon: IconLayersLinked },
          { label: "Total Pods", value: "48", icon: IconBox },
          { label: "Deployments", value: "14", icon: IconDatabase },
          { label: "Services", value: "22", icon: IconNetwork },
          { label: "CPU Usage", value: "14%", icon: IconCpu },
          { label: "Mem Usage", value: "3.2 GB", icon: IconCpu },
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
                Showing basic metrics. Enable Prometheus for high-res historical data.
              </span>
              <button 
                onClick={() => setIsPrometheusEnabled(true)}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded hover:bg-primary/90 transition-colors"
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
            <h3 className="text-sm font-medium text-muted-foreground mb-4">CPU Usage (%)</h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpuData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} itemStyle={{ color: "hsl(var(--foreground))" }} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Memory Chart */}
          <div className="p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Memory Usage (GB)</h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} itemStyle={{ color: "hsl(var(--foreground))" }} />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Network I/O Chart */}
          <div className="p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Network I/O (MB/s)</h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={networkData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} itemStyle={{ color: "hsl(var(--foreground))" }} />
                  <Area type="monotone" dataKey="in" name="Inbound" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" />
                  <Area type="monotone" dataKey="out" name="Outbound" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" />
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
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={namespaceResourceData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#e2e8f0" }} />
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
                    {namespaceResourceData.map((ns) => (
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
            <div className="h-[60px] w-full flex rounded-full overflow-hidden shadow-inner">
               {podStatusData.map(status => (
                 <div 
                   key={status.name} 
                   style={{ 
                     width: `${(status.value / 48) * 100}%`, 
                     backgroundColor: status.color 
                   }} 
                   className="h-full flex items-center justify-center group relative hover:opacity-90 transition-opacity cursor-pointer border-r border-background/20 last:border-0"
                 >
                   <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">{status.value}</span>
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
             <div className="flex items-center gap-2 mb-4">
                <IconAlertCircle className="size-5 text-red-500" />
                <h2 className="font-semibold">Warning & Error Rate</h2>
             </div>
             <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={eventRateData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} itemStyle={{ color: "hsl(var(--foreground))" }} />
                    <Line type="monotone" dataKey="errors" name="Errors" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: "#ef4444" }} activeDot={{ r: 6 }} />
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
                {[
                  { title: "Back-off restarting failed container", source: "pod/worker-queue-55x", time: "Just now", status: "error" },
                  { title: "Liveness probe failed", source: "pod/worker-queue-55x", time: "2m ago", status: "error" },
                  { title: "ReplicaSet scaled to 3", source: "deployment/frontend-web", time: "10m ago", status: "success" },
                  { title: "Pod scheduled", source: "pod/backend-api-xyz", time: "15m ago", status: "success" },
                  { title: "Ingress rules updated", source: "ingress/main-routing", time: "3h ago", status: "info" },
                ].map((event, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={cn(
                      "mt-1 size-2 rounded-full shrink-0",
                      event.status === "error" ? "bg-red-500" :
                      event.status === "info" ? "bg-blue-500" : "bg-emerald-500"
                    )} />
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.source} &bull; {event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
