import { agentManager } from "../../agent/agent.manager";
import * as k8s from '@kubernetes/client-node';
import { SecretsClient } from "../../../infrastructure/kubernetes/secrets.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class CreateSecretService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async createSecret(clusterId: string, userId: string, namespace: string = 'default', body: k8s.V1Secret) {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        
        if (agentManager.isAgentConnected(clusterId)) {
            return await agentManager.executeTool(clusterId, 'create_secret', { namespace, body });
        }

        if (!cluster.kubeconfig) {
            throw new Error("Cluster is not connected via Agent and has no kubeconfig fallback.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const secretsClient = new SecretsClient(kubeconfig);
        return await secretsClient.createSecret(namespace, body);
    }
}
