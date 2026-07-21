export type K8sStatus = 'healthy' | 'warning' | 'critical' | 'pending';

export interface K8sResourceMetrics {
  used: number;
  total: number;
  unit: string;
}

export interface K8sNode {
  id: string;
  name: string;
  role: 'control-plane' | 'worker';
  status: K8sStatus;
  cpu: K8sResourceMetrics;
  memory: K8sResourceMetrics;
  podCount: number;
  podCapacity: number;
  conditions: { type: string; status: 'true' | 'false' | 'unknown'; message?: string }[];
  zone: string;
}

export interface K8sPod {
  id: string;
  name: string;
  namespace: string;
  node: string;
  status: K8sStatus;
  restarts: number;
  cpu: string;
  memory: string;
  age: string;
  labels: Record<string, string>;
}

export interface K8sHealthCheck {
  id: string;
  name: string;
  target: string;
  targetType: 'node' | 'pod' | 'service';
  status: K8sStatus;
  lastChecked: string;
  message: string;
}

export interface K8sCluster {
  name: string;
  version: string;
  region: string;
  nodes: K8sNode[];
  pods: K8sPod[];
  healthChecks: K8sHealthCheck[];
}

export const cluster: K8sCluster = {
  name: 'production-us-east',
  version: 'v1.30.2',
  region: 'us-east-1',
  nodes: [
    {
      id: 'node-1',
      name: 'control-plane-1',
      role: 'control-plane',
      status: 'healthy',
      cpu: { used: 1.2, total: 4, unit: 'cores' },
      memory: { used: 4.8, total: 16, unit: 'GiB' },
      podCount: 18,
      podCapacity: 110,
      zone: 'us-east-1a',
      conditions: [
        { type: 'Ready', status: 'true' },
        { type: 'DiskPressure', status: 'false' },
        { type: 'MemoryPressure', status: 'false' },
      ],
    },
    {
      id: 'node-2',
      name: 'worker-1',
      role: 'worker',
      status: 'healthy',
      cpu: { used: 6.4, total: 16, unit: 'cores' },
      memory: { used: 42.2, total: 64, unit: 'GiB' },
      podCount: 34,
      podCapacity: 110,
      zone: 'us-east-1a',
      conditions: [
        { type: 'Ready', status: 'true' },
        { type: 'DiskPressure', status: 'false' },
        { type: 'MemoryPressure', status: 'false' },
      ],
    },
    {
      id: 'node-3',
      name: 'worker-2',
      role: 'worker',
      status: 'warning',
      cpu: { used: 13.8, total: 16, unit: 'cores' },
      memory: { used: 58.6, total: 64, unit: 'GiB' },
      podCount: 41,
      podCapacity: 110,
      zone: 'us-east-1b',
      conditions: [
        { type: 'Ready', status: 'true' },
        { type: 'DiskPressure', status: 'false' },
        { type: 'MemoryPressure', status: 'true', message: 'Memory pressure threshold exceeded' },
      ],
    },
    {
      id: 'node-4',
      name: 'worker-3',
      role: 'worker',
      status: 'healthy',
      cpu: { used: 8.1, total: 16, unit: 'cores' },
      memory: { used: 31.4, total: 64, unit: 'GiB' },
      podCount: 28,
      podCapacity: 110,
      zone: 'us-east-1c',
      conditions: [
        { type: 'Ready', status: 'true' },
        { type: 'DiskPressure', status: 'false' },
        { type: 'MemoryPressure', status: 'false' },
      ],
    },
  ],
  pods: [
    {
      id: 'pod-1',
      name: 'api-gateway-7d9f4b8c5-x2v9k',
      namespace: 'production',
      node: 'worker-1',
      status: 'healthy',
      restarts: 0,
      cpu: '120m',
      memory: '256Mi',
      age: '14d',
      labels: { app: 'api-gateway', tier: 'edge' },
    },
    {
      id: 'pod-2',
      name: 'api-gateway-7d9f4b8c5-kp3m1',
      namespace: 'production',
      node: 'worker-3',
      status: 'healthy',
      restarts: 0,
      cpu: '118m',
      memory: '248Mi',
      age: '14d',
      labels: { app: 'api-gateway', tier: 'edge' },
    },
    {
      id: 'pod-3',
      name: 'user-service-5c7a9d2e1-a9b4c',
      namespace: 'production',
      node: 'worker-1',
      status: 'healthy',
      restarts: 1,
      cpu: '340m',
      memory: '512Mi',
      age: '9d',
      labels: { app: 'user-service', tier: 'backend' },
    },
    {
      id: 'pod-4',
      name: 'user-service-5c7a9d2e1-d8e7f',
      namespace: 'production',
      node: 'worker-2',
      status: 'warning',
      restarts: 3,
      cpu: '1.2',
      memory: '1.2Gi',
      age: '9d',
      labels: { app: 'user-service', tier: 'backend' },
    },
    {
      id: 'pod-5',
      name: 'billing-worker-2b4c6a8d9-q1w2e',
      namespace: 'production',
      node: 'worker-2',
      status: 'critical',
      restarts: 7,
      cpu: '2.1',
      memory: '2.4Gi',
      age: '2h',
      labels: { app: 'billing-worker', tier: 'backend' },
    },
    {
      id: 'pod-6',
      name: 'postgres-primary-0',
      namespace: 'data',
      node: 'worker-3',
      status: 'healthy',
      restarts: 0,
      cpu: '890m',
      memory: '3.1Gi',
      age: '21d',
      labels: { app: 'postgres', tier: 'database' },
    },
    {
      id: 'pod-7',
      name: 'redis-cache-6a8b4c2d1-0',
      namespace: 'data',
      node: 'worker-1',
      status: 'healthy',
      restarts: 0,
      cpu: '45m',
      memory: '128Mi',
      age: '21d',
      labels: { app: 'redis', tier: 'cache' },
    },
    {
      id: 'pod-8',
      name: 'frontend-9f8e7d6c5-b2n4m',
      namespace: 'production',
      node: 'worker-3',
      status: 'healthy',
      restarts: 0,
      cpu: '80m',
      memory: '192Mi',
      age: '5d',
      labels: { app: 'frontend', tier: 'edge' },
    },
    {
      id: 'pod-9',
      name: 'frontend-9f8e7d6c5-x5z7p',
      namespace: 'production',
      node: 'worker-2',
      status: 'pending',
      restarts: 0,
      cpu: '—',
      memory: '—',
      age: '2m',
      labels: { app: 'frontend', tier: 'edge' },
    },
    {
      id: 'pod-10',
      name: 'metrics-server-7b6c5d4a3-9k8j7',
      namespace: 'kube-system',
      node: 'control-plane-1',
      status: 'healthy',
      restarts: 0,
      cpu: '60m',
      memory: '96Mi',
      age: '45d',
      labels: { app: 'metrics-server', tier: 'system' },
    },
  ],
  healthChecks: [
    {
      id: 'check-1',
      name: 'API Gateway Liveness',
      target: 'api-gateway',
      targetType: 'service',
      status: 'healthy',
      lastChecked: '2026-07-20T14:32:00Z',
      message: 'HTTP 200 on /healthz',
    },
    {
      id: 'check-2',
      name: 'User Service Readiness',
      target: 'user-service',
      targetType: 'service',
      status: 'warning',
      lastChecked: '2026-07-20T14:31:00Z',
      message: 'Readiness probe slow (> 3s)',
    },
    {
      id: 'check-3',
      name: 'Billing Worker Liveness',
      target: 'billing-worker-2b4c6a8d9-q1w2e',
      targetType: 'pod',
      status: 'critical',
      lastChecked: '2026-07-20T14:30:00Z',
      message: 'CrashLoopBackOff: exit code 1',
    },
    {
      id: 'check-4',
      name: 'worker-2 Memory Pressure',
      target: 'worker-2',
      targetType: 'node',
      status: 'warning',
      lastChecked: '2026-07-20T14:29:00Z',
      message: 'Memory utilization > 90%',
    },
    {
      id: 'check-5',
      name: 'PostgreSQL Primary',
      target: 'postgres-primary-0',
      targetType: 'pod',
      status: 'healthy',
      lastChecked: '2026-07-20T14:32:00Z',
      message: 'Replication lag < 1s',
    },
    {
      id: 'check-6',
      name: 'Redis Cache',
      target: 'redis-cache',
      targetType: 'service',
      status: 'healthy',
      lastChecked: '2026-07-20T14:32:00Z',
      message: 'PONG received in 2ms',
    },
  ],
};

export function getClusterTotals() {
  const totalCpu = cluster.nodes.reduce((sum, n) => sum + n.cpu.total, 0);
  const usedCpu = cluster.nodes.reduce((sum, n) => sum + n.cpu.used, 0);
  const totalMemory = cluster.nodes.reduce((sum, n) => sum + n.memory.total, 0);
  const usedMemory = cluster.nodes.reduce((sum, n) => sum + n.memory.used, 0);
  const totalPods = cluster.nodes.reduce((sum, n) => sum + n.podCapacity, 0);
  const usedPods = cluster.nodes.reduce((sum, n) => sum + n.podCount, 0);

  return {
    nodes: cluster.nodes.length,
    pods: cluster.pods.length,
    namespaces: new Set(cluster.pods.map((p) => p.namespace)).size,
    cpu: { used: usedCpu, total: totalCpu, unit: 'cores' },
    memory: { used: usedMemory, total: totalMemory, unit: 'GiB' },
    podCapacity: { used: usedPods, total: totalPods },
    healthyNodes: cluster.nodes.filter((n) => n.status === 'healthy').length,
    healthyPods: cluster.pods.filter((p) => p.status === 'healthy').length,
  };
}

export function getNodesByStatus() {
  return cluster.nodes.reduce(
    (acc, node) => {
      acc[node.status] += 1;
      return acc;
    },
    { healthy: 0, warning: 0, critical: 0, pending: 0 } as Record<K8sStatus, number>,
  );
}

export function getPodsByStatus() {
  return cluster.pods.reduce(
    (acc, pod) => {
      acc[pod.status] += 1;
      return acc;
    },
    { healthy: 0, warning: 0, critical: 0, pending: 0 } as Record<K8sStatus, number>,
  );
}
