import { KubernetesClient } from "../../../infrastructure/kubernetes/kubernetes.client";
import { ClusterRepository } from "../repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class ListClusterService {

    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    listClusters = async (userId: string) => {
        const clusters = await this.clusterRepository.findClustersByUserId(userId);
        return clusters;
    }

    listNamespaces = async (clusterId: string, userId: string) => {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);

        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }

        const kubeconfig = decrypt(cluster.kubeconfig);
        const k8sClient = new KubernetesClient(kubeconfig);
        const namespaces = await k8sClient.listNamespaces();

        return namespaces;
    }

}