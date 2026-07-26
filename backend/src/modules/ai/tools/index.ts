import { prometheusToolDefinition, executePrometheusTool } from "./prometheus.tool";
import { lokiToolDefinition, executeLokiTool } from "./loki.tool";
import { listResourcesToolDefinition, executeListResourcesTool } from "./list-resources.tool";
import { getClusterSummaryToolDefinition, executeGetClusterSummaryTool } from "./get-cluster-summary.tool";
import { PrometheusClient } from "../../../infrastructure/monitoring/prometheus.client";
import { LokiClient } from "../../../infrastructure/monitoring/loki.client";

export const getToolDefinitions = () => {
    return [
        prometheusToolDefinition, 
        lokiToolDefinition,
        listResourcesToolDefinition,
        getClusterSummaryToolDefinition
    ];
};

export const executeTool = async (
    toolName: string, 
    argsStr: string, 
    promClient: PrometheusClient | null, 
    lokiClient: LokiClient | null,
    kubeconfigString: string | null = null,
    allowedNamespaces: string[] = ['*'],
    clusterId: string | null = null
): Promise<any> => {
    try {
        const args = JSON.parse(argsStr);
        if (toolName === 'query_prometheus') {
            return await executePrometheusTool(args, promClient);
        } else if (toolName === 'query_loki') {
            return await executeLokiTool(args, lokiClient);
        } else if (toolName === 'list_resources') {
            return await executeListResourcesTool(args, kubeconfigString, allowedNamespaces, clusterId);
        } else if (toolName === 'get_cluster_summary') {
            return await executeGetClusterSummaryTool(args, kubeconfigString, allowedNamespaces, clusterId);
        }
        return `Tool ${toolName} not supported.`;
    } catch (e: any) {
        return `Error executing tool ${toolName}: ${e.message}`;
    }
};
