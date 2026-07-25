import { LokiClient } from "../../../infrastructure/monitoring/loki.client";

export const lokiToolDefinition = {
    type: 'function',
    function: {
        name: 'query_loki',
        description: 'Executes a LogQL query against the cluster logs (Loki). Use this to search pod logs, check for errors, or troubleshoot crash loops.',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'The LogQL query to execute (e.g., {namespace="qrt", container="backend"} |= "error")'
                },
                limit: {
                    type: 'number',
                    description: 'Maximum number of log lines to return. Default is 50.'
                }
            },
            required: ['query']
        }
    }
};

export async function executeLokiTool(args: any, lokiClient: LokiClient | null): Promise<any> {
    if (!lokiClient) {
        return "Loki client not initialized. Cluster context may be missing.";
    }
    const end = (Date.now() * 1000000).toString(); // Loki wants nanoseconds
    const start = ((Date.now() - 3600 * 1000) * 1000000).toString();
    return await lokiClient.queryRange(args.query, start, end, args.limit || 50);
}
