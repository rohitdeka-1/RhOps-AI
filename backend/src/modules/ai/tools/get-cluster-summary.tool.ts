import { PodsClient } from "../../../infrastructure/kubernetes/pods.client";
import { DeploymentsClient } from "../../../infrastructure/kubernetes/deployments.client";
import { NodesClient } from "../../../infrastructure/kubernetes/nodes.client";

export const getClusterSummaryToolDefinition = {
    type: 'function',
    function: {
        name: 'get_cluster_summary',
        description: 'Gets a high-level summary of the cluster health and resource counts (nodes, pods, deployments).',
        parameters: {
            type: 'object',
            properties: {}
        }
    }
};

export async function executeGetClusterSummaryTool(args: any, kubeconfigString: string | null, allowedNamespaces: string[]): Promise<any> {
    if (!kubeconfigString) {
        return "Kubernetes context not initialized. Cluster config may be missing.";
    }

    try {
        const nodesClient = new NodesClient(kubeconfigString);
        const podsClient = new PodsClient(kubeconfigString);
        const depsClient = new DeploymentsClient(kubeconfigString);

        let nodes: any[] = [];
        try {
            nodes = await nodesClient.listNodes();
        } catch (e) {
            console.log("Could not fetch nodes, maybe lack of cluster permissions");
        }

        let namespacesToQuery = allowedNamespaces.includes('*') ? ['all'] : allowedNamespaces;

        let allPods: any[] = [];
        let allDeps: any[] = [];

        for (const ns of namespacesToQuery) {
            const pods = await podsClient.listPods(ns === 'all' ? undefined : ns);
            allPods = [...allPods, ...pods];

            const deps = await depsClient.listDeployments(ns === 'all' ? undefined : ns);
            allDeps = [...allDeps, ...deps];
        }

        const runningPods = allPods.filter(p => p.status?.phase === 'Running').length;
        const failedPods = allPods.filter(p => p.status?.phase === 'Failed' || p.status?.phase === 'CrashLoopBackOff').length;
        const pendingPods = allPods.filter(p => p.status?.phase === 'Pending').length;

        return {
            nodes: {
                total: nodes.length,
                ready: nodes.filter((n: any) => n.status?.conditions?.some((c: any) => c.type === 'Ready' && c.status === 'True')).length
            },
            pods: {
                total: allPods.length,
                running: runningPods,
                failed: failedPods,
                pending: pendingPods
            },
            deployments: {
                total: allDeps.length
            }
        };

    } catch (e: any) {
        return `Error getting cluster summary: ${e.message}`;
    }
}
