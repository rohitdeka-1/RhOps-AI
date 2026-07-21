import * as k8s from '@kubernetes/client-node';

export class StatefulSetsClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    async listStatefulSets(namespace?: string) {
        const appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
        if (!namespace || namespace === 'all') {
            const sts = await appsApi.listStatefulSetForAllNamespaces();
            return sts.body.items;
        } else {
            const sts = await appsApi.listNamespacedStatefulSet(namespace);
            return sts.body.items;
        }
    }
}
