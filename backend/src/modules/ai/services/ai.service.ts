import { prisma } from "../../../config/prisma";
import { OpenAIClient } from "../../../infrastructure/ai/openai.client";
import { PrometheusClient } from "../../../infrastructure/monitoring/prometheus.client";
import { LokiClient } from "../../../infrastructure/monitoring/loki.client";

export class AiService {
    private openaiClient: OpenAIClient | null = null;

    private getOpenAiClient() {
        if (!this.openaiClient) {
            this.openaiClient = new OpenAIClient();
        }
        return this.openaiClient;
    }

    async handleChat(userId: string, clusterId: string | null, sessionId: string | null, message: string) {
        // 1. Ensure a session exists
        let session;
        if (sessionId) {
            session = await prisma.chatSession.findUnique({
                where: { id: sessionId },
                include: { messages: { orderBy: { createdAt: 'asc' } } }
            });
            if (!session) {
                throw new Error("Chat session not found");
            }
        } else {
            session = await prisma.chatSession.create({
                data: {
                    title: message.substring(0, 50),
                    userId,
                    clusterId,
                },
                include: { messages: true }
            });
        }

        // 2. Save user message
        await prisma.chatMessage.create({
            data: {
                sessionId: session.id,
                role: "USER",
                content: message
            }
        });

        // 3. Build context for OpenAI
        const messages = session.messages.map(msg => ({
            role: msg.role === "USER" ? "user" : "assistant",
            content: msg.content
        })) as any[];

        // Append the new user message
        messages.push({ role: 'user', content: message });

        let systemPrompt = `You are the RhOps AI Assistant, a Kubernetes cluster expert.
You help operators manage, debug, and understand their clusters.
Use tools when requested to pull real-time metrics and logs from the cluster.`;

        // 4. Initialize monitoring clients if clusterId is provided
        let promClient: PrometheusClient | null = null;
        let lokiClient: LokiClient | null = null;

        if (clusterId) {
            const cluster = await prisma.cluster.findUnique({ where: { id: clusterId } });
            if (cluster) {
                systemPrompt += `\nYou are currently connected to cluster: ${cluster.name}.`;
                promClient = new PrometheusClient(cluster.kubeconfig);
                lokiClient = new LokiClient(cluster.kubeconfig);
            }
        }

        const openAiMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];

        // 5. Call OpenAI
        const openAi = this.getOpenAiClient();
        let response = await openAi.chatCompletion(openAiMessages);
        let responseMessage = response.choices[0].message;

        // 6. Handle tool calls
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            const toolOutputs = [];
            for (const toolCall of responseMessage.tool_calls) {
                if (toolCall.type !== 'function') continue;
                if (toolCall.function.name === 'query_prometheus' && promClient) {
                    try {
                        const args = JSON.parse(toolCall.function.arguments);
                        // Default to last 1 hour
                        const end = Math.floor(Date.now() / 1000);
                        const start = end - 3600; 
                        const result = await promClient.queryRange(args.query, start, end, args.step || '1m');
                        toolOutputs.push({ toolCallId: toolCall.id, result });
                    } catch (e: any) {
                        toolOutputs.push({ toolCallId: toolCall.id, result: `Error executing PromQL: ${e.message}` });
                    }
                } else if (toolCall.function.name === 'query_loki' && lokiClient) {
                    try {
                        const args = JSON.parse(toolCall.function.arguments);
                        const end = (Date.now() * 1000000).toString(); // Loki wants nanoseconds
                        const start = ((Date.now() - 3600 * 1000) * 1000000).toString();
                        const result = await lokiClient.queryRange(args.query, start, end, args.limit || 50);
                        toolOutputs.push({ toolCallId: toolCall.id, result });
                    } catch (e: any) {
                        toolOutputs.push({ toolCallId: toolCall.id, result: `Error executing LogQL: ${e.message}` });
                    }
                } else {
                    toolOutputs.push({ toolCallId: toolCall.id, result: 'Tool not supported or cluster context missing.' });
                }
            }

            // Append the assistant's message with tool_calls
            openAiMessages.push(responseMessage);
            
            // Re-call OpenAI with tool results
            response = await openAi.submitToolOutputs(openAiMessages, toolOutputs);
            responseMessage = response.choices[0].message;
        }

        const finalContent = responseMessage.content || "I couldn't generate a response.";

        // 7. Save AI message
        const aiMsg = await prisma.chatMessage.create({
            data: {
                sessionId: session.id,
                role: "AI",
                content: finalContent
            }
        });

        return {
            session: {
                id: session.id,
                title: session.title,
                createdAt: session.createdAt
            },
            message: {
                id: aiMsg.id,
                role: "assistant",
                content: aiMsg.content,
                timestamp: aiMsg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        };
    }
}
