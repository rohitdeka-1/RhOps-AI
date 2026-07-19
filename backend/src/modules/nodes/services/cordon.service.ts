import { NodesClient } from "../../../infrastructure/kubernetes/nodes.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class CordonNodeService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async cordonNode(clusterId: string, userId: string, name: string, unschedulable: boolean) {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const nodesClient = new NodesClient(kubeconfig);
        return await nodesClient.cordonNode(name, unschedulable);
    }
}
