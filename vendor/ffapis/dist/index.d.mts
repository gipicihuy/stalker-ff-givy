import protobuf from 'protobufjs';

interface Session {
    token: string | null;
    serverUrl: string | null;
    openId: string | null;
    accountId: string | null;
}
interface Credential {
    uid: string;
    password: string;
}
interface GarenaTokenResponse {
    access_token: string;
    open_id: string;
}
interface GarenaGuestRegisterResponse {
    uid: string;
}
interface MajorLoginResponse {
    token: string;
    serverUrl: string;
    accountId: string;
}
interface SearchResult {
    accountid: string;
    nickname: string;
    level: number;
}
interface RegisterResult {
    uid: string;
    password: string;
    passwordHash: string;
    region: string;
    nickname: string;
}
interface LikeResult {
    success: boolean;
    successCount: number;
    failedCount: number;
    remainingGuests: number;
    message: string;
}
interface AEConfig {
    MAIN_KEY: Buffer;
    MAIN_IV: Buffer;
}
interface HeadersConfig {
    COMMON: Record<string, string>;
    GARENA_AUTH: Record<string, string>;
}
interface URLSConfig {
    GARENA_TOKEN: string;
    GUEST_REGISTER: string;
    MAJOR_LOGIN: string;
    MAJOR_REGISTER: string;
    SEARCH: (serverUrl: string) => string;
    PERSONAL_SHOW: (serverUrl: string) => string;
    PLAYER_STATS: (serverUrl: string) => string;
    PLAYER_CS_STATS: (serverUrl: string) => string;
}
interface GarenaClientConfig {
    CLIENT_ID: string;
    CLIENT_SECRET: string;
}
interface Settings {
    AE: AEConfig;
    HEADERS: HeadersConfig;
    URLS: URLSConfig;
    GARENA_CLIENT: GarenaClientConfig;
}
interface FreeFireAPIOptions {
    /** Instance-level OB override, e.g. "OB55". Falls back to settings.yaml when omitted. */
    obVersion?: string | null;
}
interface LikeAPIOptions {
    /** Instance-level OB override, e.g. "OB55". Falls back to settings.yaml when omitted. */
    obVersion?: string | null;
}
interface ItemDetails {
    id: number;
    name: string;
    type: string;
    rarity: string;
    description: string;
    is_unique: boolean;
    image: string;
    image_fallback: string;
    collection_type?: string;
    icon_code?: string;
}
interface PlayerBasicInfo {
    accountid: string;
    nickname: string;
    level: number;
    exp: number;
    region: string;
    liked: string;
    signature: string;
    createat: number;
    lastloginat: number;
    weaponskinshows: number[];
}
interface PlayerClanInfo {
    clanname: string;
    clanid: string;
}
interface PlayerPetInfo {
    id: number;
    name: string;
    level: number;
    skinid: number;
    selectedskillid: number;
}
interface PlayerProfileInfo {
    clothes: number[];
    equipedskills: number[];
}
interface PlayerProfile {
    basicinfo: PlayerBasicInfo;
    claninfo?: PlayerClanInfo;
    petinfo?: PlayerPetInfo;
    profileinfo: PlayerProfileInfo;
}
interface PlayerStats {
    solostats?: Record<string, unknown>;
    duostats?: Record<string, unknown>;
    quadstats?: Record<string, unknown>;
}
interface ProcessedPlayerItems {
    basic_info: {
        accountid: string;
        nickname: string;
        level: number;
        region: string;
        liked: string;
        signature: string;
    };
    items: {
        outfit: ItemDetails[];
        skills: {
            equipped: ItemDetails[];
        };
        weapons: {
            shown_skins: ItemDetails[];
        };
        pet: {
            id: ItemDetails;
            name: string;
            level: number;
            skin: ItemDetails;
            selected_skill: ItemDetails;
        } | null;
    };
}
declare function getErrorMessage(error: unknown): string;

/**
 * Manages a pool of guest credentials for a specific Free Fire region.
 * Tracks usage to prevent reusing the same guest account on the same target.
 */
declare class CredentialManager {
    region: string;
    private pool;
    private currentIndex;
    private usageData;
    /**
     * @param region - Region code whose embedded credential pool will be loaded.
     */
    constructor(region: string);
    private _loadPool;
    isUsedForTarget(targetUid: string, guestUid: string): boolean;
    markUsed(targetUid: string, guestUid: string): void;
    getRandomCredential(): Credential | null;
    getNextCredential(): Credential | null;
    getNextForTarget(targetUid: string): Credential | null;
    getMultipleForTarget(targetUid: string, count: number): Credential[];
    getAvailableCount(targetUid: string): number;
    getPoolSize(): number;
    clearUsage(targetUid?: string): void;
}

type ObVersionParam$1 = string | number | {
    obVersion?: string | number | null;
} | null | undefined;
/**
 * Main API client for interacting with the Free Fire game servers.
 * Handles authentication, player lookup, stats retrieval, and account registration.
 */
declare class FreeFireAPI {
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
    loginWithRandomCredentialFromAll(obVersion?: ObVersionParam$1): Promise<Session>;
    /**
     * Logs in using a random credential from the currently set region pool.
     * Falls back to all-region lookup if no region is configured.
     * @param obVersion - Optional OB override for this request only.
     * @returns A valid session containing token, server URL, and account details.
     */
    loginWithRandomCredential(obVersion?: ObVersionParam$1): Promise<Session>;
    /**
     * Authenticates with a specific UID and password.
     * @param uid - Garena account UID.
     * @param password - Account password.
     * @param obVersion - Optional OB override for this login only (e.g. 'OB55').
     * @returns A valid session containing token, server URL, and account details.
     */
    login(uid: string, password: string, obVersion?: ObVersionParam$1): Promise<Session>;
    private _getGarenaToken;
    private _majorLogin;
    /**
     * Searches for players by nickname across Free Fire servers.
     * @param keyword - Player nickname to search (minimum 3 characters).
     * @param obVersion - Optional OB override for this request only (e.g. 'OB55').
     * @returns Array of matching player results.
     */
    searchAccount(keyword: string, obVersion?: ObVersionParam$1): Promise<SearchResult[]>;
    /**
     * Retrieves detailed profile information for a player.
     * @param uid - Target player UID.
     * @param obVersion - Optional OB override for this request only (e.g. 'OB55').
     * @returns Structured player profile including basic info, clan, and pet data.
     */
    getPlayerProfile(uid: number | string, obVersion?: ObVersionParam$1): Promise<PlayerProfile>;
    private _requestProfile;
    /**
     * Fetches and processes a player's equipped items (outfit, weapons, skills, pet).
     * @param uid - Target player UID.
     * @param obVersion - Optional OB override for this request only.
     * @returns Normalized item details mapped from the internal items database.
     */
    getPlayerItems(uid: number | string, obVersion?: ObVersionParam$1): Promise<ProcessedPlayerItems | null>;
    /**
     * Retrieves match statistics for a player.
     * @param uid - Target player UID.
     * @param mode - Game mode: 'br' (Battle Royale) or 'cs' (Clash Squad).
     * @param matchType - Match type: 'career', 'ranked', or 'normal'.
     * @param obVersion - Optional OB override for this request only (e.g. 'OB55').
     * @returns Structured stats object for solo, duo, and squad matches.
     */
    getPlayerStats(uid: number | string, mode?: 'br' | 'cs', matchType?: 'career' | 'ranked' | 'normal', obVersion?: ObVersionParam$1): Promise<PlayerStats>;
    private _checkSession;
    /**
     * Registers a new guest account in the specified region.
     * @param region - Target region code (e.g., 'IND').
     * @param nickname - Optional nickname; a random one is generated if omitted.
     * @param obVersion - Optional OB override for this request only (e.g. 'OB55').
     * @returns Registration result containing UID, password, and region.
     */
    register(region: string, nickname?: string | null, obVersion?: ObVersionParam$1): Promise<RegisterResult>;
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

type ObVersionParam = string | number | {
    obVersion?: string | number | null;
} | null | undefined;
/**
 * API client for sending profile likes to a target Free Fire player.
 * Manages guest credential pools per region and rotates through them.
 */
declare class LikeAPI {
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

declare class ProtoHandler {
    private roots;
    load(filename: string): Promise<protobuf.Root>;
    encode(filename: string, messageName: string, payload: Record<string, unknown>, shouldEncrypt?: boolean): Promise<Buffer>;
    decode(filename: string, messageName: string, buffer: Buffer | ArrayBuffer): Promise<unknown>;
}
declare const protoHandler: ProtoHandler;

declare function encrypt(buffer: Buffer): Buffer;

declare function loadItems(): Record<string, Record<string, unknown>>;
declare function getItemDetails(itemId: number): ItemDetails;
declare function processPlayerItems(playerData: PlayerProfile): ProcessedPlayerItems;

interface AIToolParameterProperty {
    type: string;
    description: string;
    enum?: string[];
    minimum?: number;
    maximum?: number;
    minLength?: number;
}
interface AIToolParameters {
    type: 'object';
    properties: Record<string, AIToolParameterProperty>;
    required: string[];
}
interface AITool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: AIToolParameters;
    };
}
declare const freefireTools: AITool[];
declare function getToolByName(name: string): AITool | undefined;
declare function getToolNames(): string[];

interface AIToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}
interface AIToolCallResult {
    tool_call_id: string;
    role: 'tool';
    name: string;
    content: string;
}
interface AIHandlerOptions {
    region?: string;
    /** Default OB override for all tool calls handled by this instance (e.g. 'OB55'). Per-tool `obVersion` arg wins. */
    obVersion?: string | null;
}
declare class FreeFireAIToolHandler {
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

/**
 * Default OB version from `config/settings.yaml` (`HEADERS_COMMON_RELEASE_VERSION`).
 * Example: "OB54"
 */
declare const DEFAULT_OB_VERSION: string;
/**
 * Normalize user-supplied OB version.
 * Accepts "OB54", "ob54", "54" -> returns "OB54".
 * Returns null for empty/invalid input (caller falls back to default).
 */
declare function normalizeObVersion(input?: string | number | null): string | null;
/**
 * Resolve effective OB version with priority:
 * request override > instance override > env (FF_OB_VERSION / FFAPIS_OB_VERSION / FFAPIS_OB) > settings.yaml default.
 */
declare function resolveObVersion(requestOb?: string | number | null, instanceOb?: string | number | null): string;
/**
 * Build COMMON headers with a specific OB version.
 * Does not mutate global HEADERS — safe for per-request override.
 */
declare function getCommonHeaders(obVersion?: string | number | null, instanceOb?: string | number | null): Record<string, string>;

export { type AEConfig, type AIHandlerOptions, type AITool, type AIToolCall, type AIToolCallResult, type AIToolParameterProperty, type AIToolParameters, type Credential, CredentialManager, DEFAULT_OB_VERSION, FreeFireAIToolHandler, FreeFireAPI, type FreeFireAPIOptions, type GarenaClientConfig, type GarenaGuestRegisterResponse, type GarenaTokenResponse, type HeadersConfig, type ItemDetails, LikeAPI, type LikeAPIOptions, type LikeResult, type MajorLoginResponse, type PlayerBasicInfo, type PlayerClanInfo, type PlayerPetInfo, type PlayerProfile, type PlayerProfileInfo, type PlayerStats, type ProcessedPlayerItems, type RegisterResult, type SearchResult, type Session, type Settings, type URLSConfig, encrypt, freefireTools, getCommonHeaders, getErrorMessage, getItemDetails, getToolByName, getToolNames, loadItems, normalizeObVersion, processPlayerItems, protoHandler, resolveObVersion };
