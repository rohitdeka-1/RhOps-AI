# AI Assistant Architecture

The RhOps AI Assistant provides an intelligent, context-aware chatbot interface to manage, debug, and monitor Kubernetes clusters. It uses the OpenAI API equipped with specialized tools to read cluster logs and metrics dynamically.

## Core Components

1. **OpenAI Client (`openai.client.ts`)**
   - Configures the OpenAI SDK.
   - Defines standard cluster tools:
     - `query_prometheus`: Runs PromQL against the cluster's monitoring stack.
     - `query_loki`: Runs LogQL against the cluster's logging stack.

2. **Monitoring Clients (`loki.client.ts`, `prometheus.client.ts`)**
   - Proxy queries through the Kubernetes API server directly into the in-cluster monitoring services.
   - Requires valid `KubeConfig` loaded for the specific cluster context.

3. **AI Service (`ai.service.ts`)**
   - Fetches historical `ChatMessage` entities to provide conversational context.
   - Combines user prompts with the history.
   - Routes tool calls (e.g., if the AI asks to `query_loki`, the service executes it via `LokiClient` and returns the result back to the AI loop).

4. **Database Models**
   - `ChatSession`: Represents a distinct conversation thread.
   - `ChatMessage`: Stores individual messages (User, Assistant, System).
