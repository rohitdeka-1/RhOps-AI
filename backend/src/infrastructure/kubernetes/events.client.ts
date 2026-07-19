import * as k8s from '@kubernetes/client-node';

export class EventsClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    async listEvents(namespace?: string) {
        const coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        let events;
        
        if (namespace && namespace !== 'all') {
            events = await coreApi.listNamespacedEvent(namespace);
        } else {
            events = await coreApi.listEventForAllNamespaces();
        }
        
        return events.body.items;
    }
}
