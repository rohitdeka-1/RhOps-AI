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

import { agentManager } from "../../agent/agent.manager";

export async function executeGetClusterSummaryTool(args: any, kubeconfigString: string | null, allowedNamespaces: string[], clusterId: string | null = null): Promise<any> {
    if (clusterId && agentManager.isAgentConnected(clusterId)) {
        try {
            const stats = await agentManager.executeTool(clusterId, 'get_aggregated_stats', {});
            return {
                nodes: {
                    total: stats.nodes?.length || 0,
                    ready: stats.nodes?.filter((n: any) => n.status?.conditions?.some((c: any) => c.type === 'Ready' && c.status === 'True')).length || 0
                },
                pods: {
                    total: stats.pods?.length || 0,
                    running: stats.pods?.filter((p: any) => p.status?.phase === 'Running').length || 0,
                    failed: stats.pods?.filter((p: any) => p.status?.phase === 'Failed' || p.status?.phase === 'CrashLoopBackOff').length || 0,
                    pending: stats.pods?.filter((p: any) => p.status?.phase === 'Pending').length || 0
                },
                deployments: {
                    total: stats.deployments?.length || 0
                }
            };
        } catch (e: any) {
            return `Error getting cluster summary via agent: ${e.message}`;
        }
    }

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
