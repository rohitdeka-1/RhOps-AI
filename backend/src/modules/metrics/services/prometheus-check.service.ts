import { agentManager } from "../../agent/agent.manager";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";

export class PrometheusCheckService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    checkPrometheusStatus = async (clusterId: string, userId: string) => {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or permission denied.");
        }

        if (!agentManager.isAgentConnected(clusterId)) {
            return {
                connected: false,
                reason: "Agent is not connected to backend."
            };
        }

        try {
            const res = await agentManager.executeTool(clusterId, 'query_prometheus', { query: 'up' }, 10000);
            if (res && res.status === 'success') {
                return {
                    connected: true,
                    data: res.data
                };
            }
            return {
                connected: false,
                reason: "Prometheus service did not return success."
            };
        } catch (err: any) {
            let reason = err.message || "Failed to contact Prometheus service inside cluster.";
            if (reason.includes("not supported by the agent")) {
                reason = "Your cluster agent container is running an older image. Please rebuild & restart your agent image (docker build / kubectl rollout restart) to apply the latest Prometheus tool updates.";
            }
            return {
                connected: false,
                reason
            };
        }
    }
}
