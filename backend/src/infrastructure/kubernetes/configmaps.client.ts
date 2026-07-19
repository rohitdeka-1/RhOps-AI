import * as k8s from '@kubernetes/client-node';

export class ConfigMapsClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    async listConfigMaps(namespace: string = 'default') {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const configmaps = await coreApi.listNamespacedConfigMap(namespace);
        return configmaps.body.items;
    }

    async getConfigMap(name: string, namespace: string = 'default') {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const configmap = await coreApi.readNamespacedConfigMap(name, namespace);
        return configmap.body;
    }

    async createConfigMap(namespace: string = 'default', body: k8s.V1ConfigMap) {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const result = await coreApi.createNamespacedConfigMap(namespace, body);
        return result.body;
    }

    async updateConfigMap(name: string, namespace: string = 'default', body: k8s.V1ConfigMap) {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const result = await coreApi.replaceNamespacedConfigMap(name, namespace, body);
        return result.body;
    }

    async deleteConfigMap(name: string, namespace: string = 'default') {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        await coreApi.deleteNamespacedConfigMap(name, namespace);
        return true;
    }
}
