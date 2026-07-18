import { NamespacesClient } from "../../../infrastructure/kubernetes/namespaces.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class GetNamespaceService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async getNamespace(clusterId: string, userId: string, name: string) {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const namespacesClient = new NamespacesClient(kubeconfig);
        return await namespacesClient.getNamespace(name);
    }
}
