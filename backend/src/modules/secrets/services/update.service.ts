import { agentManager } from "../../agent/agent.manager";
import * as k8s from '@kubernetes/client-node';
import { SecretsClient } from "../../../infrastructure/kubernetes/secrets.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class UpdateSecretService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async updateSecret(clusterId: string, userId: string, name: string, namespace: string = 'default', body: k8s.V1Secret) {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        
        if (agentManager.isAgentConnected(clusterId)) {
            return await agentManager.executeTool(clusterId, 'update_secret', { name, namespace, body });
        }

        if (!cluster.kubeconfig) {
            throw new Error("Cluster is not connected via Agent and has no kubeconfig fallback.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const secretsClient = new SecretsClient(kubeconfig);
        return await secretsClient.updateSecret(name, namespace, body);
    }
}
