import { prometheusToolDefinition, executePrometheusTool } from "./prometheus.tool";
import { lokiToolDefinition, executeLokiTool } from "./loki.tool";
import { PrometheusClient } from "../../../infrastructure/monitoring/prometheus.client";
import { LokiClient } from "../../../infrastructure/monitoring/loki.client";

export const getToolDefinitions = () => {
    return [prometheusToolDefinition, lokiToolDefinition];
};

export const executeTool = async (
    toolName: string, 
    argsStr: string, 
    promClient: PrometheusClient | null, 
    lokiClient: LokiClient | null
): Promise<any> => {
    try {
        const args = JSON.parse(argsStr);
        if (toolName === 'query_prometheus') {
            return await executePrometheusTool(args, promClient);
        } else if (toolName === 'query_loki') {
            return await executeLokiTool(args, lokiClient);
        }
        return `Tool ${toolName} not supported.`;
    } catch (e: any) {
        return `Error executing tool ${toolName}: ${e.message}`;
    }
};
