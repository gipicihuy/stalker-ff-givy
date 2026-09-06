"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeFireAIToolHandler = void 0;
const api_1 = require("./api");
const like_1 = require("./like");
const ai_tools_1 = require("./ai-tools");
class FreeFireAIToolHandler {
    constructor(options = {}) {
        this.defaultObVersion = options.obVersion ?? null;
        this.api = new api_1.FreeFireAPI(options.region || null, { obVersion: this.defaultObVersion });
        this.likeApi = new like_1.LikeAPI({ obVersion: this.defaultObVersion });
    }
    async execute(toolCall) {
        const tool = (0, ai_tools_1.getToolByName)(toolCall.function.name);
        if (!tool) {
            return this._buildResult(toolCall, `Error: Unknown tool "${toolCall.function.name}"`);
        }
        let args;
        try {
            args = JSON.parse(toolCall.function.arguments);
        }
        catch {
            return this._buildResult(toolCall, 'Error: Invalid JSON in tool arguments');
        }
        try {
            const result = await this._dispatch(toolCall.function.name, args);
            return this._buildResult(toolCall, JSON.stringify(result));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return this._buildResult(toolCall, `Error: ${message}`);
        }
    }
    async executeMany(toolCalls) {
        const results = [];
        for (const call of toolCalls) {
            results.push(await this.execute(call));
        }
        return results;
    }
    async _dispatch(name, args) {
        const obVersion = typeof args.obVersion === 'string' || typeof args.obVersion === 'number' ? String(args.obVersion) : undefined;
        switch (name) {
            case 'search_player': {
                const keyword = String(args.keyword);
                const results = await this.api.searchAccount(keyword, obVersion);
                return results.map((r) => ({
                    accountid: r.accountid,
                    nickname: r.nickname,
                    level: r.level
                }));
            }
            case 'get_player_profile': {
                const profile = await this.api.getPlayerProfile(String(args.uid), obVersion);
                return this._sanitizeProfile(profile);
            }
            case 'get_player_items': {
                const items = await this.api.getPlayerItems(String(args.uid), obVersion);
                return items;
            }
            case 'get_player_stats': {
                const stats = await this.api.getPlayerStats(String(args.uid), args.mode || 'br', args.matchType || 'career', obVersion);
                return stats;
            }
            case 'send_likes': {
                const result = await this.likeApi.sendLikes(String(args.targetUid), String(args.region), args.likeCount ? Number(args.likeCount) : 100, obVersion);
                return this._sanitizeLikeResult(result);
            }
            case 'register_account': {
                const result = await this.api.register(String(args.region), args.nickname ? String(args.nickname) : null, obVersion);
                return this._sanitizeRegisterResult(result);
            }
            default:
                throw new Error(`Tool "${name}" is not implemented`);
        }
    }
    _buildResult(toolCall, content) {
        return {
            tool_call_id: toolCall.id,
            role: 'tool',
            name: toolCall.function.name,
            content
        };
    }
    _sanitizeProfile(profile) {
        return {
            basicinfo: profile.basicinfo,
            claninfo: profile.claninfo || null,
            petinfo: profile.petinfo
                ? {
                    id: profile.petinfo.id,
                    name: profile.petinfo.name,
                    level: profile.petinfo.level
                }
                : null,
            profileinfo: profile.profileinfo
        };
    }
    _sanitizeLikeResult(result) {
        return {
            success: result.success,
            successCount: result.successCount,
            failedCount: result.failedCount,
            remainingGuests: result.remainingGuests,
            message: result.message
        };
    }
    _sanitizeRegisterResult(result) {
        return {
            uid: result.uid,
            region: result.region,
            nickname: result.nickname
        };
    }
}
exports.FreeFireAIToolHandler = FreeFireAIToolHandler;
//# sourceMappingURL=ai-handler.js.map