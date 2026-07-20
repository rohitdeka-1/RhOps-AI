import { ServicesClient } from "../../../infrastructure/kubernetes/services.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";
import * as k8s from '@kubernetes/client-node';

export class UpdateServiceService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async updateService(clusterId: string, userId: string, name: string, namespace: string = 'default', body: k8s.V1Service) {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const servicesClient = new ServicesClient(kubeconfig);
        return await servicesClient.updateService(name, namespace, body);
    }
}
