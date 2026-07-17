import { encrypt } from "../../../utils/encryption.util";
import { ClusterRepository } from "../repositories/cluster.repository";
import { KubernetesClient } from "../../../infrastructure/kubernetes/kubernetes.client";

export class ConnectClusterService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async connect(data: {
        name: string;
        provider: string;
        projectId: string;
        kubeconfig: string;
        userId: string;
    }) {
        // 1. Initialize client, extract API server, and test connection
        const k8sClient = new KubernetesClient(data.kubeconfig);
        const apiServer = k8sClient.getApiServer();
        await k8sClient.testConnection();

        // 2. Encrypt the kubeconfig
        const encryptedKubeconfig = encrypt(data.kubeconfig);

        // 3. Save to database
        const cluster = await this.clusterRepository.createCluster({
            name: data.name,
            provider: data.provider,
            projectId: data.projectId,
            apiServer: apiServer,
            kubeconfig: encryptedKubeconfig,
            userId: data.userId
        });

        // 4. Return created cluster details (excluding kubeconfig for security)
        const { kubeconfig, ...clusterWithoutKubeconfig } = cluster;
        return clusterWithoutKubeconfig;
    }
}
