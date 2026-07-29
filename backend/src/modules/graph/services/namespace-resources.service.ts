import { PrometheusClient } from "../../../infrastructure/monitoring/prometheus.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class NamespaceResourcesGraphService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async getNamespaceMetrics(clusterId: string, userId: string) {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        
        // Use instant query instead of queryRange to get current state
        const cpuQuery = `sum(rate(container_cpu_usage_seconds_total{container!="", pod!=""}[5m])) by (namespace)`;
        const memQuery = `sum(container_memory_working_set_bytes{container!="", pod!=""}) by (namespace)`;

        // Check if agent is connected
        const { agentManager } = await import('../../agent/agent.manager');
        if (agentManager.isAgentConnected(clusterId)) {
            // Agent always uses query_range, so provide a small 1-minute window to simulate instant query
            const end = Math.floor(Date.now() / 1000);
            const start = end - 60;
            const step = '60s';
            
            const [cpu, mem] = await Promise.all([
                agentManager.executeTool(clusterId, 'query_prometheus', { query: cpuQuery, start, end, step }),
                agentManager.executeTool(clusterId, 'query_prometheus', { query: memQuery, start, end, step })
            ]);
            return { cpu, mem };
        }
        
        // Fallback to direct connection if no agent but has kubeconfig
        if (cluster.kubeconfig) {
            const kubeconfig = decrypt(cluster.kubeconfig);
            const prometheusClient = new PrometheusClient(kubeconfig);
            const [cpu, mem] = await Promise.all([
                prometheusClient.query(cpuQuery),
                prometheusClient.query(memQuery)
            ]);
            return { cpu, mem };
        }

        throw new Error("Cluster is not connected via Agent and has no kubeconfig fallback.");
    }
}
