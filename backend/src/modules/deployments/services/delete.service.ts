import { DeploymentsClient } from "../../../infrastructure/kubernetes/deployments.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class DeleteDeploymentService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async deleteDeployment(clusterId: string, userId: string, name: string, namespace: string = 'default') {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const deploymentsClient = new DeploymentsClient(kubeconfig);
        return await deploymentsClient.deleteDeployment(name, namespace);
    }
}
