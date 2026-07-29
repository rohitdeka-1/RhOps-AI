# Chapter 1: The RhOps Agent Architecture

Welcome to the internal workings of RhOps AI's most powerful feature: the In-Cluster Agent.
This document provides a comprehensive, line-by-line breakdown of how the RhOps Backend and the RhOps Agent communicate securely without exposing user credentials.

---

## 1. The Core Philosophy (Push vs Pull)
Traditionally, observability tools require users to hand over their Kubernetes `kubeconfig`. The backend then "pulls" data from the internet directly into their cluster. 
This is a massive security risk.

The RhOps Agent uses a **Push Architecture**. 
The user installs a lightweight Node.js Agent inside their cluster. Because the Agent initiates an **outbound** WebSocket connection to the RhOps Backend, it seamlessly bypasses firewalls and NATs. The connection upgrades to a persistent, two-way tunnel.

---

## 2. The Agent Implementation (The Client)

### 2.1 Kubernetes Authentication (`agent/src/core/k8s-client.ts`)
When the Agent boots as a Pod inside Kubernetes, it uses the official `@kubernetes/client-node` SDK. 
```typescript
try {
    this.kc.loadFromCluster();
}
```
This single line is magic. It automatically locates the `/var/run/secrets/kubernetes.io/serviceaccount/token` file injected by Kubernetes. It uses this token to authenticate itself to the local API server, meaning it **never needs a Kubeconfig**.

### 2.2 The Secure Tunnel (`agent/src/core/websocket.ts`)
The Agent opens an outbound connection using `socket.io-client`:
```typescript
this.socket = io(this.backendUrl, {
    path: '/api/v1/agent/socket.io',
    auth: { token: this.clusterToken },
    reconnection: true, // Auto-heals if the internet drops
});
```
It listens for instructions from the AI:
```typescript
this.socket.on('execute_tool', async (data) => {
    // 1. Identify the tool (e.g., 'list_resources')
    // 2. Run the local Kubernetes API call
    // 3. Emit 'tool_response' back up the tunnel
});
```

---

## 3. The Backend Implementation (The Server)

### 3.1 The WebSocket Switchboard (`backend/src/plugins/socket.plugin.ts`)
The backend spins up a Socket.io server attached directly to Fastify.
When an Agent connects, the server verifies the `clusterToken`:
```typescript
io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    const cluster = await prisma.cluster.findUnique({ where: { id: token } });
    (socket as any).clusterId = cluster.id;
    next();
});
```

### 3.2 The Agent Manager (`backend/src/modules/agent/agent.manager.ts`)
The `AgentManager` acts as the traffic controller. It maintains a dictionary mapping `clusterId` to active `Socket` connections.
When the AI wants to run a tool, the Manager uses Promises to handle the asynchronous RPC call:
```typescript
async executeTool(clusterId, tool, args) {
    const socket = this.agents.get(clusterId);
    
    return new Promise((resolve, reject) => {
        // We generate a unique UUID for the request
        const requestId = uuidv4();
        
        // We listen for the Agent's specific reply
        this.pendingRequests.set(requestId, (response) => resolve(response.result));
        
        // We fire the command down the pipe
        socket.emit('execute_tool', { requestId, tool, args });
    });
}
```

---

## 4. The Data Flow (End-to-End Trace)
When a user types *"How many pods are running?"* into the RhOps Chat:

1. **AI Generation**: The `chat.service.ts` asks the LLM to generate a response. The LLM replies with a Tool Call for `list_resources`.
2. **Routing**: The `chat.service` intercepts the tool call. It checks `agentManager.isAgentConnected(clusterId)`.
3. **Transmission**: The `AgentManager` finds the open WebSocket and sends: `{ "tool": "list_resources" }`.
4. **Execution**: The Agent receives the event, triggers `k8sClient.getPods()`, and fetches the live data locally.
5. **Return**: The Agent fires the `{ "tool_response": [...] }` back up the WebSocket.
6. **Resolution**: The `AgentManager` Promise resolves with the data, feeds it back to the LLM, and the user gets their answer instantly!

---

## 5. Recent Architectural Updates

As the architecture evolved, several key optimizations were implemented to improve reliability and developer experience:

### 5.1 The ESBuild Bundler (`agent/package.json`)
The official `@kubernetes/client-node` library (v1.4.0) strictly uses ECMAScript Modules (ESM). Initially, building the agent with the standard TypeScript compiler (`tsc`) targeted CommonJS, which triggered fatal `ERR_REQUIRE_ESM` errors when Node.js attempted to run the production build.
To solve this cleanly without forcing the entire project into ESM mode, the agent's build system was upgraded to **esbuild**. Esbuild automatically analyzes and bundles all external dependencies (including ESM libraries) directly into a single, cohesive CommonJS output file, bypassing the runtime errors entirely.

### 5.2 Localhost Translation (`backend/src/modules/clusters/controllers/agent-install.controller.ts`)
To facilitate seamless local development using Docker Desktop, a dynamic URL translation mechanism was introduced.
If a developer requests the `install.yaml` manifest via `http://localhost:3000`, the backend detects `localhost` and automatically translates it to `host.docker.internal:3000` inside the generated YAML. This ensures that when the Agent Pod boots inside the local Kubernetes cluster, it knows how to break out of its container network and reach the host machine's backend, while retaining standard URL behavior for production deployments.

### 5.3 Graceful Disconnect Handling (`backend/src/plugins/socket.plugin.ts`)
In dynamic environments, clusters are frequently recreated or deleted. If a user deletes a cluster from the database while its Agent is still actively connected, the backend will inevitably receive a `disconnect` event when that Agent shuts down.
Previously, attempting to update the cluster's status to `INACTIVE` upon disconnect would trigger a massive Prisma `P2025: Record not found` error stack trace. The `disconnect` event listener was updated to specifically catch `P2025` errors and silently discard them, ensuring the server logs remain clean and actionable.
