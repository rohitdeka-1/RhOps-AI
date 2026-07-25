import * as k8s from '@kubernetes/client-node';
import axios from 'axios';
import https from 'https';

export class LokiClient {
    private kc: k8s.KubeConfig;

    constructor(kubeconfigString: string) {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromString(kubeconfigString);
    }

    /**
     * Executes a LogQL query against a Loki service inside the cluster
     */
    async queryRange(
        query: string,
        start: string | number,
        end: string | number,
        limit: number = 100,
        serviceName: string = 'loki',
        namespace: string = 'monitoring'
    ) {
        const cluster = this.kc.getCurrentCluster();
        const user = this.kc.getCurrentUser();
        
        if (!cluster || !user) {
            throw new Error('Invalid kubeconfig: Missing cluster or user information.');
        }

        // We construct the proxy path for the Kubernetes API Server
        const path = `/api/v1/namespaces/${namespace}/services/http:${serviceName}:3100/proxy/loki/api/v1/query_range`;
        const server = cluster.server;
        
        const url = `${server}${path}`;

        // Construct headers for authentication to API server
        const headers: Record<string, string> = {};
        
        if (user.token) {
            headers['Authorization'] = `Bearer ${user.token}`;
        }
        
        const httpsAgent = new https.Agent({
            ca: cluster.caData ? Buffer.from(cluster.caData, 'base64') : undefined,
            cert: user.certData ? Buffer.from(user.certData, 'base64') : undefined,
            key: user.keyData ? Buffer.from(user.keyData, 'base64') : undefined,
            rejectUnauthorized: cluster.skipTLSVerify === true ? false : true,
        });

        const params = {
            query,
            start: start.toString(),
            end: end.toString(),
            limit: limit.toString()
        };

        const response = await axios.get(url, {
            headers,
            params,
            httpsAgent
        });

        return response.data;
    }
}
