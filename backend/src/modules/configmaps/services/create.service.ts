import { agentManager } from "../../agent/agent.manager";
import * as k8s from '@kubernetes/client-node';
import { ConfigMapsClient } from "../../../infrastructure/kubernetes/configmaps.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class CreateConfigMapService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async createConfigMap(clusterId: string, userId: string, namespace: string = 'default', body: k8s.V1ConfigMap) {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or you do not have permission to access it.");
        }
        
        if (agentManager.isAgentConnected(clusterId)) {
            return await agentManager.executeTool(clusterId, 'create_configmap', { namespace, body });
        }

        if (!cluster.kubeconfig) {
            throw new Error("Cluster is not connected via Agent and has no kubeconfig fallback.");
        }
        const kubeconfig = decrypt(cluster.kubeconfig);
        const configMapsClient = new ConfigMapsClient(kubeconfig);
        return await configMapsClient.createConfigMap(namespace, body);
    }
}
