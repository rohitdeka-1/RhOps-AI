export interface IAiProvider {
    chatCompletion(messages: any[], tools?: any[]): Promise<any>;
    submitToolOutputs(messages: any[], toolOutputs: any[]): Promise<any>;
}
