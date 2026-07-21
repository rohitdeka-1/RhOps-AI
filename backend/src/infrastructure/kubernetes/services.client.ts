import * as k8s from '@kubernetes/client-node';

export class ServicesClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    async listServices(namespace?: string) {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        if (!namespace || namespace === 'all') {
            const services = await coreApi.listServiceForAllNamespaces();
            return services.body.items;
        } else {
            const services = await coreApi.listNamespacedService(namespace);
            return services.body.items;
        }
    }

    async getService(name: string, namespace: string = 'default') {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const service = await coreApi.readNamespacedService(name, namespace);
        return service;
    }

    async deleteService(name: string, namespace: string = 'default') {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        await coreApi.deleteNamespacedService(name, namespace);
        return true;
    }

    async createService(namespace: string = 'default', body: k8s.V1Service) {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const response = await coreApi.createNamespacedService(namespace, body);
        return response.body;
    }

    async updateService(name: string, namespace: string = 'default', body: k8s.V1Service) {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const response = await coreApi.replaceNamespacedService(name, namespace, body);
        return response.body;
    }
}
