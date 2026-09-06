import { CredentialManager } from './credential-manager';
import type { Session, SearchResult, RegisterResult, ProcessedPlayerItems, PlayerProfile, PlayerStats, FreeFireAPIOptions } from '../types';
type ObVersionParam = string | number | {
    obVersion?: string | number | null;
} | null | undefined;
/**
 * Main API client for interacting with the Free Fire game servers.
 * Handles authentication, player lookup, stats retrieval, and account registration.
 */
export declare class FreeFireAPI {
    session: Session;
    region: string | null;
    credentialManager: CredentialManager | null;
    obVersion: string | null;
    private allCredentials;
    /**
     * Creates a new FreeFireAPI instance.
     * @param region - Optional region code (e.g., 'IND', 'BR') to scope credential lookup.
     * @param options - Optional instance options or OB string. Example: `new FreeFireAPI(null, { obVersion: 'OB55' })`
     *   or `new FreeFireAPI('IND', 'OB55')`. When omitted, OB falls back to `config/settings.yaml` (or `FF_OB_VERSION` env).
     *   Per-request `obVersion` param always wins over this instance value — useful when the bundled
     *   library is outdated but you already know the newest OB.
     */
    constructor(region?: string | null, options?: FreeFireAPIOptions | string | null);
    /**
     * Set instance-level OB override (e.g. `api.setObVersion('OB55')`).
     * Pass `null` to clear and fall back to `config/settings.yaml` / env.
     */
    setObVersion(version: string | number | null): void;
    /**
     * Get effective OB version (instance override > env > settings.yaml default).
     */
    getObVersion(): string;
    private _headers;
    /**
     * Switches the active region and initializes a new credential manager.
     * @param region - Region code to switch to.
     */
    setRegion(region: string): void;
    private _loadAllCredentials;
    private _getRandomCredentialFromAll;
    /**
     * Logs in using a random credential from any available region pool.
     * @param obVersion - Optional OB override for this request only (e.g. 'OB55'). Falls back to instance/env/default.
     * @returns A valid session containing token, server URL, and account details.
     */
    loginWithRandomCredentialFromAll(obVersion?: ObVersionParam): Promise<Session>;
    /**
     * Logs in using a random credential from the currently set region pool.
     * Falls back to all-region lookup if no region is configured.
     * @param obVersion - Optional OB override for this request only.
     * @returns A valid session containing token, server URL, and account details.
     */
    loginWithRandomCredential(obVersion?: ObVersionParam): Promise<Session>;
    /**
     * Authenticates with a specific UID and password.
     * @param uid - Garena account UID.
     * @param password - Account password.
     * @param obVersion - Optional OB override for this login only (e.g. 'OB55').
     * @returns A valid session containing token, server URL, and account details.
     */
    login(uid: string, password: string, obVersion?: ObVersionParam): Promise<Session>;
    private _getGarenaToken;
    private _majorLogin;
    /**
     * Searches for players by nickname across Free Fire servers.
     * @param keyword - Player nickname to search (minimum 3 characters).
     * @param obVersion - Optional OB override for this request only (e.g. 'OB55').
     * @returns Array of matching player results.
     */
    searchAccount(keyword: string, obVersion?: ObVersionParam): Promise<SearchResult[]>;
    /**
     * Retrieves detailed profile information for a player.
     * @param uid - Target player UID.
     * @param obVersion - Optional OB override for this request only (e.g. 'OB55').
     * @returns Structured player profile including basic info, clan, and pet data.
     */
    getPlayerProfile(uid: number | string, obVersion?: ObVersionParam): Promise<PlayerProfile>;
    private _requestProfile;
    /**
     * Fetches and processes a player's equipped items (outfit, weapons, skills, pet).
     * @param uid - Target player UID.
     * @param obVersion - Optional OB override for this request only.
     * @returns Normalized item details mapped from the internal items database.
     */
    getPlayerItems(uid: number | string, obVersion?: ObVersionParam): Promise<ProcessedPlayerItems | null>;
    /**
     * Retrieves match statistics for a player.
     * @param uid - Target player UID.
     * @param mode - Game mode: 'br' (Battle Royale) or 'cs' (Clash Squad).
     * @param matchType - Match type: 'career', 'ranked', or 'normal'.
     * @param obVersion - Optional OB override for this request only (e.g. 'OB55').
     * @returns Structured stats object for solo, duo, and squad matches.
     */
    getPlayerStats(uid: number | string, mode?: 'br' | 'cs', matchType?: 'career' | 'ranked' | 'normal', obVersion?: ObVersionParam): Promise<PlayerStats>;
    private _checkSession;
    /**
     * Registers a new guest account in the specified region.
     * @param region - Target region code (e.g., 'IND').
     * @param nickname - Optional nickname; a random one is generated if omitted.
     * @param obVersion - Optional OB override for this request only (e.g. 'OB55').
     * @returns Registration result containing UID, password, and region.
     */
    register(region: string, nickname?: string | null, obVersion?: ObVersionParam): Promise<RegisterResult>;
    private _generateRandomPassword;
    private _guestRegister;
    private _getGarenaTokenForRegister;
    private _xorEncryptOpenId;
    private _encodeVarint;
    private _encodeField;
    private _manualProtobufEncode;
    private _majorRegister;
    private _manualProtobufDecode;
}
export {};
//# sourceMappingURL=api.d.ts.map