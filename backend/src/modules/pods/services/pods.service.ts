import { PodsClient } from "../../../infrastructure/kubernetes/pods.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class PodsService {
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

    getPod = async (clusterId: string, userId: string, name: string, namespace: string = 'default') => {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const podsClient = new PodsClient(kubeconfig);
        return await podsClient.getPod(name, namespace);
    }

    deletePod = async (clusterId: string, userId: string, name: string, namespace: string = 'default') => {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const podsClient = new PodsClient(kubeconfig);
        return await podsClient.deletePod(name, namespace);
    }

    describePod = async (clusterId: string, userId: string, name: string, namespace: string = 'default') => {
        return await this.getPod(clusterId, userId, name, namespace);
    }

    getLogs = async (clusterId: string, userId: string, name: string, namespace: string = 'default', container?: string) => {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const podsClient = new PodsClient(kubeconfig);
        return await podsClient.getLogs(name, namespace, container);
    }

    restartPod = async (clusterId: string, userId: string, name: string, namespace: string = 'default') => {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const podsClient = new PodsClient(kubeconfig);
        return await podsClient.restartPod(name, namespace);
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
