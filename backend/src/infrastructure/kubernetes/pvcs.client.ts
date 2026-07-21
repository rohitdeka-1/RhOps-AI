import * as k8s from '@kubernetes/client-node';

export class PvcsClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    async listPvcs(namespace?: string) {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        if (!namespace || namespace === 'all') {
            const pvcs = await coreApi.listPersistentVolumeClaimForAllNamespaces();
            return pvcs.body.items;
        } else {
            const pvcs = await coreApi.listNamespacedPersistentVolumeClaim(namespace);
            return pvcs.body.items;
        }
    }
}
