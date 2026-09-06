import type { LikeResult, LikeAPIOptions } from '../types';
type ObVersionParam = string | number | {
    obVersion?: string | number | null;
} | null | undefined;
/**
 * API client for sending profile likes to a target Free Fire player.
 * Manages guest credential pools per region and rotates through them.
 */
export declare class LikeAPI {
    private credentialManagers;
    obVersion: string | null;
    /**
     * @param options - Optional instance OB override. Example: `new LikeAPI({ obVersion: 'OB55' })` or `new LikeAPI('OB55')`.
     */
    constructor(options?: LikeAPIOptions | string | null);
    /**
     * Set instance-level OB override (e.g. `like.setObVersion('OB55')`).
     * Pass `null` to clear and fall back to settings.yaml / env.
     */
    setObVersion(version: string | number | null): void;
    /** Get effective OB version (instance override > env > settings.yaml default). */
    getObVersion(): string;
    private _headers;
    private _getCredentialManager;
    private _getBaseUrl;
    private _login;
    private _createLikePayload;
    private _sendLikeWithGuest;
    /**
     * Sends likes to a target player using available guest accounts.
     * @param targetUid - UID of the player to receive likes.
     * @param region - Region code (e.g., 'IND', 'BR').
     * @param likeCount - Number of likes to send (default 100, max 100 per day). May also be an options object `{ likeCount, obVersion }`.
     * @param obVersion - Optional OB override for this request only (e.g. 'OB55'). When `likeCount` is an object, use its `obVersion` instead.
     * @returns Summary of the like operation including success and failure counts.
     */
    sendLikes(targetUid: string, region: string, likeCount?: number | {
        likeCount?: number;
        obVersion?: string | number | null;
    }, obVersion?: ObVersionParam): Promise<LikeResult>;
}
export {};
//# sourceMappingURL=like.d.ts.map