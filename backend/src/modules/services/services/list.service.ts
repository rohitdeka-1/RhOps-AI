import { ServicesClient } from "../../../infrastructure/kubernetes/services.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class ListServicesService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async listServices(clusterId: string, userId: string, namespace: string = 'default') {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const servicesClient = new ServicesClient(kubeconfig);
        return await servicesClient.listServices(namespace);
    }
}
