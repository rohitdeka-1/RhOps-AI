import OpenAI from 'openai';

export class OpenAIClient {
    private client: OpenAI;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is missing in environment variables.');
        }
        this.client = new OpenAI({ apiKey });
    }

    /**
     * Sends a chat completion request with built-in tools for Loki and Prometheus.
     */
    async chatCompletion(
        messages: OpenAI.Chat.ChatCompletionMessageParam[],
        model: string = 'gpt-4o-mini' // Defaulting to a faster/cheaper model for general requests, can be passed dynamically
    ) {
        return await this.client.chat.completions.create({
            model,
            messages,
            tools: [
                {
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
                },
                {
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
                }
            ],
            tool_choice: 'auto'
        });
    }

    /**
     * Submit tool outputs back to the chat model to continue the conversation.
     */
    async submitToolOutputs(
        messages: OpenAI.Chat.ChatCompletionMessageParam[],
        toolOutputs: any[],
        model: string = 'gpt-4o-mini'
    ) {
        const clonedMessages = [...messages];
        
        // Add tool outputs as messages
        for (const output of toolOutputs) {
            clonedMessages.push({
                role: 'tool',
                tool_call_id: output.toolCallId,
                content: typeof output.result === 'string' ? output.result : JSON.stringify(output.result)
            });
        }

        return await this.client.chat.completions.create({
            model,
            messages: clonedMessages,
            tools: [], // Usually tools aren't sent again if we just want the final summary
        });
    }
}
