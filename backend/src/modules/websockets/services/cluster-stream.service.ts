import { PodsClient } from "../../../infrastructure/kubernetes/pods.client";
import { NodesClient } from "../../../infrastructure/kubernetes/nodes.client";
import { DeploymentsClient } from "../../../infrastructure/kubernetes/deployments.client";
import { ServicesClient } from "../../../infrastructure/kubernetes/services.client";
import { NamespacesClient } from "../../../infrastructure/kubernetes/namespaces.client";
import { EventsClient } from "../../../infrastructure/kubernetes/events.client";
import { MetricsClient } from "../../../infrastructure/kubernetes/metrics.client";
import { StatefulSetsClient } from "../../../infrastructure/kubernetes/statefulsets.client";
import { PvcsClient } from "../../../infrastructure/kubernetes/pvcs.client";
import { ConfigMapsClient } from "../../../infrastructure/kubernetes/configmaps.client";
import { SecretsClient } from "../../../infrastructure/kubernetes/secrets.client";
import { IngressClient } from "../../../infrastructure/kubernetes/ingress.client";
import { ClusterRepository } from "../../clusters/repositories/cluster.repository";
import { decrypt } from "../../../utils/encryption.util";

export class ClusterStreamService {
    private clusterRepository: ClusterRepository;

    constructor() {
        this.clusterRepository = new ClusterRepository();
    }

    async getKubeconfig(clusterId: string, userId: string) {
        const cluster = await this.clusterRepository.findClusterByIdAndUserId(clusterId, userId);
        if (!cluster) {
            throw new Error("Cluster not found or permission denied");
        }
        return decrypt(cluster.kubeconfig);
    }

    async getAggregatedStats(kubeconfig: string) {
        const podsClient = new PodsClient(kubeconfig);
        const nodesClient = new NodesClient(kubeconfig);
        const deploymentsClient = new DeploymentsClient(kubeconfig);
        const servicesClient = new ServicesClient(kubeconfig);
        const namespacesClient = new NamespacesClient(kubeconfig);
        const eventsClient = new EventsClient(kubeconfig);
        const metricsClient = new MetricsClient(kubeconfig);
        const statefulsetsClient = new StatefulSetsClient(kubeconfig);
        const pvcsClient = new PvcsClient(kubeconfig);
        const configmapsClient = new ConfigMapsClient(kubeconfig);
        const secretsClient = new SecretsClient(kubeconfig);
        const ingressClient = new IngressClient(kubeconfig);

        // Fetch everything in parallel without crashing if one fails
        const [
            podsRes, nodesRes, deploymentsRes, servicesRes, 
            namespacesRes, eventsRes, nodeMetricsRes, podMetricsRes,
            stsRes, pvcsRes, configmapsRes, secretsRes, ingressRes
        ] = await Promise.allSettled([
            podsClient.listPods('all'),
            nodesClient.listNodes(),
            deploymentsClient.listDeployments('all'),
            servicesClient.listServices('all'),
            namespacesClient.listNamespaces(),
            eventsClient.listEvents('all'),
            metricsClient.getNodeMetrics(),
            metricsClient.getPodMetrics('all'),
            statefulsetsClient.listStatefulSets('all'),
            pvcsClient.listPvcs('all'),
            configmapsClient.listConfigMaps('all'),
            secretsClient.listSecrets('all'),
            ingressClient.listIngresses('all')
        ]);

        return {
            pods: podsRes.status === 'fulfilled' ? podsRes.value : [],
            nodes: nodesRes.status === 'fulfilled' ? nodesRes.value : [],
            deployments: deploymentsRes.status === 'fulfilled' ? deploymentsRes.value : [],
            services: servicesRes.status === 'fulfilled' ? servicesRes.value : [],
            namespaces: namespacesRes.status === 'fulfilled' ? namespacesRes.value : [],
            events: eventsRes.status === 'fulfilled' ? eventsRes.value : [],
            nodeMetrics: nodeMetricsRes.status === 'fulfilled' ? nodeMetricsRes.value : [],
            podMetrics: podMetricsRes.status === 'fulfilled' ? podMetricsRes.value : [],
            statefulsets: stsRes.status === 'fulfilled' ? stsRes.value : [],
            pvcs: pvcsRes.status === 'fulfilled' ? pvcsRes.value : [],
            configmaps: configmapsRes.status === 'fulfilled' ? configmapsRes.value : [],
            secrets: secretsRes.status === 'fulfilled' ? secretsRes.value : [],
            ingresses: ingressRes.status === 'fulfilled' ? ingressRes.value : []
        };
    }
}
