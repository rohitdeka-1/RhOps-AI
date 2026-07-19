import * as k8s from '@kubernetes/client-node';

export class NamespacesClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    async listNamespaces() {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const namespaces = await coreApi.listNamespace();
        return namespaces.body.items;
    }

    async getNamespace(name: string) {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const namespace = await coreApi.readNamespace(name);
        return namespace;
    }

    async createNamespace(name: string, labels: { [key: string]: string } = {}) {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const namespaceConfig: k8s.V1Namespace = {
            apiVersion: 'v1',
            kind: 'Namespace',
            metadata: {
                name: name,
                labels: labels,
            },
        };
        const result = await coreApi.createNamespace(namespaceConfig);
        return result;
    }

    async deleteNamespace(name: string) {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        await coreApi.deleteNamespace(name);
        return true;
    }
}
