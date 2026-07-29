import { PrometheusClient } from "../../../infrastructure/monitoring/prometheus.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class MemoryGraphService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async getMemoryMetrics(clusterId: string, userId: string, namespace: string, start: string | number, end: string | number, step: string) {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        
        const query = `sum(container_memory_working_set_bytes{namespace=~"${namespace}", container!="", pod!=""}) by (pod)`;

        // Check if agent is connected
        const { agentManager } = await import('../../agent/agent.manager');
        if (agentManager.isAgentConnected(clusterId)) {
            return await agentManager.executeTool(clusterId, 'query_prometheus', { query, start, end, step });
        }
        
        // Fallback to direct connection if no agent but has kubeconfig
        if (cluster.kubeconfig) {
            const kubeconfig = decrypt(cluster.kubeconfig);
            const prometheusClient = new PrometheusClient(kubeconfig);
            return await prometheusClient.queryRange(query, start, end, step);
        }

        throw new Error("Cluster is not connected via Agent and has no kubeconfig fallback.");
    }
}
