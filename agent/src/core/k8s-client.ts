import * as k8s from '@kubernetes/client-node';
import axios from 'axios';

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
        try {
            let res: any;
            if (namespace === 'all') {
                res = await this.coreApi.listServiceForAllNamespaces();
            } else {
                try {
                    res = await (this.coreApi as any).listNamespacedService({ namespace });
                } catch {
                    res = await (this.coreApi as any).listNamespacedService(namespace);
                }
            }
            return this.extractItems(res);
        } catch (e) {
            console.log("getServices error:", e);
            return [];
        }
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
        const results = await Promise.allSettled([
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

        const [
            pods, nodes, deployments, services,
            namespaces, events, nodeMetrics, podMetrics,
            statefulsets, pvcs, configmaps, secrets, ingresses
        ] = results;

        results.forEach((res, i) => {
            if (res.status === 'rejected') {
                console.error(`Promise ${i} failed in getAggregatedStats:`, res.reason);
            }
        });

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

    async queryPrometheus(query: string, start?: string | number, end?: string | number, step: string = '1m', serviceName?: string, namespace?: string) {
        const targetNamespace = namespace || process.env.PROMETHEUS_NAMESPACE || 'monitoring';
        const endTs = end || Math.floor(Date.now() / 1000);
        const startTs = start || (Number(endTs) - 3600);

        // Method 1: Try Kubernetes API Server Proxy (Guaranteed across all CNI / DNS setups)
        const proxyServiceNames = [
            serviceName,
            'prometheus-kube-prometheus-prometheus',
            'prometheus-operated',
            'prometheus-prometheus',
            'prometheus-server',
            'prometheus'
        ].filter(Boolean) as string[];

        for (const sName of proxyServiceNames) {
            try {
                const cluster = this.kc.getCurrentCluster();
                const user = this.kc.getCurrentUser();
                
                if (cluster && cluster.server && user) {
                    const proxyUrl = `${cluster.server}/api/v1/namespaces/${targetNamespace}/services/http:${sName}:9090/proxy/api/v1/query_range`;
                    
                    const headers: Record<string, string> = {};
                    if (user.token) {
                        headers['Authorization'] = `Bearer ${user.token}`;
                    }

                    let httpsAgent;
                    const https = require('https');
                    httpsAgent = new https.Agent({
                        ca: cluster.caData ? Buffer.from(cluster.caData, 'base64') : undefined,
                        cert: user.certData ? Buffer.from(user.certData, 'base64') : undefined,
                        key: user.keyData ? Buffer.from(user.keyData, 'base64') : undefined,
                        rejectUnauthorized: false, // Inside pod: skip TLS domain verification for API server (10.96.0.1)
                    });

                    const response = await axios.get(proxyUrl, {
                        headers,
                        httpsAgent,
                        params: { query, start: startTs, end: endTs, step },
                        timeout: 5000
                    });

                    if (response.data) {
                        console.log(`Successfully queried Prometheus via K8s API Server Proxy (${sName})`);
                        return response.data;
                    }
                }
            } catch (proxyErr: any) {
                console.log(`Proxy attempt for ${sName} failed:`, proxyErr?.message || proxyErr);
            }
        }

        // Method 2: Fallback to Direct ClusterIP & In-Cluster DNS endpoints
        const candidates: string[] = [];
        const addCandidate = (name: string, ns: string, port: number | string = 9090) => {
            candidates.push(`http://${name}.${ns}.svc:${port}`);
            candidates.push(`http://${name}.${ns}:${port}`);
            candidates.push(`http://${name}.${ns}.svc.cluster.local:${port}`);
        };

        if (serviceName) {
            addCandidate(serviceName, targetNamespace, 9090);
            addCandidate(serviceName, targetNamespace, 8080);
        }

        for (const name of proxyServiceNames) {
            addCandidate(name, targetNamespace, 9090);
            addCandidate(name, targetNamespace, 8080);
        }

        // Dynamically discover all services in cluster & use their direct ClusterIP
        try {
            const allServices = await this.getServices('all');
            for (const svc of allServices) {
                const name = svc.metadata?.name;
                const ns = svc.metadata?.namespace || targetNamespace;
                const clusterIp = svc.spec?.clusterIP;

                if (name && (name.toLowerCase().includes('prometheus') || name.toLowerCase().includes('prom'))) {
                    const ports = svc.spec?.ports || [];
                    for (const p of ports) {
                        const portNum = p.port || 9090;
                        addCandidate(name, ns, portNum);
                        if (clusterIp && clusterIp !== 'None') {
                            candidates.push(`http://${clusterIp}:${portNum}`);
                        }
                    }
                    addCandidate(name, ns, 9090);
                    if (clusterIp && clusterIp !== 'None') {
                        candidates.push(`http://${clusterIp}:9090`);
                    }
                }
            }
        } catch (svcErr) {
            console.log("Could not discover services dynamically:", svcErr);
        }

        const uniqueCandidates = Array.from(new Set(candidates));
        let lastError: Error | null = null;

        for (const host of uniqueCandidates) {
            try {
                const res = await axios.get(`${host}/api/v1/query_range`, {
                    params: { query, start: startTs, end: endTs, step },
                    timeout: 3000
                });
                if (res.data) {
                    console.log(`Successfully connected to Prometheus at: ${host}`);
                    return res.data;
                }
            } catch (err: any) {
                lastError = err;
            }
        }

        throw new Error(`Failed to reach Prometheus service inside cluster (tested K8s API proxy + ${uniqueCandidates.length} endpoints). Last error: ${lastError?.message || 'ENOTFOUND'}`);
    }
}

export const k8sClient = new K8sClient();
