import { DeploymentsClient } from "../../../infrastructure/kubernetes/deployments.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";
import * as k8s from '@kubernetes/client-node';

export class UpdateDeploymentService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async updateDeployment(clusterId: string, userId: string, name: string, namespace: string = 'default', body: k8s.V1Deployment) {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const deploymentsClient = new DeploymentsClient(kubeconfig);
        return await deploymentsClient.updateDeployment(name, namespace, body);
    }
}
