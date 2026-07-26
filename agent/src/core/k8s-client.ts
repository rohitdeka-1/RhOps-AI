// Force recompile
import * as k8s from '@kubernetes/client-node';

export class K8sClient {
    private kc: k8s.KubeConfig;
    private coreApi: k8s.CoreV1Api;
    private appsApi: k8s.AppsV1Api;
    private netApi: k8s.NetworkingV1Api;
    private customApi: k8s.CustomObjectsApi;
    private execApi: k8s.Exec;

    constructor() {
        this.kc = new k8s.KubeConfig();
        
        // When running inside a pod, this loads the service account token automatically
        if (process.env.KUBERNETES_SERVICE_HOST) {
            try {
                this.kc.loadFromCluster();
                console.log("Loaded in-cluster Kubernetes configuration.");
            } catch (e) {
                console.log("Error loading cluster config, falling back to default.");
                this.kc.loadFromDefault();
            }
        } else {
            console.log("Not running in a cluster. Falling back to default kubeconfig for local dev.");
            this.kc.loadFromDefault();
        }

        this.coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
        this.appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
        this.netApi = this.kc.makeApiClient(k8s.NetworkingV1Api);
        this.customApi = this.kc.makeApiClient(k8s.CustomObjectsApi);
        this.execApi = new k8s.Exec(this.kc);
    }

    private extractItems(res: any) {
        return res?.items || res?.body?.items || [];
    }

    async getPods(namespace: string = 'all') {
        const res: any = namespace === 'all' 
            ? await this.coreApi.listPodForAllNamespaces() 
            : await this.coreApi.listNamespacedPod({ namespace });
        return this.extractItems(res);
    }

    async getPod(name: string, namespace: string = 'default') {
        const res: any = await this.coreApi.readNamespacedPod({ name, namespace });
        return res?.body || res;
    }

    async deletePod(name: string, namespace: string = 'default') {
        await this.coreApi.deleteNamespacedPod({ name, namespace });
        return true;
    }

    async getNodes() {
        const res: any = await this.coreApi.listNode();
        return this.extractItems(res);
    }
    
    async getNode(name: string) {
        const res: any = await this.coreApi.readNode({ name });
        return res?.body || res;
    }

    async cordonNode(name: string, unschedulable: boolean) {
        const patch = [
            { op: 'replace', path: '/spec/unschedulable', value: unschedulable }
        ];
        const options = { headers: { 'Content-type': 'application/json-patch+json' } };
        await this.coreApi.patchNode({ name, body: patch }, options as any);
        return true;
    }

    async getDeployments(namespace: string = 'all') {
        const res: any = namespace === 'all' 
            ? await this.appsApi.listDeploymentForAllNamespaces() 
            : await this.appsApi.listNamespacedDeployment({ namespace });
        return this.extractItems(res);
    }

    async getServices(namespace: string = 'all') {
        const res: any = namespace === 'all' 
            ? await this.coreApi.listServiceForAllNamespaces() 
            : await this.coreApi.listNamespacedService({ namespace });
        return this.extractItems(res);
    }

    async getNamespaces() {
        const res: any = await this.coreApi.listNamespace();
        return this.extractItems(res);
    }

    async getEvents(namespace: string = 'all') {
        const res: any = namespace === 'all' 
            ? await this.coreApi.listEventForAllNamespaces() 
            : await this.coreApi.listNamespacedEvent({ namespace });
        return this.extractItems(res);
    }

    async getStatefulSets(namespace: string = 'all') {
        const res: any = namespace === 'all' 
            ? await this.appsApi.listStatefulSetForAllNamespaces() 
            : await this.appsApi.listNamespacedStatefulSet({ namespace });
        return this.extractItems(res);
    }

    async getPvcs(namespace: string = 'all') {
        const res: any = namespace === 'all' 
            ? await this.coreApi.listPersistentVolumeClaimForAllNamespaces() 
            : await this.coreApi.listNamespacedPersistentVolumeClaim({ namespace });
        return this.extractItems(res);
    }

    async getConfigMaps(namespace: string = 'all') {
        const res: any = namespace === 'all' 
            ? await this.coreApi.listConfigMapForAllNamespaces() 
            : await this.coreApi.listNamespacedConfigMap({ namespace });
        return this.extractItems(res);
    }

    async getSecrets(namespace: string = 'all') {
        const res: any = namespace === 'all' 
            ? await this.coreApi.listSecretForAllNamespaces() 
            : await this.coreApi.listNamespacedSecret({ namespace });
        return this.extractItems(res);
    }

    async getIngresses(namespace: string = 'all') {
        const res: any = namespace === 'all' 
            ? await this.netApi.listIngressForAllNamespaces() 
            : await this.netApi.listNamespacedIngress({ namespace });
        return this.extractItems(res);
    }

    async getNodeMetrics() {
        try {
            const res: any = await this.customApi.listClusterCustomObject({
                group: 'metrics.k8s.io',
                version: 'v1beta1',
                plural: 'nodes',
            });
            return res?.body?.items || res?.items || [];
        } catch (e) {
            console.log("Metrics Server may not be installed:", e);
            return [];
        }
    }

    async getPodMetrics(namespace: string = 'all') {
        try {
            const res: any = namespace === 'all' 
                ? await this.customApi.listClusterCustomObject({
                    group: 'metrics.k8s.io',
                    version: 'v1beta1',
                    plural: 'pods',
                  })
                : await this.customApi.listNamespacedCustomObject({
                    group: 'metrics.k8s.io',
                    version: 'v1beta1',
                    namespace,
                    plural: 'pods',
                  });
            return res?.body?.items || res?.items || [];
        } catch (e) {
            console.log("Metrics Server may not be installed:", e);
            return [];
        }
    }

    async getLogs(name: string, namespace: string = 'default', container?: string) {
        try {
            const logsRes: any = await this.coreApi.readNamespacedPodLog({ 
                name, 
                namespace, 
                container 
            });
            return logsRes?.body || logsRes;
        } catch (error: any) {
            return `Failed to fetch logs: ${error.message}`;
        }
    }

    async execCommand(name: string, namespace: string = 'default', command: string[], container?: string) {
        const { PassThrough } = require('stream');
        let outStr = '';
        let errStr = '';
        const outStream = new PassThrough();
        const errStream = new PassThrough();

        outStream.on('data', (chunk: any) => { outStr += chunk.toString(); });
        errStream.on('data', (chunk: any) => { errStr += chunk.toString(); });

        return new Promise((resolve, reject) => {
            this.execApi.exec(namespace, name, container || '', command, outStream, errStream, null, false, (status: any) => {
                if (status && status.status === 'Failure') {
                    reject(new Error(status.message));
                } else {
                    resolve({ stdout: outStr, stderr: errStr });
                }
            }).catch(reject);
        });
    }

    async getAggregatedStats() {
        const [
            pods, nodes, deployments, services,
            namespaces, events, nodeMetrics, podMetrics,
            statefulsets, pvcs, configmaps, secrets, ingresses
        ] = await Promise.allSettled([
            this.getPods('all'),
            this.getNodes(),
            this.getDeployments('all'),
            this.getServices('all'),
            this.getNamespaces(),
            this.getEvents('all'),
            this.getNodeMetrics(),
            this.getPodMetrics('all'),
            this.getStatefulSets('all'),
            this.getPvcs('all'),
            this.getConfigMaps('all'),
            this.getSecrets('all'),
            this.getIngresses('all')
        ]);

        return {
            pods: pods.status === 'fulfilled' ? pods.value : [],
            nodes: nodes.status === 'fulfilled' ? nodes.value : [],
            deployments: deployments.status === 'fulfilled' ? deployments.value : [],
            services: services.status === 'fulfilled' ? services.value : [],
            namespaces: namespaces.status === 'fulfilled' ? namespaces.value : [],
            events: events.status === 'fulfilled' ? events.value : [],
            nodeMetrics: nodeMetrics.status === 'fulfilled' ? nodeMetrics.value : [],
            podMetrics: podMetrics.status === 'fulfilled' ? podMetrics.value : [],
            statefulsets: statefulsets.status === 'fulfilled' ? statefulsets.value : [],
            pvcs: pvcs.status === 'fulfilled' ? pvcs.value : [],
            configmaps: configmaps.status === 'fulfilled' ? configmaps.value : [],
            secrets: secrets.status === 'fulfilled' ? secrets.value : [],
            ingresses: ingresses.status === 'fulfilled' ? ingresses.value : []
        };
    }
}

export const k8sClient = new K8sClient();
