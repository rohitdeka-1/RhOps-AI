import * as k8s from '@kubernetes/client-node';

export class IngressClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    async listIngresses(namespace: string = 'default') {
        const networkingApi = this.kc.makeApiClient(k8s.NetworkingV1Api);
        const ingresses = await networkingApi.listNamespacedIngress(namespace);
        return ingresses.body.items;
    }

    async getIngress(name: string, namespace: string = 'default') {
        const networkingApi = this.kc.makeApiClient(k8s.NetworkingV1Api);
        const ingress = await networkingApi.readNamespacedIngress(name, namespace);
        return ingress.body;
    }

    async createIngress(namespace: string = 'default', body: k8s.V1Ingress) {
        const networkingApi = this.kc.makeApiClient(k8s.NetworkingV1Api);
        const result = await networkingApi.createNamespacedIngress(namespace, body);
        return result.body;
    }

    async deleteIngress(name: string, namespace: string = 'default') {
        const networkingApi = this.kc.makeApiClient(k8s.NetworkingV1Api);
        await networkingApi.deleteNamespacedIngress(name, namespace);
        return true;
    }

    async updateIngress(name: string, namespace: string = 'default', body: k8s.V1Ingress) {
        const networkingApi = this.kc.makeApiClient(k8s.NetworkingV1Api);
        const result = await networkingApi.replaceNamespacedIngress(name, namespace, body);
        return result.body;
    }
}
