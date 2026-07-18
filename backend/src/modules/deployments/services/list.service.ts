import { DeploymentsClient } from "../../../infrastructure/kubernetes/deployments.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class ListDeploymentsService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async listDeployments(clusterId: string, userId: string, namespace: string = 'default') {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const deploymentsClient = new DeploymentsClient(kubeconfig);
        return await deploymentsClient.listDeployments(namespace);
    }
}
