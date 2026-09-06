export interface AIToolParameterProperty {
    type: string;
    description: string;
    enum?: string[];
    minimum?: number;
    maximum?: number;
    minLength?: number;
}
export interface AIToolParameters {
    type: 'object';
    properties: Record<string, AIToolParameterProperty>;
    required: string[];
}
export interface AITool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: AIToolParameters;
    };
}
export declare const freefireTools: AITool[];
export declare function getToolByName(name: string): AITool | undefined;
export declare function getToolNames(): string[];
//# sourceMappingURL=ai-tools.d.ts.map