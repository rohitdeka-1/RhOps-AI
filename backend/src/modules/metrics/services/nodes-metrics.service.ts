import { MetricsClient } from "../../../infrastructure/kubernetes/metrics.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class NodesMetricsService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async getNodesMetrics(clusterId: string, userId: string) {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const metricsClient = new MetricsClient(kubeconfig);
        return await metricsClient.getNodeMetrics();
    }
}
