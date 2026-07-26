import { agentManager } from "../../agent/agent.manager";
import { SecretsClient } from "../../../infrastructure/kubernetes/secrets.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class GetSecretService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async getSecret(clusterId: string, userId: string, name: string, namespace: string = 'default') {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        
        if (agentManager.isAgentConnected(clusterId)) {
            return await agentManager.executeTool(clusterId, 'get_secret', { name, namespace });
        }

        if (!cluster.kubeconfig) {
            throw new Error("Cluster is not connected via Agent and has no kubeconfig fallback.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const secretsClient = new SecretsClient(kubeconfig);
        return await secretsClient.getSecret(name, namespace);
    }
}
