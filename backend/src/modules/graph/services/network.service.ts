import { PrometheusClient } from "../../../infrastructure/monitoring/prometheus.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class NetworkGraphService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async getNetworkMetrics(clusterId: string, userId: string, namespace: string, start: string | number, end: string | number, step: string) {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        
        const receiveQuery = `sum(rate(container_network_receive_bytes_total{namespace=~"${namespace}", pod!=""}[5m])) by (pod)`;
        const transmitQuery = `sum(rate(container_network_transmit_bytes_total{namespace=~"${namespace}", pod!=""}[5m])) by (pod)`;

        // Check if agent is connected
        const { agentManager } = await import('../../agent/agent.manager');
        if (agentManager.isAgentConnected(clusterId)) {
            const [receive, transmit] = await Promise.all([
                agentManager.executeTool(clusterId, 'query_prometheus', { query: receiveQuery, start, end, step }),
                agentManager.executeTool(clusterId, 'query_prometheus', { query: transmitQuery, start, end, step })
            ]);
            return { receive, transmit };
        }
        
        // Fallback to direct connection if no agent but has kubeconfig
        if (cluster.kubeconfig) {
            const kubeconfig = decrypt(cluster.kubeconfig);
            const prometheusClient = new PrometheusClient(kubeconfig);
            const [receive, transmit] = await Promise.all([
                prometheusClient.queryRange(receiveQuery, start, end, step),
                prometheusClient.queryRange(transmitQuery, start, end, step)
            ]);
            return { receive, transmit };
        }

        throw new Error("Cluster is not connected via Agent and has no kubeconfig fallback.");
    }
}
