import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

class AgentManager {
    // Maps clusterId -> Socket instance
    private agents: Map<string, Socket> = new Map();
    // Maps requestId -> Promise resolve function
    private pendingRequests: Map<string, (result: any) => void> = new Map();

    /**
     * Registers a new agent connection.
     */
    registerAgent(clusterId: string, socket: Socket) {
        this.agents.set(clusterId, socket);
        console.log(`Agent registered for cluster: ${clusterId}`);

        socket.on('disconnect', () => {
            console.log(`Agent disconnected for cluster: ${clusterId}`);
            this.agents.delete(clusterId);
        });

        // Listen for tool responses
        socket.on('tool_response', (data: { requestId: string, status: string, result: any }) => {
            const resolver = this.pendingRequests.get(data.requestId);
            if (resolver) {
                resolver(data);
                this.pendingRequests.delete(data.requestId);
            }
        });
    }

    /**
     * Checks if an agent is currently connected for a specific cluster.
     */
    isAgentConnected(clusterId: string): boolean {
        return this.agents.has(clusterId);
    }

    /**
     * Executes a tool remotely on the connected agent via WebSocket RPC.
     */
    async executeTool(clusterId: string, tool: string, args: any, timeoutMs: number = 30000): Promise<any> {
        const socket = this.agents.get(clusterId);
        if (!socket) {
            throw new Error(`Agent not connected for cluster ${clusterId}`);
        }

        const requestId = uuidv4();

        return new Promise((resolve, reject) => {
            // Set timeout
            const timer = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                reject(new Error(`Agent execution timeout for tool: ${tool}`));
            }, timeoutMs);

            // Register callback
            this.pendingRequests.set(requestId, (response: any) => {
                clearTimeout(timer);
                if (response.result?.status === 'success') {
                    resolve(response.result.data);
                } else {
                    reject(new Error(`Agent Error: ${response.result?.error || 'Unknown error'}`));
                }
            });

            // Send request to agent
            socket.emit('execute_tool', { requestId, tool, args });
        });
    }
}

export const agentManager = new AgentManager();
