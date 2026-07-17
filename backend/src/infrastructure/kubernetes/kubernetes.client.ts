import * as k8s from '@kubernetes/client-node';

export class KubernetesClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    /**
     * Extracts the API Server URL from the kubeconfig
     */
    getApiServer(): string {
        const currentCluster = this.kc.getCurrentCluster();
        if (currentCluster && currentCluster.server) {
            return currentCluster.server;
        }
        throw new Error("Could not extract API server from the provided kubeconfig.");
    }

    /**
     * Tests the cluster connection by calling the Version API
     */
    async testConnection(): Promise<void> {
        try {
            const versionApi = this.kc.makeApiClient(k8s.VersionApi);
            await versionApi.getCode();
        } catch (error: any) {
            throw new Error(`Failed to connect to the cluster. Error: ${error.message}`);
        }
    }

    async listNamespaces() {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const namespaces = await coreApi.listNamespace();
        return namespaces.body.items;
    }

}