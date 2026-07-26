import { agentManager } from "../../agent/agent.manager";
import { ConfigMapsClient } from "../../../infrastructure/kubernetes/configmaps.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class DeleteConfigMapService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async deleteConfigMap(clusterId: string, userId: string, name: string, namespace: string = 'default') {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        
        if (agentManager.isAgentConnected(clusterId)) {
            return await agentManager.executeTool(clusterId, 'delete_configmap', { name, namespace });
        }

        if (!cluster.kubeconfig) {
            throw new Error("Cluster is not connected via Agent and has no kubeconfig fallback.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const configMapsClient = new ConfigMapsClient(kubeconfig);
        return await configMapsClient.deleteConfigMap(name, namespace);
    }
}
