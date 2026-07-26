import { agentManager } from "../../agent/agent.manager";
import { NodesClient } from "../../../infrastructure/kubernetes/nodes.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class GetNodeService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async getNode(clusterId: string, userId: string, name: string) {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        
        if (agentManager.isAgentConnected(clusterId)) {
            return await agentManager.executeTool(clusterId, 'get_node', { name });
        }

        if (!cluster.kubeconfig) {
            throw new Error("Cluster is not connected via Agent and has no kubeconfig fallback.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const nodesClient = new NodesClient(kubeconfig);
        return await nodesClient.getNode(name);
    }
}
