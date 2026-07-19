import { IngressClient } from "../../../infrastructure/kubernetes/ingress.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class ListIngressService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async listIngresses(clusterId: string, userId: string, namespace: string = 'default') {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const ingressClient = new IngressClient(kubeconfig);
        return await ingressClient.listIngresses(namespace);
    }
}
