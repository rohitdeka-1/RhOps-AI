import { prisma } from "../../../config/prisma";
import { IAiProvider } from "../providers/ai.provider.interface";
import { OpenAIProvider } from "../providers/openai.provider";
import { PrometheusClient } from "../../../infrastructure/monitoring/prometheus.client";
import { LokiClient } from "../../../infrastructure/monitoring/loki.client";
import { buildSystemPrompt } from "../prompts/system.prompt";
import { getToolDefinitions, executeTool } from "../tools";
import { decrypt } from "../../../utils/encryption.util";
import { agentManager } from "../../agent/agent.manager";

export class ChatService {
    private aiProvider: IAiProvider | null = null;

    private getAiProvider(): IAiProvider {
        if (!this.aiProvider) {
            // Using OpenAI by default, could be injected or dynamically selected
            this.aiProvider = new OpenAIProvider();
        }
        return this.aiProvider;
    }

    async handleChat(userId: string, clusterId: string | null, sessionId: string | null, message: string, isBackground: boolean = false) {
        let session;
        if (!isBackground) {
            if (sessionId) {
                session = await prisma.chatSession.findUnique({
                    where: { id: sessionId },
                    include: { messages: { orderBy: { createdAt: 'asc' } } }
                });
                if (!session) throw new Error("Chat session not found");
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

            await prisma.chatMessage.create({
                data: { sessionId: session.id, role: "USER", content: message }
            });
        }

        const messages = session ? session.messages.map(msg => ({
            role: msg.role === "USER" ? "user" : "assistant",
            content: msg.content
        })) as any[] : [];

        messages.push({ role: 'user', content: message });

        let promClient: PrometheusClient | null = null;
        let lokiClient: LokiClient | null = null;
        let clusterName: string | null = null;
        let kubeconfigString: string | null = null;

        if (clusterId) {
            const cluster = await prisma.cluster.findUnique({ where: { id: clusterId } });
            if (cluster) {
                clusterName = cluster.name;
                if (cluster.kubeconfig) {
                    kubeconfigString = decrypt(cluster.kubeconfig);
                    promClient = new PrometheusClient(kubeconfigString);
                    lokiClient = new LokiClient(kubeconfigString);
                }
            }
        }

        const systemPrompt = buildSystemPrompt(clusterName);

        const openAiMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];

        const aiProvider = this.getAiProvider();
        const tools = getToolDefinitions();

        let response = await aiProvider.chatCompletion(openAiMessages, tools);
        console.log("response::::::", response);
        let responseMessage = response.choices[0].message;
        console.log("responseMessage::::::", responseMessage);

        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            const toolOutputs = [];
            for (const toolCall of responseMessage.tool_calls) {
                if (toolCall.type !== 'function') continue;

                let result;
                console.log(`[AI] Executing tool ${toolCall.function.name} for cluster ${clusterId}`);
                result = await executeTool(
                    toolCall.function.name,
                    toolCall.function.arguments,
                    promClient,
                    lokiClient,
                    kubeconfigString,
                    ['*'], // Cluster admin access by default based on current schema
                    clusterId
                );

                toolOutputs.push({ toolCallId: toolCall.id, result });
            }

            openAiMessages.push(responseMessage);
            response = await aiProvider.submitToolOutputs(openAiMessages, toolOutputs);
            responseMessage = response.choices[0].message;
        }

        const finalContent = responseMessage.content || "I couldn't generate a response.";

        let aiMsg;
        if (!isBackground) {
            aiMsg = await prisma.chatMessage.create({
                data: { sessionId: session.id, role: "AI", content: finalContent }
            });
        }

        return {
            session: session ? {
                id: session.id,
                title: session.title,
                createdAt: session.createdAt
            } : { id: 'background', title: 'Background Task', createdAt: new Date() },
            message: {
                id: aiMsg ? aiMsg.id : 'msg-bg',
                role: "assistant",
                content: finalContent,
                timestamp: aiMsg ? aiMsg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        };
    }
}
