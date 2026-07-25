import { PrometheusClient } from "../../../infrastructure/monitoring/prometheus.client";

export const prometheusToolDefinition = {
    type: 'function',
    function: {
        name: 'query_prometheus',
        description: 'Executes a PromQL query against the cluster metrics (Prometheus). Use this to check CPU, Memory, network, or other metrics.',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'The PromQL query to execute (e.g., sum(node_memory_MemFree_bytes))'
                },
                step: {
                    type: 'string',
                    description: 'Step resolution (e.g., "1m", "5m"). Default is "1m".'
                }
            },
            required: ['query']
        }
    }
};

export async function executePrometheusTool(args: any, promClient: PrometheusClient | null): Promise<any> {
    if (!promClient) {
        return "Prometheus client not initialized. Cluster context may be missing.";
    }
    const end = Math.floor(Date.now() / 1000);
    const start = end - 3600; 
    return await promClient.queryRange(args.query, start, end, args.step || '1m');
}
