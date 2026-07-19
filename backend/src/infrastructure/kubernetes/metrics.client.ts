import * as k8s from '@kubernetes/client-node';

export class MetricsClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    async getNodeMetrics() {
        const metricsClient = new k8s.Metrics(this.kc);
        const metrics = await metricsClient.getNodeMetrics();
        return metrics;
    }

    async getPodMetrics(namespace: string = 'default') {
        const customObjectsApi = this.kc.makeApiClient(k8s.CustomObjectsApi);
        try {
            // @kubernetes/client-node Metrics class doesn't always handle namespaced pods perfectly,
            // so we use CustomObjectsApi for robust raw data fetching.
            const response = await customObjectsApi.listNamespacedCustomObject(
                'metrics.k8s.io',
                'v1beta1',
                namespace,
                'pods'
            );
            return response.body;
        } catch (error) {
            throw new Error("Failed to fetch pod metrics. Ensure metrics-server is installed in the cluster.");
        }
    }
}
