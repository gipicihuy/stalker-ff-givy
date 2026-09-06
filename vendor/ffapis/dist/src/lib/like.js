"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeAPI = void 0;
const http_client_1 = require("./http-client");
const constants_1 = require("./constants");
const credential_manager_1 = require("./credential-manager");
const protobuf_1 = require("./protobuf");
const types_1 = require("../types");
function parseObArg(arg) {
    if (arg === undefined || arg === null)
        return null;
    if (typeof arg === 'object')
        return (0, constants_1.normalizeObVersion)(arg.obVersion);
    return (0, constants_1.normalizeObVersion)(arg);
}
/**
 * API client for sending profile likes to a target Free Fire player.
 * Manages guest credential pools per region and rotates through them.
 */
class LikeAPI {
    /**
     * @param options - Optional instance OB override. Example: `new LikeAPI({ obVersion: 'OB55' })` or `new LikeAPI('OB55')`.
     */
    constructor(options) {
        this.credentialManagers = {};
        this.obVersion = null;
        if (typeof options === 'string') {
            this.obVersion = (0, constants_1.normalizeObVersion)(options);
        }
        else if (options && typeof options === 'object') {
            this.obVersion = (0, constants_1.normalizeObVersion)(options.obVersion);
        }
    }
    /**
     * Set instance-level OB override (e.g. `like.setObVersion('OB55')`).
     * Pass `null` to clear and fall back to settings.yaml / env.
     */
    setObVersion(version) {
        this.obVersion = (0, constants_1.normalizeObVersion)(version);
    }
    /** Get effective OB version (instance override > env > settings.yaml default). */
    getObVersion() {
        return (0, constants_1.getCommonHeaders)(null, this.obVersion)['ReleaseVersion'];
    }
    _headers(requestOb) {
        return (0, constants_1.getCommonHeaders)(parseObArg(requestOb), this.obVersion);
    }
    _getCredentialManager(region) {
        if (!this.credentialManagers[region]) {
            this.credentialManagers[region] = new credential_manager_1.CredentialManager(region);
        }
        return this.credentialManagers[region];
    }
    _getBaseUrl(region) {
        const regionUpper = region.toUpperCase();
        if (regionUpper === 'IND')
            return 'https://client.ind.freefiremobile.com';
        if (['BR', 'US', 'SAC', 'NA'].includes(regionUpper))
            return 'https://client.us.freefiremobile.com';
        return 'https://clientbp.ggblueshark.com';
    }
    async _login(uid, password, obVersion) {
        try {
            const params = new URLSearchParams();
            params.append('uid', uid);
            params.append('password', password);
            params.append('response_type', 'token');
            params.append('client_type', '2');
            params.append('client_secret', constants_1.GARENA_CLIENT.CLIENT_SECRET);
            params.append('client_id', constants_1.GARENA_CLIENT.CLIENT_ID);
            const tokenResponse = await (0, http_client_1.httpPost)(constants_1.URLS.GARENA_TOKEN, params, { headers: constants_1.HEADERS.GARENA_AUTH, timeout: 30000 });
            if (!tokenResponse.data?.access_token)
                return null;
            const accessToken = tokenResponse.data.access_token;
            const openId = tokenResponse.data.open_id;
            const loginPayload = { openid: openId, logintoken: accessToken, platform: '4' };
            const encryptedBody = await protobuf_1.protoHandler.encode('MajorLogin.proto', 'request', loginPayload, true);
            const headers = this._headers(obVersion);
            const loginResponse = await (0, http_client_1.httpPost)(constants_1.URLS.MAJOR_LOGIN, encryptedBody, {
                headers: {
                    ...headers,
                    Authorization: 'Bearer',
                    'Content-Type': 'application/octet-stream'
                },
                responseType: 'arraybuffer',
                timeout: 30000
            });
            const loginData = await protobuf_1.protoHandler.decode('MajorLogin.proto', 'response', loginResponse.data);
            if (loginData && typeof loginData === 'object' && 'token' in loginData) {
                const decoded = loginData;
                return {
                    jwt: decoded.token,
                    serverUrl: decoded.serverUrl || '',
                    accountId: decoded.accountId
                };
            }
            return null;
        }
        catch (error) {
            console.log(`[LikeAPI] Login error: ${(0, types_1.getErrorMessage)(error)}`);
            return null;
        }
    }
    _createLikePayload(targetUid, region) {
        const fields = [];
        const targetBytes = Buffer.from(targetUid, 'utf8');
        fields.push(Buffer.concat([Buffer.from([0x0a, targetBytes.length]), targetBytes]));
        const regionBytes = Buffer.from(region, 'utf8');
        fields.push(Buffer.concat([Buffer.from([0x12, regionBytes.length]), regionBytes]));
        const payload = Buffer.concat(fields);
        const { encrypt } = require('./crypto');
        return encrypt(payload);
    }
    async _sendLikeWithGuest(guest, targetUid, region, obVersion) {
        try {
            const auth = await this._login(guest.uid, guest.password, obVersion);
            if (!auth)
                return { success: false, error: 'Login failed' };
            const serverUrl = auth.serverUrl || this._getBaseUrl(region);
            const payload = this._createLikePayload(targetUid, region);
            const base = this._headers(obVersion);
            const headers = {
                'User-Agent': base['User-Agent'],
                Connection: base['Connection'],
                'Accept-Encoding': base['Accept-Encoding'],
                'Content-Type': 'application/octet-stream',
                Expect: base['Expect'],
                Authorization: `Bearer ${auth.jwt}`,
                'X-Unity-Version': base['X-Unity-Version'],
                'X-GA': base['X-GA'],
                ReleaseVersion: base['ReleaseVersion']
            };
            const response = await (0, http_client_1.httpPost)(`${serverUrl}/LikeProfile`, payload, {
                headers,
                timeout: 30000,
                responseType: 'arraybuffer'
            });
            if (response.status === 200)
                return { success: true };
            return { success: false, error: `HTTP ${response.status}` };
        }
        catch (error) {
            return { success: false, error: (0, types_1.getErrorMessage)(error) };
        }
    }
    /**
     * Sends likes to a target player using available guest accounts.
     * @param targetUid - UID of the player to receive likes.
     * @param region - Region code (e.g., 'IND', 'BR').
     * @param likeCount - Number of likes to send (default 100, max 100 per day). May also be an options object `{ likeCount, obVersion }`.
     * @param obVersion - Optional OB override for this request only (e.g. 'OB55'). When `likeCount` is an object, use its `obVersion` instead.
     * @returns Summary of the like operation including success and failure counts.
     */
    async sendLikes(targetUid, region, likeCount = 100, obVersion) {
        let count = 100;
        let effectiveOb = obVersion;
        if (typeof likeCount === 'object' && likeCount !== null) {
            count = likeCount.likeCount ?? 100;
            if (likeCount.obVersion !== undefined)
                effectiveOb = likeCount.obVersion;
        }
        else if (typeof likeCount === 'number') {
            count = likeCount;
        }
        const cm = this._getCredentialManager(region);
        const availableCount = cm.getAvailableCount(targetUid);
        console.log(`[LikeAPI] Available guests for ${targetUid}: ${availableCount}/${cm.getPoolSize()}`);
        const maxDaily = 100;
        const requestedLikes = Math.min(count, maxDaily);
        const plannedLikes = Math.min(requestedLikes, availableCount);
        if (plannedLikes === 0) {
            return {
                success: false,
                message: 'No available guests left for this target. All guests have been used.',
                successCount: 0,
                failedCount: 0,
                remainingGuests: 0
            };
        }
        console.log(`[LikeAPI] Planning to send ${plannedLikes} likes to ${targetUid} using ${region} guests`);
        const guests = cm.getMultipleForTarget(targetUid, plannedLikes);
        let successCount = 0;
        let failedCount = 0;
        for (let i = 0; i < guests.length; i++) {
            const guest = guests[i];
            process.stdout.write(`[LikeAPI] Progress: ${i + 1}/${guests.length} (${successCount}✓ ${failedCount}✗)\r`);
            const result = await this._sendLikeWithGuest(guest, targetUid, region, effectiveOb);
            if (result.success) {
                successCount++;
                cm.markUsed(targetUid, guest.uid);
            }
            else {
                failedCount++;
                console.log(`\n[LikeAPI] Guest ${guest.uid} failed: ${result.error}`);
            }
            if (i < guests.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        console.log(`\n[LikeAPI] Completed: ${successCount}/${guests.length} likes sent successfully`);
        return {
            success: successCount > 0,
            successCount,
            failedCount,
            remainingGuests: cm.getAvailableCount(targetUid),
            message: `Sent ${successCount} likes to ${targetUid}. ${cm.getAvailableCount(targetUid)} guests remaining.`
        };
    }
}
exports.LikeAPI = LikeAPI;
//# sourceMappingURL=like.js.map