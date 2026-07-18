import { PodsClient } from "../../../infrastructure/kubernetes/pods.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class GetPodsService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    listPods = async (clusterId: string, userId: string, namespace: string = 'default') => {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);

        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }

        const kubeconfig = decrypt(cluster.kubeconfig);
        const podsClient = new PodsClient(kubeconfig);
        const pods = await podsClient.listPods(namespace);

        return pods;
    }
}
