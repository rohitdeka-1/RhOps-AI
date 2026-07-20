import { IngressClient } from "../../../infrastructure/kubernetes/ingress.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";
import * as k8s from '@kubernetes/client-node';

export class UpdateIngressService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async updateIngress(clusterId: string, userId: string, name: string, namespace: string = 'default', body: k8s.V1Ingress) {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const ingressClient = new IngressClient(kubeconfig);
        return await ingressClient.updateIngress(name, namespace, body);
    }
}
