import OpenAI from 'openai';
import { IAiProvider } from './ai.provider.interface';

export class OpenAIProvider implements IAiProvider {
    private client: OpenAI;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is missing in environment variables.');
        }
        this.client = new OpenAI({ apiKey });
    }

    async chatCompletion(
        messages: any[],
        tools: any[] = [],
        model: string = 'gpt-4o-mini'
    ) {
        return await this.client.chat.completions.create({
            model,
            messages,
            ...(tools.length > 0 ? { tools, tool_choice: 'auto' } : {})
        });
    }

    async submitToolOutputs(
        messages: any[],
        toolOutputs: any[],
        model: string = 'gpt-4o-mini'
    ) {
        const clonedMessages = [...messages];
        
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
            tools: [], 
        });
    }
}
