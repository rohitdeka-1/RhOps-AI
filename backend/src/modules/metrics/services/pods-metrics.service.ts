import { MetricsClient } from "../../../infrastructure/kubernetes/metrics.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

import { agentManager } from "../../agent/agent.manager";

export class PodsMetricsService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async getPodsMetrics(clusterId: string, userId: string, namespace: string = 'default') {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }

        if (agentManager.isAgentConnected(clusterId)) {
            return await agentManager.executeTool(clusterId, 'get_pod_metrics', { namespace });
        }

        if (!cluster.kubeconfig) {
            throw new Error("Cluster is not connected via Agent and has no kubeconfig fallback.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const metricsClient = new MetricsClient(kubeconfig);
        return await metricsClient.getPodMetrics(namespace);
    }
}
