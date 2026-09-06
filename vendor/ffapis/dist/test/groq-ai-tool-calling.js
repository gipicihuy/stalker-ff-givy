"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
const GROQ_API_KEY = process.env.GROQ_API_KEY_FOR_TEST_TOOL_CALLING;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const SYSTEM_PROMPT = `You are a helpful Free Fire game assistant. You have access to tools that can search players, get profiles, stats, items, send likes, and register accounts.
When a user asks about a player, ALWAYS use the search_player tool first to find the player's account ID, then use get_player_profile or get_player_stats to retrieve details.
Do not make up data — always call the tools to get real information.`;
async function chat(messages, round = 0) {
    if (round >= 5) {
        console.log('\n[MaxRounds] Stopped after 5 tool call rounds.');
        return;
    }
    const bodyMessages = messages[0]?.role === 'system'
        ? messages
        : [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];
    const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: bodyMessages,
            tools: index_1.freefireTools,
            temperature: 1,
            max_completion_tokens: 8192,
            top_p: 1,
            stream: true,
            reasoning_effort: 'medium',
            stop: null
        })
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Groq API error ${response.status}: ${text}`);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const toolCallsAcc = {};
    let assistantContent = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: '))
                continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]')
                continue;
            try {
                const chunk = JSON.parse(data);
                const delta = chunk.choices?.[0]?.delta;
                if (!delta)
                    continue;
                if (delta.content) {
                    assistantContent += delta.content;
                    process.stdout.write(delta.content);
                }
                if (delta.tool_calls && Array.isArray(delta.tool_calls)) {
                    for (const tc of delta.tool_calls) {
                        if (!toolCallsAcc[tc.index]) {
                            toolCallsAcc[tc.index] = { id: tc.id || '', type: 'function', function: { name: '', arguments: '' } };
                        }
                        if (tc.id)
                            toolCallsAcc[tc.index].id = tc.id;
                        if (tc.function?.name)
                            toolCallsAcc[tc.index].function.name += tc.function.name;
                        if (tc.function?.arguments)
                            toolCallsAcc[tc.index].function.arguments += tc.function.arguments;
                    }
                }
            }
            catch {
                // ignore malformeeed lines
            }
        }
    }
    const rawToolCalls = Object.values(toolCallsAcc).filter(tc => tc.function.name);
    if (rawToolCalls.length === 0) {
        console.log('\n[Done] No tool calls executed.');
        console.log('[AI]', assistantContent || '(no content)');
        return;
    }
    console.log(`\n[ToolCalls] ${rawToolCalls.length} tool call(s) detected`);
    for (const tc of rawToolCalls) {
        console.log(`  -> ${tc.function.name}(${tc.function.arguments})`);
    }
    const toolCalls = rawToolCalls;
    const handler = new index_1.FreeFireAIToolHandler();
    const results = await handler.executeMany(toolCalls);
    for (const r of results) {
        console.log(`[Result:${r.name}] ${r.content.substring(0, 200)}${r.content.length > 200 ? '...' : ''}`);
    }
    const toolMessages = results.map(r => ({
        role: 'tool',
        tool_call_id: r.tool_call_id,
        name: r.name,
        content: r.content
    }));
    const assistantMessage = {
        role: 'assistant',
        content: assistantContent || null,
        tool_calls: toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function',
            function: {
                name: tc.function.name,
                arguments: tc.function.arguments
            }
        }))
    };
    const newMessages = [
        ...messages,
        assistantMessage,
        ...toolMessages
    ];
    console.log('\n[Final] Sending tool results back to Groq...');
    await chat(newMessages, round + 1);
}
async function main() {
    if (!GROQ_API_KEY) {
        console.error('[Error] Set GROQ_API_KEY_FOR_TEST_TOOL_CALLING env var');
        process.exit(1);
    }
    const userQuery = process.argv[2] || 'Cari player dengan nickname FannBot dan tampilkan profilnya';
    console.log(`[User] ${userQuery}\n`);
    await chat([{ role: 'user', content: userQuery }]);
}
main();
//# sourceMappingURL=groq-ai-tool-calling.js.map