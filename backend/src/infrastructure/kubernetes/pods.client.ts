import * as k8s from '@kubernetes/client-node';

export class PodsClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    async listPods(namespace: string = 'default') {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        const pods = await coreApi.listNamespacedPod(namespace);
        return pods.items;
    }
}
