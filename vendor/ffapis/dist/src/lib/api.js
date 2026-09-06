"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeFireAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const protobuf_1 = require("./protobuf");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const credential_manager_1 = require("./credential-manager");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const types_1 = require("../types");
const resolve_path_1 = require("./resolve-path");
function parseObArg(arg) {
    if (arg === undefined || arg === null)
        return null;
    if (typeof arg === 'object')
        return (0, constants_1.normalizeObVersion)(arg.obVersion);
    return (0, constants_1.normalizeObVersion)(arg);
}
/**
 * Main API client for interacting with the Free Fire game servers.
 * Handles authentication, player lookup, stats retrieval, and account registration.
 */
class FreeFireAPI {
    /**
     * Creates a new FreeFireAPI instance.
     * @param region - Optional region code (e.g., 'IND', 'BR') to scope credential lookup.
     * @param options - Optional instance options or OB string. Example: `new FreeFireAPI(null, { obVersion: 'OB55' })`
     *   or `new FreeFireAPI('IND', 'OB55')`. When omitted, OB falls back to `config/settings.yaml` (or `FF_OB_VERSION` env).
     *   Per-request `obVersion` param always wins over this instance value — useful when the bundled
     *   library is outdated but you already know the newest OB.
     */
    constructor(region = null, options) {
        this.obVersion = null;
        this.allCredentials = null;
        this.session = { token: null, serverUrl: null, openId: null, accountId: null };
        this.region = region;
        this.credentialManager = region ? new credential_manager_1.CredentialManager(region) : null;
        if (typeof options === 'string') {
            this.obVersion = (0, constants_1.normalizeObVersion)(options);
        }
        else if (options && typeof options === 'object') {
            this.obVersion = (0, constants_1.normalizeObVersion)(options.obVersion);
        }
    }
    /**
     * Set instance-level OB override (e.g. `api.setObVersion('OB55')`).
     * Pass `null` to clear and fall back to `config/settings.yaml` / env.
     */
    setObVersion(version) {
        this.obVersion = (0, constants_1.normalizeObVersion)(version);
    }
    /**
     * Get effective OB version (instance override > env > settings.yaml default).
     */
    getObVersion() {
        return (0, constants_1.resolveObVersion)(null, this.obVersion);
    }
    _headers(requestOb) {
        return (0, constants_1.getCommonHeaders)(parseObArg(requestOb), this.obVersion);
    }
    /**
     * Switches the active region and initializes a new credential manager.
     * @param region - Region code to switch to.
     */
    setRegion(region) {
        this.region = region;
        this.credentialManager = new credential_manager_1.CredentialManager(region);
    }
    _loadAllCredentials() {
        if (this.allCredentials)
            return this.allCredentials;
        const allCreds = [];
        const credentialsDir = (0, resolve_path_1.resolveProjectDir)('config/credentials');
        try {
            const files = fs_1.default.readdirSync(credentialsDir);
            for (const file of files) {
                if (file.endsWith('.yaml')) {
                    const filePath = path_1.default.join(credentialsDir, file);
                    const content = fs_1.default.readFileSync(filePath, 'utf8');
                    const lines = content.split('\n');
                    let currentAccount = null;
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed.startsWith('- uid:')) {
                            if (currentAccount)
                                allCreds.push(currentAccount);
                            const uidMatch = trimmed.match(/uid:\s*"([^"]+)"/);
                            currentAccount = { uid: uidMatch ? uidMatch[1] : '', password: '' };
                        }
                        else if (trimmed.startsWith('password:') && currentAccount) {
                            const pwdMatch = trimmed.match(/password:\s*"([^"]+)"/);
                            if (pwdMatch)
                                currentAccount.password = pwdMatch[1];
                        }
                    }
                    if (currentAccount && currentAccount.password)
                        allCreds.push(currentAccount);
                }
            }
        }
        catch (error) {
            console.error('[API] Failed to load all credentials:', (0, types_1.getErrorMessage)(error));
        }
        this.allCredentials = allCreds;
        console.log(`[API] Loaded ${allCreds.length} credentials from all regions`);
        return allCreds;
    }
    _getRandomCredentialFromAll() {
        const creds = this._loadAllCredentials();
        if (creds.length === 0)
            throw new Error('No credentials available in any region');
        const randomIndex = Math.floor(Math.random() * creds.length);
        return creds[randomIndex];
    }
    /**
     * Logs in using a random credential from any available region pool.
     * @param obVersion - Optional OB override for this request only (e.g. 'OB55'). Falls back to instance/env/default.
     * @returns A valid session containing token, server URL, and account details.
     */
    async loginWithRandomCredentialFromAll(obVersion) {
        const cred = this._getRandomCredentialFromAll();
        console.log(`[API] Using random credential from all regions: ${cred.uid}`);
        return this.login(cred.uid, cred.password, obVersion);
    }
    /**
     * Logs in using a random credential from the currently set region pool.
     * Falls back to all-region lookup if no region is configured.
     * @param obVersion - Optional OB override for this request only.
     * @returns A valid session containing token, server URL, and account details.
     */
    async loginWithRandomCredential(obVersion) {
        if (!this.credentialManager) {
            return this.loginWithRandomCredentialFromAll(obVersion);
        }
        const cred = this.credentialManager.getRandomCredential();
        if (!cred)
            throw new Error(`No credentials available in pool for region ${this.region}`);
        console.log(`[API] Using random credential from ${this.region}: ${cred.uid}`);
        return this.login(cred.uid, cred.password, obVersion);
    }
    /**
     * Authenticates with a specific UID and password.
     * @param uid - Garena account UID.
     * @param password - Account password.
     * @param obVersion - Optional OB override for this login only (e.g. 'OB55').
     * @returns A valid session containing token, server URL, and account details.
     */
    async login(uid, password, obVersion) {
        if (!uid || !password)
            throw new Error('Missing credentials. Please provide UID and PASSWORD to login(uid, password).');
        const garenaData = await this._getGarenaToken(uid, password);
        if (!garenaData?.access_token)
            throw new Error('Garena authentication failed: Invalid credentials or response');
        const loginData = await this._majorLogin(garenaData.access_token, garenaData.open_id, obVersion);
        if (!loginData?.token)
            throw new Error('Major login failed: Empty token received');
        this.session.token = loginData.token;
        this.session.serverUrl = loginData.serverUrl;
        this.session.openId = garenaData.open_id;
        this.session.accountId = loginData.accountId;
        return this.session;
    }
    async _getGarenaToken(uid, password) {
        const params = new URLSearchParams();
        params.append('uid', uid);
        params.append('password', password);
        params.append('response_type', 'token');
        params.append('client_type', '2');
        params.append('client_secret', constants_1.GARENA_CLIENT.CLIENT_SECRET);
        params.append('client_id', constants_1.GARENA_CLIENT.CLIENT_ID);
        try {
            const response = await axios_1.default.post(constants_1.URLS.GARENA_TOKEN, params, { headers: constants_1.HEADERS.GARENA_AUTH, timeout: 30000 });
            return response.data;
        }
        catch (error) {
            throw new Error(`Garena Auth Request Failed: ${(0, types_1.getErrorMessage)(error)}`);
        }
    }
    async _majorLogin(accessToken, openId, obVersion) {
        const payload = { openid: openId, logintoken: accessToken, platform: '4' };
        const encryptedBody = await protobuf_1.protoHandler.encode('MajorLogin.proto', 'request', payload, true);
        try {
            const response = await axios_1.default.post(constants_1.URLS.MAJOR_LOGIN, encryptedBody, {
                headers: {
                    ...this._headers(obVersion),
                    Authorization: 'Bearer',
                    'Content-Type': 'application/octet-stream'
                },
                responseType: 'arraybuffer',
                timeout: 30000
            });
            const decoded = await protobuf_1.protoHandler.decode('MajorLogin.proto', 'response', response.data);
            return decoded;
        }
        catch (error) {
            throw new Error(`Major Login Request Failed: ${(0, types_1.getErrorMessage)(error)}`);
        }
    }
    /**
     * Searches for players by nickname across Free Fire servers.
     * @param keyword - Player nickname to search (minimum 3 characters).
     * @param obVersion - Optional OB override for this request only (e.g. 'OB55').
     * @returns Array of matching player results.
     */
    async searchAccount(keyword, obVersion) {
        if (!keyword || keyword.length < 3)
            throw new Error('Search keyword must be at least 3 characters long.');
        if (!this.session.token)
            await this.loginWithRandomCredential(obVersion);
        const payload = { keyword: String(keyword) };
        const encryptedBody = await protobuf_1.protoHandler.encode('SearchAccountByName.proto', 'SearchAccountByName.request', payload, true);
        const url = constants_1.URLS.SEARCH(this.session.serverUrl);
        try {
            const response = await axios_1.default.post(url, encryptedBody, {
                headers: {
                    ...this._headers(obVersion),
                    Authorization: `Bearer ${this.session.token}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: 'arraybuffer',
                timeout: 30000
            });
            const data = await protobuf_1.protoHandler.decode('SearchAccountByName.proto', 'SearchAccountByName.response', response.data);
            return data.infos || [];
        }
        catch (error) {
            throw new Error(`Search Failed: ${(0, types_1.getErrorMessage)(error)}`);
        }
    }
    /**
     * Retrieves detailed profile information for a player.
     * @param uid - Target player UID.
     * @param obVersion - Optional OB override for this request only (e.g. 'OB55').
     * @returns Structured player profile including basic info, clan, and pet data.
     */
    async getPlayerProfile(uid, obVersion) {
        return this._requestProfile(uid, false, obVersion);
    }
    async _requestProfile(uid, isRetry, obVersion) {
        await this._checkSession(obVersion);
        const payload = { accountId: Number(uid), callSignSrc: 7, needGalleryInfo: true };
        const encryptedBody = await protobuf_1.protoHandler.encode('PlayerPersonalShow.proto', 'request', payload, true);
        const url = constants_1.URLS.PERSONAL_SHOW(this.session.serverUrl);
        try {
            const response = await axios_1.default.post(url, encryptedBody, {
                headers: { ...this._headers(obVersion), Authorization: `Bearer ${this.session.token}` },
                responseType: 'arraybuffer',
                timeout: 30000
            });
            const decoded = await protobuf_1.protoHandler.decode('PlayerPersonalShow.proto', 'response', response.data);
            return decoded;
        }
        catch (error) {
            const status = axios_1.default.isAxiosError(error) ? error.response?.status : 0;
            if (!isRetry && (status === 400 || status === 401)) {
                this.session.token = null;
                await this._checkSession(obVersion);
                return this._requestProfile(uid, true, obVersion);
            }
            throw new Error(`Get Profile Failed: ${(0, types_1.getErrorMessage)(error)}`);
        }
    }
    /**
     * Fetches and processes a player's equipped items (outfit, weapons, skills, pet).
     * @param uid - Target player UID.
     * @param obVersion - Optional OB override for this request only.
     * @returns Normalized item details mapped from the internal items database.
     */
    async getPlayerItems(uid, obVersion) {
        const profile = await this.getPlayerProfile(uid, obVersion);
        if (!profile)
            return null;
        return (0, utils_1.processPlayerItems)(profile);
    }
    /**
     * Retrieves match statistics for a player.
     * @param uid - Target player UID.
     * @param mode - Game mode: 'br' (Battle Royale) or 'cs' (Clash Squad).
     * @param matchType - Match type: 'career', 'ranked', or 'normal'.
     * @param obVersion - Optional OB override for this request only (e.g. 'OB55').
     * @returns Structured stats object for solo, duo, and squad matches.
     */
    async getPlayerStats(uid, mode = 'br', matchType = 'career', obVersion) {
        if (!this.session.token)
            await this.loginWithRandomCredential(obVersion);
        const modeLower = mode.toLowerCase();
        const typeUpper = matchType.toUpperCase();
        let matchMode = 0;
        let url = '';
        let protoFile = '';
        const payload = { accountid: Number(uid) };
        if (modeLower === 'br') {
            const types = { CAREER: 0, NORMAL: 1, RANKED: 2 };
            matchMode = types[typeUpper] !== undefined ? types[typeUpper] : 0;
            url = constants_1.URLS.PLAYER_STATS(this.session.serverUrl);
            protoFile = 'PlayerStats.proto';
            payload.matchmode = matchMode;
        }
        else {
            const types = { CAREER: 0, NORMAL: 1, RANKED: 6 };
            matchMode = types[typeUpper] !== undefined ? types[typeUpper] : 0;
            url = constants_1.URLS.PLAYER_CS_STATS(this.session.serverUrl);
            protoFile = 'PlayerCSStats.proto';
            payload.gamemode = 15;
            payload.matchmode = matchMode;
        }
        const encryptedBody = await protobuf_1.protoHandler.encode(protoFile, 'request', payload, true);
        try {
            const response = await axios_1.default.post(url, encryptedBody, {
                headers: { ...this._headers(obVersion), Authorization: `Bearer ${this.session.token}` },
                responseType: 'arraybuffer',
                timeout: 30000
            });
            const decoded = await protobuf_1.protoHandler.decode(protoFile, 'response', response.data);
            return decoded;
        }
        catch (error) {
            throw new Error(`Get Stats Failed: ${(0, types_1.getErrorMessage)(error)}`);
        }
    }
    async _checkSession(obVersion) {
        if (!this.session.token || !this.session.serverUrl) {
            await this.loginWithRandomCredentialFromAll(obVersion);
        }
    }
    /**
     * Registers a new guest account in the specified region.
     * @param region - Target region code (e.g., 'IND').
     * @param nickname - Optional nickname; a random one is generated if omitted.
     * @param obVersion - Optional OB override for this request only (e.g. 'OB55').
     * @returns Registration result containing UID, password, and region.
     */
    async register(region, nickname = null, obVersion) {
        const password = this._generateRandomPassword();
        const passwordHash = crypto_1.default.createHash('sha256').update(password).digest('hex').toUpperCase();
        const uid = await this._guestRegister(passwordHash);
        if (!uid)
            throw new Error('Guest registration failed');
        const garenaData = await this._getGarenaTokenForRegister(uid, passwordHash);
        if (!garenaData?.access_token)
            throw new Error('Token grant failed after registration');
        const autoNickname = nickname || `senos${Math.floor(Math.random() * 9999) + 1}`;
        const registerData = await this._majorRegister(autoNickname, garenaData.access_token, garenaData.open_id, region, obVersion);
        if (!registerData.success)
            throw new Error(`Major registration failed: ${registerData.error || 'Unknown error'}`);
        return { uid, password, passwordHash, region, nickname: autoNickname };
    }
    _generateRandomPassword() {
        return String(Math.floor(Math.random() * 9000000000) + 1000000000);
    }
    async _guestRegister(passwordHash) {
        const params = new URLSearchParams();
        params.append('password', passwordHash);
        params.append('client_type', '2');
        params.append('source', '2');
        params.append('app_id', constants_1.GARENA_CLIENT.CLIENT_ID);
        const signature = crypto_1.default.createHmac('sha256', constants_1.GARENA_CLIENT.CLIENT_SECRET).update(params.toString()).digest('hex');
        try {
            const response = await axios_1.default.post(constants_1.URLS.GUEST_REGISTER, params, {
                headers: {
                    ...constants_1.HEADERS.GARENA_AUTH,
                    Authorization: `Signature ${signature}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 30000
            });
            return response.data.uid;
        }
        catch (error) {
            throw new Error(`Guest Register Failed: ${(0, types_1.getErrorMessage)(error)}`);
        }
    }
    async _getGarenaTokenForRegister(uid, passwordHash) {
        const params = new URLSearchParams();
        params.append('uid', uid);
        params.append('password', passwordHash);
        params.append('response_type', 'token');
        params.append('client_type', '2');
        params.append('client_secret', constants_1.GARENA_CLIENT.CLIENT_SECRET);
        params.append('client_id', constants_1.GARENA_CLIENT.CLIENT_ID);
        try {
            const response = await axios_1.default.post(constants_1.URLS.GARENA_TOKEN, params, { headers: constants_1.HEADERS.GARENA_AUTH, timeout: 30000 });
            return response.data;
        }
        catch (error) {
            throw new Error(`Token Grant Failed: ${(0, types_1.getErrorMessage)(error)}`);
        }
    }
    _xorEncryptOpenId(openId) {
        const k = [0, 0, 0, 2, 0, 1, 7, 0, 0, 0, 0, 0, 2, 0, 1, 7, 0, 0, 0, 0, 0, 2, 0, 1, 7, 0, 0, 0, 0, 0, 2, 0];
        const bytes = Buffer.from(openId, 'utf8');
        const result = Buffer.alloc(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            result[i] = bytes[i] ^ k[i % k.length] ^ 48;
        }
        return result;
    }
    _encodeVarint(n) {
        const result = [];
        while (n > 0x7f) {
            result.push((n & 0x7f) | 0x80);
            n >>= 7;
        }
        result.push(n);
        return Buffer.from(result);
    }
    _encodeField(fieldNum, value) {
        if (typeof value === 'number' && Number.isInteger(value)) {
            const tag = (fieldNum << 3) | 0;
            const varint = this._encodeVarint(value);
            return Buffer.concat([this._encodeVarint(tag), varint]);
        }
        if (typeof value === 'string') {
            const bytes = Buffer.from(value, 'utf8');
            const tag = (fieldNum << 3) | 2;
            return Buffer.concat([this._encodeVarint(tag), this._encodeVarint(bytes.length), bytes]);
        }
        if (Buffer.isBuffer(value)) {
            const tag = (fieldNum << 3) | 2;
            return Buffer.concat([this._encodeVarint(tag), this._encodeVarint(value.length), value]);
        }
        throw new Error('Unsupported protobuf field type');
    }
    _manualProtobufEncode(data) {
        const parts = [];
        const entries = Object.entries(data).sort((a, b) => Number(a[0]) - Number(b[0]));
        for (const [fieldNum, value] of entries) {
            parts.push(this._encodeField(Number(fieldNum), value));
        }
        return Buffer.concat(parts);
    }
    async _majorRegister(nickname, accessToken, openId, region, obVersion) {
        const encryptedOpenId = this._xorEncryptOpenId(openId);
        const payload = {
            1: nickname,
            2: accessToken,
            3: openId,
            5: 102000007,
            6: 4,
            7: 1,
            13: 1,
            14: encryptedOpenId,
            15: region,
            16: 1
        };
        const protoBytes = this._manualProtobufEncode(payload);
        const { encrypt } = await Promise.resolve().then(() => __importStar(require('./crypto')));
        const encryptedBody = encrypt(protoBytes);
        const headers = this._headers(obVersion);
        try {
            const response = await axios_1.default.post(constants_1.URLS.MAJOR_REGISTER, encryptedBody, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'X-Unity-Version': headers['X-Unity-Version'] || '2018.4.11f1',
                    'X-GA': headers['X-GA'] || 'v1 1',
                    ReleaseVersion: headers['ReleaseVersion'],
                    'Content-Type': 'application/octet-stream',
                    'User-Agent': constants_1.HEADERS.GARENA_AUTH['User-Agent'],
                    Host: 'loginbp.ggblueshark.com',
                    Connection: 'Keep-Alive',
                    'Accept-Encoding': 'gzip'
                },
                responseType: 'arraybuffer',
                validateStatus: () => true,
                timeout: 30000
            });
            if (response.status === 200)
                return { success: true };
            let errorDetail = `HTTP ${response.status}`;
            try {
                if (Buffer.isBuffer(response.data)) {
                    errorDetail += ` | Response: ${response.data.toString('hex').substring(0, 100)}`;
                }
            }
            catch {
                // ignore
            }
            return { success: false, error: errorDetail };
        }
        catch (error) {
            return { success: false, error: `Request failed: ${(0, types_1.getErrorMessage)(error)}` };
        }
    }
    _manualProtobufDecode(buffer) {
        const result = {};
        let offset = 0;
        while (offset < buffer.length) {
            let tag = 0;
            let shift = 0;
            while (true) {
                const byte = buffer[offset++];
                tag |= (byte & 0x7f) << shift;
                shift += 7;
                if ((byte & 0x80) === 0)
                    break;
            }
            const fieldNum = tag >> 3;
            const wireType = tag & 0x07;
            if (wireType === 0) {
                let value = 0;
                shift = 0;
                while (true) {
                    const byte = buffer[offset++];
                    value |= (byte & 0x7f) << shift;
                    shift += 7;
                    if ((byte & 0x80) === 0)
                        break;
                }
                result[fieldNum] = value;
            }
            else if (wireType === 2) {
                let length = 0;
                shift = 0;
                while (true) {
                    const byte = buffer[offset++];
                    length |= (byte & 0x7f) << shift;
                    shift += 7;
                    if ((byte & 0x80) === 0)
                        break;
                }
                result[fieldNum] = buffer.slice(offset, offset + length).toString('utf8');
                offset += length;
            }
        }
        return result;
    }
}
exports.FreeFireAPI = FreeFireAPI;
//# sourceMappingURL=api.js.map