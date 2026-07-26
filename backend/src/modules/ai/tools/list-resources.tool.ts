import { PodsClient } from "../../../infrastructure/kubernetes/pods.client";
import { DeploymentsClient } from "../../../infrastructure/kubernetes/deployments.client";
import { ServicesClient } from "../../../infrastructure/kubernetes/services.client";

export const listResourcesToolDefinition = {
    type: 'function',
    function: {
        name: 'list_resources',
        description: 'Lists Kubernetes resources (Pods, Deployments, Services) in the cluster. You can optionally filter by namespace.',
        parameters: {
            type: 'object',
            properties: {
                kind: {
                    type: 'string',
                    description: 'The kind of resource to list (e.g., "Pod", "Deployment", "Service")'
                },
                namespace: {
                    type: 'string',
                    description: 'Optional namespace to filter by. If omitted, resources across all allowed namespaces will be listed.'
                }
            },
            required: ['kind']
        }
    }
};

import { agentManager } from "../../agent/agent.manager";

export async function executeListResourcesTool(args: any, kubeconfigString: string | null, allowedNamespaces: string[], clusterId: string | null = null): Promise<any> {
    if (clusterId && agentManager.isAgentConnected(clusterId)) {
        try {
            let resources = [];
            switch (args.kind.toLowerCase()) {
                case 'pod':
                case 'pods':
                    resources = await agentManager.executeTool(clusterId, 'list_pods', { namespace: args.namespace });
                    break;
                case 'deployment':
                case 'deployments':
                    resources = await agentManager.executeTool(clusterId, 'list_deployments', { namespace: args.namespace });
                    break;
                case 'service':
                case 'services':
                    resources = await agentManager.executeTool(clusterId, 'list_services', { namespace: args.namespace });
                    break;
                default:
                    return `Error: Resource kind '${args.kind}' is not supported yet by this tool.`;
            }
            
            const formatted = resources.map((r: any) => ({
                name: r.metadata?.name,
                namespace: r.metadata?.namespace,
                status: r.status?.phase || (r.status?.conditions ? r.status.conditions.map((c:any) => c.type).join(',') : 'Unknown'),
                createdAt: r.metadata?.creationTimestamp
            }));

            return {
                kind: args.kind,
                count: formatted.length,
                items: formatted
            };
        } catch (e: any) {
            return `Error listing resources via agent: ${e.message}`;
        }
    }

    if (!kubeconfigString) {
        return "Kubernetes context not initialized. Cluster config may be missing.";
    }

    try {
        let namespacesToQuery: string[] = [];
        
        // Handle namespace filtering based on project allowed namespaces
        if (args.namespace) {
            if (allowedNamespaces.includes('*') || allowedNamespaces.includes(args.namespace)) {
                namespacesToQuery = [args.namespace];
            } else {
                return `Error: You do not have permission to view the namespace '${args.namespace}'.`;
            }
        } else {
            // If no namespace provided, and allowed is '*' we can query 'all'.
            // Otherwise, we query each allowed namespace.
            if (allowedNamespaces.includes('*')) {
                namespacesToQuery = ['all'];
            } else {
                namespacesToQuery = allowedNamespaces;
            }
        }

        let allResources: any[] = [];
        
        for (const ns of namespacesToQuery) {
            let resources = [];
            
            switch (args.kind.toLowerCase()) {
                case 'pod':
                case 'pods':
                    const podsClient = new PodsClient(kubeconfigString);
                    resources = await podsClient.listPods(ns === 'all' ? undefined : ns);
                    break;
                case 'deployment':
                case 'deployments':
                    const depsClient = new DeploymentsClient(kubeconfigString);
                    resources = await depsClient.listDeployments(ns === 'all' ? undefined : ns);
                    break;
                case 'service':
                case 'services':
                    const svcClient = new ServicesClient(kubeconfigString);
                    resources = await svcClient.listServices(ns === 'all' ? undefined : ns);
                    break;
                default:
                    return `Error: Resource kind '${args.kind}' is not supported yet by this tool.`;
            }
            
            // Format resources to be concise for the LLM
            const formatted = resources.map((r: any) => ({
                name: r.metadata.name,
                namespace: r.metadata.namespace,
                status: r.status?.phase || (r.status?.conditions ? r.status.conditions.map((c:any) => c.type).join(',') : 'Unknown'),
                createdAt: r.metadata.creationTimestamp
            }));

            allResources = [...allResources, ...formatted];
        }

        return {
            kind: args.kind,
            count: allResources.length,
            items: allResources
        };

    } catch (e: any) {
        return `Error listing resources: ${e.message}`;
    }
}
