import { io, Socket } from 'socket.io-client'; // Trigger reload!
import dotenv from 'dotenv';
import { k8sClient } from './k8s-client';

dotenv.config({ override: true });

export class WebSocketClient {
    private socket: Socket;
    private backendUrl: string;
    private clusterToken: string;

    constructor() {
        this.backendUrl = process.env.RHOPS_BACKEND_URL || 'http://localhost:3000';
        this.clusterToken = process.env.RHOPS_CLUSTER_TOKEN || '';

        if (!this.clusterToken) {
            console.error("CRITICAL: RHOPS_CLUSTER_TOKEN is missing. The agent cannot authenticate with the backend.");
            process.exit(1);
        }

        console.log(`Connecting to RhOps Backend at ${this.backendUrl}...`);

        this.socket = io(this.backendUrl, {
            path: '/api/v1/agent/socket.io',
            auth: {
                token: this.clusterToken
            },
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        this.setupListeners();
    }

    private setupListeners() {
        this.socket.on('connect', () => {
            console.log('Successfully connected to RhOps Backend!');
        });

        this.socket.on('disconnect', (reason) => {
            console.log(`Disconnected from backend. Reason: ${reason}`);
        });

        this.socket.on('connect_error', (err) => {
            console.error(`Connection error: ${err.message}`);
        });

        // The backend will send an "execute_tool" event
        this.socket.on('execute_tool', async (data: { requestId: string, tool: string, args: any }) => {
            console.log(`Received execute_tool request [${data.requestId}] for tool: ${data.tool}`);

            let result: any;
            try {
                const { args } = data;
                switch (data.tool) {
                    case 'get_aggregated_stats':
                        result = await k8sClient.getAggregatedStats();
                        break;
                    case 'list_pods':
                        result = await k8sClient.getPods(args?.namespace);
                        break;
                    case 'get_pod':
                        result = await k8sClient.getPod(args?.name, args?.namespace);
                        break;
                    case 'delete_pod':
                        result = await k8sClient.deletePod(args?.name, args?.namespace);
                        break;
                    case 'list_nodes':
                        result = await k8sClient.getNodes();
                        break;
                    case 'get_node':
                        result = await k8sClient.getNode(args?.name);
                        break;
                    case 'cordon_node':
                        result = await k8sClient.cordonNode(args?.name, args?.unschedulable);
                        break;
                    case 'list_deployments':
                        result = await k8sClient.getDeployments(args?.namespace);
                        break;
                    case 'list_services':
                        result = await k8sClient.getServices(args?.namespace);
                        break;
                    case 'list_namespaces':
                        result = await k8sClient.getNamespaces();
                        break;
                    case 'list_events':
                        result = await k8sClient.getEvents(args?.namespace);
                        break;
                    case 'list_statefulsets':
                        result = await k8sClient.getStatefulSets(args?.namespace);
                        break;
                    case 'list_pvcs':
                        result = await k8sClient.getPvcs(args?.namespace);
                        break;
                    case 'list_configmaps':
                        result = await k8sClient.getConfigMaps(args?.namespace);
                        break;
                    case 'list_secrets':
                        result = await k8sClient.getSecrets(args?.namespace);
                        break;
                    case 'list_ingresses':
                        result = await k8sClient.getIngresses(args?.namespace);
                        break;
                    case 'get_node_metrics':
                        result = await k8sClient.getNodeMetrics();
                        break;
                    case 'get_pod_metrics':
                        result = await k8sClient.getPodMetrics(args?.namespace);
                        break;
                    case 'get_logs':
                        result = await k8sClient.getLogs(args?.name, args?.namespace, args?.container);
                        break;
                    case 'exec_command':
                        result = await k8sClient.execCommand(args?.name, args?.namespace, args?.command, args?.container);
                        break;
                    default:
                        throw new Error(`Tool ${data.tool} is not supported by the agent.`);
                }

                this.socket.emit('tool_response', {
                    requestId: data.requestId,
                    result: { status: 'success', data: result }
                });
            } catch (err: any) {
                console.error(`Error executing tool ${data.tool}:`, err);
                this.socket.emit('tool_response', {
                    requestId: data.requestId,
                    result: { status: 'error', error: err.message }
                });
            }
        });
    }
}

export const wsClient = new WebSocketClient();
