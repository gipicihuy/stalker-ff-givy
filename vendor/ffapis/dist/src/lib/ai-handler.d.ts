export interface AIToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}
export interface AIToolCallResult {
    tool_call_id: string;
    role: 'tool';
    name: string;
    content: string;
}
export interface AIHandlerOptions {
    region?: string;
    /** Default OB override for all tool calls handled by this instance (e.g. 'OB55'). Per-tool `obVersion` arg wins. */
    obVersion?: string | null;
}
export declare class FreeFireAIToolHandler {
    private api;
    private likeApi;
    private defaultObVersion;
    constructor(options?: AIHandlerOptions);
    execute(toolCall: AIToolCall): Promise<AIToolCallResult>;
    executeMany(toolCalls: AIToolCall[]): Promise<AIToolCallResult[]>;
    private _dispatch;
    private _buildResult;
    private _sanitizeProfile;
    private _sanitizeLikeResult;
    private _sanitizeRegisterResult;
}
//# sourceMappingURL=ai-handler.d.ts.map