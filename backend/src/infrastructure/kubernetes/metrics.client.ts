import * as k8s from '@kubernetes/client-node';

export class MetricsClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    async getNodeMetrics() {
        try {
            const metricsClient = new k8s.Metrics(this.kc);
            const metrics = await metricsClient.getNodeMetrics();
            return metrics;
        } catch (error: any) {
            return { kind: "NodeMetricsList", items: [] };
        }
    }

    async getPodMetrics(namespace: string = 'default') {
        const customObjectsApi = this.kc.makeApiClient(k8s.CustomObjectsApi);
        try {
            if (namespace === 'all') {
                const response = await customObjectsApi.listClusterCustomObject(
                    'metrics.k8s.io',
                    'v1beta1',
                    'pods'
                );
                return response.body;
            } else {
                const response = await customObjectsApi.listNamespacedCustomObject(
                    'metrics.k8s.io',
                    'v1beta1',
                    namespace,
                    'pods'
                );
                return response.body;
            }
        } catch (error: any) {
            return { kind: "PodMetricsList", items: [] };
        }
    }
}
