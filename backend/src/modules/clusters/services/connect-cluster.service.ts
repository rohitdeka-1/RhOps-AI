import { encrypt } from "../../../utils/encryption.util";
import { ClusterRepository } from "../repositories/cluster.repository";

export class ConnectClusterService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async connect(data: {
        name: string;
        provider: string;
        kubeconfig: string;
        userId: string;
    }) {
        let apiServer = "";

        // 1. Test the connection & Extract API Server
        try {
            const k8s = await import('@kubernetes/client-node');
            const kc = new k8s.KubeConfig();
            kc.loadFromString(data.kubeconfig);

            const currentCluster = kc.getCurrentCluster();
            if (currentCluster && currentCluster.server) {
                apiServer = currentCluster.server;
            } else {
                throw new Error("Could not extract API server from the provided kubeconfig.");
            }

            // Getting the server version is a lightweight way to test connectivity and authentication
            const versionApi = kc.makeApiClient(k8s.VersionApi);
            await versionApi.getCode();
        } catch (error: any) {
            throw new Error(`Failed to connect to the cluster. Error: ${error.message}`);
        }

        // 2. Encrypt the kubeconfig
        const encryptedKubeconfig = encrypt(data.kubeconfig);

        // 3. Save to database
        const cluster = await this.clusterRepository.createCluster({
            name: data.name,
            provider: data.provider,
            apiServer: apiServer,
            kubeconfig: encryptedKubeconfig,
            userId: data.userId
        });

        // 4. Return created cluster details (excluding kubeconfig for security)
        const { kubeconfig, ...clusterWithoutKubeconfig } = cluster;
        return clusterWithoutKubeconfig;
    }
}
