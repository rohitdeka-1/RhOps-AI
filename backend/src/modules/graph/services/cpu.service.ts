import { PrometheusClient } from "../../../infrastructure/monitoring/prometheus.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class CpuGraphService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async getCpuMetrics(clusterId: string, userId: string, namespace: string, start: string | number, end: string | number, step: string) {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        
        const kubeconfig = decrypt(cluster.kubeconfig);
        const prometheusClient = new PrometheusClient(kubeconfig);
        
        const query = `sum(rate(container_cpu_usage_seconds_total{namespace="${namespace}", container!="", pod!=""}[5m])) by (pod)`;
        
        return await prometheusClient.queryRange(query, start, end, step);
    }
}
