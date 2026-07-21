import * as k8s from '@kubernetes/client-node';

export class SecretsClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    async listSecrets(namespace?: string) {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        if (!namespace || namespace === 'all') {
            const secrets = await coreApi.listSecretForAllNamespaces();
            // User requested to fetch Secrets metadata only (no values). We should sanitize them.
            const sanitized = secrets.body.items.map(s => {
                delete s.data; // Remove base64 data
                delete s.stringData;
                return s;
            });
            return sanitized;
        } else {
            const secrets = await coreApi.listNamespacedSecret(namespace);
            const sanitized = secrets.body.items.map(s => {
                delete s.data;
                delete s.stringData;
                return s;
            });
            return sanitized;
        }
    }

    async getSecret(name: string, namespace: string = 'default') {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const secret = await coreApi.readNamespacedSecret(name, namespace);
        return secret.body;
    }

    async createSecret(namespace: string = 'default', body: k8s.V1Secret) {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const result = await coreApi.createNamespacedSecret(namespace, body);
        return result.body;
    }

    async updateSecret(name: string, namespace: string = 'default', body: k8s.V1Secret) {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const result = await coreApi.replaceNamespacedSecret(name, namespace, body);
        return result.body;
    }

    async deleteSecret(name: string, namespace: string = 'default') {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        await coreApi.deleteNamespacedSecret(name, namespace);
        return true;
    }
}
