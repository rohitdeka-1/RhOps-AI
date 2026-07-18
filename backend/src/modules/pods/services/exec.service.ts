import { PodsClient } from "../../../infrastructure/kubernetes/pods.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class ExecService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    execCommand = async (clusterId: string, userId: string, name: string, namespace: string = 'default', command: string[], container?: string) => {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const podsClient = new PodsClient(kubeconfig);
        return await podsClient.execCommand(name, namespace, command, container);
    }
}
