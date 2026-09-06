import {
  DEFAULT_OB_VERSION,
  GARENA_CLIENT,
  HEADERS,
  URLS,
  __toCommonJS,
  crypto_exports,
  encrypt,
  getCommonHeaders,
  init_constants,
  init_crypto,
  init_resolve_path,
  normalizeObVersion,
  resolveObVersion,
  resolveProjectDir,
  resolveProjectFile
} from "./chunk-QCQGMS43.mjs";

// src/lib/api.ts
import axios from "axios";
import crypto from "crypto";

// src/lib/protobuf.ts
init_crypto();
init_resolve_path();
import protobuf from "protobufjs";
import path from "path";
var PROTO_DIR = resolveProjectDir("proto");
var ProtoHandler = class {
  constructor() {
    this.roots = {};
  }
  async load(filename) {
    if (!this.roots[filename]) {
      this.roots[filename] = await protobuf.load(path.join(PROTO_DIR, filename));
    }
    return this.roots[filename];
  }
  async encode(filename, messageName, payload, shouldEncrypt = true) {
    const root = await this.load(filename);
    const Type = root.lookupType(messageName);
    const errMsg = Type.verify(payload);
    if (errMsg) throw new Error(errMsg);
    const message = Type.create(payload);
    const buffer = Type.encode(message).finish();
    if (shouldEncrypt) {
      return encrypt(Buffer.from(buffer));
    }
    return Buffer.from(buffer);
  }
  async decode(filename, messageName, buffer) {
    const root = await this.load(filename);
    const Type = root.lookupType(messageName);
    const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    const message = Type.decode(buf);
    return Type.toObject(message, {
      longs: String,
      enums: String,
      bytes: String,
      defaults: true,
      arrays: true
    });
  }
};
var protoHandler = new ProtoHandler();

// src/lib/api.ts
init_constants();

// src/lib/utils.ts
import fs from "fs";

// src/types/index.ts
function getErrorMessage(error) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return String(error);
}

// src/lib/utils.ts
init_resolve_path();
function coerceString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (value === null || value === void 0) return fallback;
  return String(value);
}
function coerceBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  return fallback;
}
var itemsDb = null;
function loadItems() {
  if (itemsDb) return itemsDb;
  try {
    const data = fs.readFileSync(resolveProjectFile("data/items.json"), "utf8");
    const itemsList = JSON.parse(data);
    itemsDb = {};
    for (const item of itemsList) {
      const rawId = item.id ?? item.itemID;
      const id = typeof rawId === "string" || typeof rawId === "number" ? rawId : void 0;
      if (id !== void 0) itemsDb[String(id)] = item;
    }
    console.log(`Loaded ${Object.keys(itemsDb).length} items into database.`);
  } catch (e) {
    console.error("Failed to load items database:", getErrorMessage(e));
    itemsDb = {};
  }
  return itemsDb;
}
function getItemDetails(itemId) {
  const db = loadItems();
  const itemStrId = String(itemId);
  const currentItem = {
    id: itemId,
    name: "Unknown Item",
    type: "UNKNOWN",
    rarity: "NONE",
    description: "",
    is_unique: false,
    image: `https://raw.githubusercontent.com/ashqking/FF-Items/main/ICONS/${itemId}.png`,
    image_fallback: `https://raw.githubusercontent.com/I-SHOW-AKIRU200/AKIRU-ICONS/main/ICONS/${itemId}.png`
  };
  if (db[itemStrId]) {
    const itemData = db[itemStrId];
    currentItem.name = coerceString(itemData.name ?? itemData.description ?? "Unknown Name");
    currentItem.type = coerceString(itemData.type ?? "UNKNOWN");
    currentItem.collection_type = coerceString(itemData.collection_type ?? "NONE");
    currentItem.rarity = coerceString(itemData.rare ?? "NONE");
    currentItem.description = coerceString(itemData.description ?? "");
    currentItem.is_unique = coerceBoolean(itemData.is_unique ?? false);
    currentItem.icon_code = coerceString(itemData.icon ?? "");
  }
  return currentItem;
}
function processPlayerItems(playerData) {
  const profileInfo = playerData.profileinfo;
  const basicInfo = playerData.basicinfo;
  const petInfo = playerData.petinfo;
  const outfitIds = profileInfo.clothes ?? [];
  const outfitDetails = outfitIds.map(getItemDetails);
  const weaponIds = basicInfo.weaponskinshows ?? [];
  const weaponDetails = weaponIds.map(getItemDetails);
  const skillIds = profileInfo.equipedskills ?? [];
  const skillDetails = skillIds.map(getItemDetails);
  let petDetails = null;
  if (petInfo && (petInfo.id || petInfo.skinid)) {
    petDetails = {
      id: getItemDetails(petInfo.id),
      name: petInfo.name || "",
      level: petInfo.level || 0,
      skin: getItemDetails(petInfo.skinid),
      selected_skill: getItemDetails(petInfo.selectedskillid)
    };
  }
  const normalizedBasicInfo = {
    accountid: basicInfo.accountid || "",
    nickname: basicInfo.nickname || "",
    level: basicInfo.level || 0,
    region: basicInfo.region || "",
    liked: basicInfo.liked || "",
    signature: basicInfo.signature || ""
  };
  return {
    basic_info: normalizedBasicInfo,
    items: {
      outfit: outfitDetails,
      skills: { equipped: skillDetails },
      weapons: { shown_skins: weaponDetails },
      pet: petDetails
    }
  };
}

// src/lib/credential-manager.ts
import fs2 from "fs";
init_resolve_path();
var CredentialManager = class {
  /**
   * @param region - Region code whose credential YAML file will be loaded.
   */
  constructor(region) {
    this.pool = [];
    this.currentIndex = 0;
    this.usageData = {};
    this.region = region;
    this._loadPool();
  }
  _loadPool() {
    const filePath = resolveProjectFile(`config/credentials/${this.region}.yaml`);
    try {
      const content = fs2.readFileSync(filePath, "utf8");
      const lines = content.split("\n");
      let currentAccount = null;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("- uid:")) {
          if (currentAccount) {
            this.pool.push(currentAccount);
          }
          const uidMatch = trimmed.match(/uid:\s*"([^"]+)"/);
          currentAccount = { uid: uidMatch ? uidMatch[1] : "", password: "" };
        } else if (trimmed.startsWith("password:") && currentAccount) {
          const pwdMatch = trimmed.match(/password:\s*"([^"]+)"/);
          if (pwdMatch) {
            currentAccount.password = pwdMatch[1];
          }
        }
      }
      if (currentAccount && currentAccount.password) {
        this.pool.push(currentAccount);
      }
      console.log(`[CredentialManager] Loaded ${this.pool.length} accounts for ${this.region}`);
    } catch (error) {
      console.error(`[CredentialManager] Failed to load credentials for ${this.region}:`, getErrorMessage(error));
      this.pool = [];
    }
  }
  isUsedForTarget(targetUid, guestUid) {
    if (!this.usageData[targetUid]) return false;
    return this.usageData[targetUid].used_guests[guestUid] !== void 0;
  }
  markUsed(targetUid, guestUid) {
    if (!this.usageData[targetUid]) {
      this.usageData[targetUid] = { used_guests: {}, total_likes: 0 };
    }
    this.usageData[targetUid].used_guests[guestUid] = (/* @__PURE__ */ new Date()).toISOString();
    this.usageData[targetUid].total_likes = Object.keys(this.usageData[targetUid].used_guests).length;
  }
  getRandomCredential() {
    if (this.pool.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.pool.length);
    return this.pool[randomIndex];
  }
  getNextCredential() {
    if (this.pool.length === 0) return null;
    const cred = this.pool[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.pool.length;
    return cred;
  }
  getNextForTarget(targetUid) {
    const available = this.pool.filter((acc) => !this.isUsedForTarget(targetUid, acc.uid));
    if (available.length === 0) return null;
    return available[0];
  }
  getMultipleForTarget(targetUid, count) {
    const available = this.pool.filter((acc) => !this.isUsedForTarget(targetUid, acc.uid));
    return available.slice(0, count);
  }
  getAvailableCount(targetUid) {
    return this.pool.filter((acc) => !this.isUsedForTarget(targetUid, acc.uid)).length;
  }
  getPoolSize() {
    return this.pool.length;
  }
  clearUsage(targetUid) {
    if (targetUid) {
      delete this.usageData[targetUid];
    } else {
      this.usageData = {};
    }
  }
};

// src/lib/api.ts
import fs3 from "fs";
import path2 from "path";
init_resolve_path();
function parseObArg(arg) {
  if (arg === void 0 || arg === null) return null;
  if (typeof arg === "object") return normalizeObVersion(arg.obVersion);
  return normalizeObVersion(arg);
}
var FreeFireAPI = class {
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
    this.credentialManager = region ? new CredentialManager(region) : null;
    if (typeof options === "string") {
      this.obVersion = normalizeObVersion(options);
    } else if (options && typeof options === "object") {
      this.obVersion = normalizeObVersion(options.obVersion);
    }
  }
  /**
   * Set instance-level OB override (e.g. `api.setObVersion('OB55')`).
   * Pass `null` to clear and fall back to `config/settings.yaml` / env.
   */
  setObVersion(version) {
    this.obVersion = normalizeObVersion(version);
  }
  /**
   * Get effective OB version (instance override > env > settings.yaml default).
   */
  getObVersion() {
    return resolveObVersion(null, this.obVersion);
  }
  _headers(requestOb) {
    return getCommonHeaders(parseObArg(requestOb), this.obVersion);
  }
  /**
   * Switches the active region and initializes a new credential manager.
   * @param region - Region code to switch to.
   */
  setRegion(region) {
    this.region = region;
    this.credentialManager = new CredentialManager(region);
  }
  _loadAllCredentials() {
    if (this.allCredentials) return this.allCredentials;
    const allCreds = [];
    const credentialsDir = resolveProjectDir("config/credentials");
    try {
      const files = fs3.readdirSync(credentialsDir);
      for (const file of files) {
        if (file.endsWith(".yaml")) {
          const filePath = path2.join(credentialsDir, file);
          const content = fs3.readFileSync(filePath, "utf8");
          const lines = content.split("\n");
          let currentAccount = null;
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("- uid:")) {
              if (currentAccount) allCreds.push(currentAccount);
              const uidMatch = trimmed.match(/uid:\s*"([^"]+)"/);
              currentAccount = { uid: uidMatch ? uidMatch[1] : "", password: "" };
            } else if (trimmed.startsWith("password:") && currentAccount) {
              const pwdMatch = trimmed.match(/password:\s*"([^"]+)"/);
              if (pwdMatch) currentAccount.password = pwdMatch[1];
            }
          }
          if (currentAccount && currentAccount.password) allCreds.push(currentAccount);
        }
      }
    } catch (error) {
      console.error("[API] Failed to load all credentials:", getErrorMessage(error));
    }
    this.allCredentials = allCreds;
    console.log(`[API] Loaded ${allCreds.length} credentials from all regions`);
    return allCreds;
  }
  _getRandomCredentialFromAll() {
    const creds = this._loadAllCredentials();
    if (creds.length === 0) throw new Error("No credentials available in any region");
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
    if (!cred) throw new Error(`No credentials available in pool for region ${this.region}`);
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
    if (!uid || !password) throw new Error("Missing credentials. Please provide UID and PASSWORD to login(uid, password).");
    const garenaData = await this._getGarenaToken(uid, password);
    if (!garenaData?.access_token) throw new Error("Garena authentication failed: Invalid credentials or response");
    const loginData = await this._majorLogin(garenaData.access_token, garenaData.open_id, obVersion);
    if (!loginData?.token) throw new Error("Major login failed: Empty token received");
    this.session.token = loginData.token;
    this.session.serverUrl = loginData.serverUrl;
    this.session.openId = garenaData.open_id;
    this.session.accountId = loginData.accountId;
    return this.session;
  }
  async _getGarenaToken(uid, password) {
    const params = new URLSearchParams();
    params.append("uid", uid);
    params.append("password", password);
    params.append("response_type", "token");
    params.append("client_type", "2");
    params.append("client_secret", GARENA_CLIENT.CLIENT_SECRET);
    params.append("client_id", GARENA_CLIENT.CLIENT_ID);
    try {
      const response = await axios.post(URLS.GARENA_TOKEN, params, { headers: HEADERS.GARENA_AUTH, timeout: 3e4 });
      return response.data;
    } catch (error) {
      throw new Error(`Garena Auth Request Failed: ${getErrorMessage(error)}`);
    }
  }
  async _majorLogin(accessToken, openId, obVersion) {
    const payload = { openid: openId, logintoken: accessToken, platform: "4" };
    const encryptedBody = await protoHandler.encode("MajorLogin.proto", "request", payload, true);
    try {
      const response = await axios.post(URLS.MAJOR_LOGIN, encryptedBody, {
        headers: {
          ...this._headers(obVersion),
          Authorization: "Bearer",
          "Content-Type": "application/octet-stream"
        },
        responseType: "arraybuffer",
        timeout: 3e4
      });
      const decoded = await protoHandler.decode("MajorLogin.proto", "response", response.data);
      return decoded;
    } catch (error) {
      throw new Error(`Major Login Request Failed: ${getErrorMessage(error)}`);
    }
  }
  /**
   * Searches for players by nickname across Free Fire servers.
   * @param keyword - Player nickname to search (minimum 3 characters).
   * @param obVersion - Optional OB override for this request only (e.g. 'OB55').
   * @returns Array of matching player results.
   */
  async searchAccount(keyword, obVersion) {
    if (!keyword || keyword.length < 3) throw new Error("Search keyword must be at least 3 characters long.");
    if (!this.session.token) await this.loginWithRandomCredential(obVersion);
    const payload = { keyword: String(keyword) };
    const encryptedBody = await protoHandler.encode("SearchAccountByName.proto", "SearchAccountByName.request", payload, true);
    const url = URLS.SEARCH(this.session.serverUrl);
    try {
      const response = await axios.post(url, encryptedBody, {
        headers: {
          ...this._headers(obVersion),
          Authorization: `Bearer ${this.session.token}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        responseType: "arraybuffer",
        timeout: 3e4
      });
      const data = await protoHandler.decode("SearchAccountByName.proto", "SearchAccountByName.response", response.data);
      return data.infos || [];
    } catch (error) {
      throw new Error(`Search Failed: ${getErrorMessage(error)}`);
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
    const encryptedBody = await protoHandler.encode("PlayerPersonalShow.proto", "request", payload, true);
    const url = URLS.PERSONAL_SHOW(this.session.serverUrl);
    try {
      const response = await axios.post(url, encryptedBody, {
        headers: { ...this._headers(obVersion), Authorization: `Bearer ${this.session.token}` },
        responseType: "arraybuffer",
        timeout: 3e4
      });
      const decoded = await protoHandler.decode("PlayerPersonalShow.proto", "response", response.data);
      return decoded;
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : 0;
      if (!isRetry && (status === 400 || status === 401)) {
        this.session.token = null;
        await this._checkSession(obVersion);
        return this._requestProfile(uid, true, obVersion);
      }
      throw new Error(`Get Profile Failed: ${getErrorMessage(error)}`);
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
    if (!profile) return null;
    return processPlayerItems(profile);
  }
  /**
   * Retrieves match statistics for a player.
   * @param uid - Target player UID.
   * @param mode - Game mode: 'br' (Battle Royale) or 'cs' (Clash Squad).
   * @param matchType - Match type: 'career', 'ranked', or 'normal'.
   * @param obVersion - Optional OB override for this request only (e.g. 'OB55').
   * @returns Structured stats object for solo, duo, and squad matches.
   */
  async getPlayerStats(uid, mode = "br", matchType = "career", obVersion) {
    if (!this.session.token) await this.loginWithRandomCredential(obVersion);
    const modeLower = mode.toLowerCase();
    const typeUpper = matchType.toUpperCase();
    let matchMode = 0;
    let url = "";
    let protoFile = "";
    const payload = { accountid: Number(uid) };
    if (modeLower === "br") {
      const types = { CAREER: 0, NORMAL: 1, RANKED: 2 };
      matchMode = types[typeUpper] !== void 0 ? types[typeUpper] : 0;
      url = URLS.PLAYER_STATS(this.session.serverUrl);
      protoFile = "PlayerStats.proto";
      payload.matchmode = matchMode;
    } else {
      const types = { CAREER: 0, NORMAL: 1, RANKED: 6 };
      matchMode = types[typeUpper] !== void 0 ? types[typeUpper] : 0;
      url = URLS.PLAYER_CS_STATS(this.session.serverUrl);
      protoFile = "PlayerCSStats.proto";
      payload.gamemode = 15;
      payload.matchmode = matchMode;
    }
    const encryptedBody = await protoHandler.encode(protoFile, "request", payload, true);
    try {
      const response = await axios.post(url, encryptedBody, {
        headers: { ...this._headers(obVersion), Authorization: `Bearer ${this.session.token}` },
        responseType: "arraybuffer",
        timeout: 3e4
      });
      const decoded = await protoHandler.decode(protoFile, "response", response.data);
      return decoded;
    } catch (error) {
      throw new Error(`Get Stats Failed: ${getErrorMessage(error)}`);
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
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex").toUpperCase();
    const uid = await this._guestRegister(passwordHash);
    if (!uid) throw new Error("Guest registration failed");
    const garenaData = await this._getGarenaTokenForRegister(uid, passwordHash);
    if (!garenaData?.access_token) throw new Error("Token grant failed after registration");
    const autoNickname = nickname || `senos${Math.floor(Math.random() * 9999) + 1}`;
    const registerData = await this._majorRegister(autoNickname, garenaData.access_token, garenaData.open_id, region, obVersion);
    if (!registerData.success) throw new Error(`Major registration failed: ${registerData.error || "Unknown error"}`);
    return { uid, password, passwordHash, region, nickname: autoNickname };
  }
  _generateRandomPassword() {
    return String(Math.floor(Math.random() * 9e9) + 1e9);
  }
  async _guestRegister(passwordHash) {
    const params = new URLSearchParams();
    params.append("password", passwordHash);
    params.append("client_type", "2");
    params.append("source", "2");
    params.append("app_id", GARENA_CLIENT.CLIENT_ID);
    const signature = crypto.createHmac("sha256", GARENA_CLIENT.CLIENT_SECRET).update(params.toString()).digest("hex");
    try {
      const response = await axios.post(URLS.GUEST_REGISTER, params, {
        headers: {
          ...HEADERS.GARENA_AUTH,
          Authorization: `Signature ${signature}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        timeout: 3e4
      });
      return response.data.uid;
    } catch (error) {
      throw new Error(`Guest Register Failed: ${getErrorMessage(error)}`);
    }
  }
  async _getGarenaTokenForRegister(uid, passwordHash) {
    const params = new URLSearchParams();
    params.append("uid", uid);
    params.append("password", passwordHash);
    params.append("response_type", "token");
    params.append("client_type", "2");
    params.append("client_secret", GARENA_CLIENT.CLIENT_SECRET);
    params.append("client_id", GARENA_CLIENT.CLIENT_ID);
    try {
      const response = await axios.post(URLS.GARENA_TOKEN, params, { headers: HEADERS.GARENA_AUTH, timeout: 3e4 });
      return response.data;
    } catch (error) {
      throw new Error(`Token Grant Failed: ${getErrorMessage(error)}`);
    }
  }
  _xorEncryptOpenId(openId) {
    const k = [0, 0, 0, 2, 0, 1, 7, 0, 0, 0, 0, 0, 2, 0, 1, 7, 0, 0, 0, 0, 0, 2, 0, 1, 7, 0, 0, 0, 0, 0, 2, 0];
    const bytes = Buffer.from(openId, "utf8");
    const result = Buffer.alloc(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      result[i] = bytes[i] ^ k[i % k.length] ^ 48;
    }
    return result;
  }
  _encodeVarint(n) {
    const result = [];
    while (n > 127) {
      result.push(n & 127 | 128);
      n >>= 7;
    }
    result.push(n);
    return Buffer.from(result);
  }
  _encodeField(fieldNum, value) {
    if (typeof value === "number" && Number.isInteger(value)) {
      const tag = fieldNum << 3 | 0;
      const varint = this._encodeVarint(value);
      return Buffer.concat([this._encodeVarint(tag), varint]);
    }
    if (typeof value === "string") {
      const bytes = Buffer.from(value, "utf8");
      const tag = fieldNum << 3 | 2;
      return Buffer.concat([this._encodeVarint(tag), this._encodeVarint(bytes.length), bytes]);
    }
    if (Buffer.isBuffer(value)) {
      const tag = fieldNum << 3 | 2;
      return Buffer.concat([this._encodeVarint(tag), this._encodeVarint(value.length), value]);
    }
    throw new Error("Unsupported protobuf field type");
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
    const { encrypt: encrypt2 } = await import("./crypto-DANWAOHN.mjs");
    const encryptedBody = encrypt2(protoBytes);
    const headers = this._headers(obVersion);
    try {
      const response = await axios.post(URLS.MAJOR_REGISTER, encryptedBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Unity-Version": headers["X-Unity-Version"] || "2018.4.11f1",
          "X-GA": headers["X-GA"] || "v1 1",
          ReleaseVersion: headers["ReleaseVersion"],
          "Content-Type": "application/octet-stream",
          "User-Agent": HEADERS.GARENA_AUTH["User-Agent"],
          Host: "loginbp.ggblueshark.com",
          Connection: "Keep-Alive",
          "Accept-Encoding": "gzip"
        },
        responseType: "arraybuffer",
        validateStatus: () => true,
        timeout: 3e4
      });
      if (response.status === 200) return { success: true };
      let errorDetail = `HTTP ${response.status}`;
      try {
        if (Buffer.isBuffer(response.data)) {
          errorDetail += ` | Response: ${response.data.toString("hex").substring(0, 100)}`;
        }
      } catch {
      }
      return { success: false, error: errorDetail };
    } catch (error) {
      return { success: false, error: `Request failed: ${getErrorMessage(error)}` };
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
        tag |= (byte & 127) << shift;
        shift += 7;
        if ((byte & 128) === 0) break;
      }
      const fieldNum = tag >> 3;
      const wireType = tag & 7;
      if (wireType === 0) {
        let value = 0;
        shift = 0;
        while (true) {
          const byte = buffer[offset++];
          value |= (byte & 127) << shift;
          shift += 7;
          if ((byte & 128) === 0) break;
        }
        result[fieldNum] = value;
      } else if (wireType === 2) {
        let length = 0;
        shift = 0;
        while (true) {
          const byte = buffer[offset++];
          length |= (byte & 127) << shift;
          shift += 7;
          if ((byte & 128) === 0) break;
        }
        result[fieldNum] = buffer.slice(offset, offset + length).toString("utf8");
        offset += length;
      }
    }
    return result;
  }
};

// src/lib/like.ts
init_constants();
import axios2 from "axios";
function parseObArg2(arg) {
  if (arg === void 0 || arg === null) return null;
  if (typeof arg === "object") return normalizeObVersion(arg.obVersion);
  return normalizeObVersion(arg);
}
var LikeAPI = class {
  /**
   * @param options - Optional instance OB override. Example: `new LikeAPI({ obVersion: 'OB55' })` or `new LikeAPI('OB55')`.
   */
  constructor(options) {
    this.credentialManagers = {};
    this.obVersion = null;
    if (typeof options === "string") {
      this.obVersion = normalizeObVersion(options);
    } else if (options && typeof options === "object") {
      this.obVersion = normalizeObVersion(options.obVersion);
    }
  }
  /**
   * Set instance-level OB override (e.g. `like.setObVersion('OB55')`).
   * Pass `null` to clear and fall back to settings.yaml / env.
   */
  setObVersion(version) {
    this.obVersion = normalizeObVersion(version);
  }
  /** Get effective OB version (instance override > env > settings.yaml default). */
  getObVersion() {
    return getCommonHeaders(null, this.obVersion)["ReleaseVersion"];
  }
  _headers(requestOb) {
    return getCommonHeaders(parseObArg2(requestOb), this.obVersion);
  }
  _getCredentialManager(region) {
    if (!this.credentialManagers[region]) {
      this.credentialManagers[region] = new CredentialManager(region);
    }
    return this.credentialManagers[region];
  }
  _getBaseUrl(region) {
    const regionUpper = region.toUpperCase();
    if (regionUpper === "IND") return "https://client.ind.freefiremobile.com";
    if (["BR", "US", "SAC", "NA"].includes(regionUpper)) return "https://client.us.freefiremobile.com";
    return "https://clientbp.ggblueshark.com";
  }
  async _login(uid, password, obVersion) {
    try {
      const params = new URLSearchParams();
      params.append("uid", uid);
      params.append("password", password);
      params.append("response_type", "token");
      params.append("client_type", "2");
      params.append("client_secret", GARENA_CLIENT.CLIENT_SECRET);
      params.append("client_id", GARENA_CLIENT.CLIENT_ID);
      const tokenResponse = await axios2.post(URLS.GARENA_TOKEN, params, { headers: HEADERS.GARENA_AUTH, timeout: 3e4 });
      if (!tokenResponse.data?.access_token) return null;
      const accessToken = tokenResponse.data.access_token;
      const openId = tokenResponse.data.open_id;
      const loginPayload = { openid: openId, logintoken: accessToken, platform: "4" };
      const encryptedBody = await protoHandler.encode("MajorLogin.proto", "request", loginPayload, true);
      const headers = this._headers(obVersion);
      const loginResponse = await axios2.post(URLS.MAJOR_LOGIN, encryptedBody, {
        headers: {
          ...headers,
          Authorization: "Bearer",
          "Content-Type": "application/octet-stream"
        },
        responseType: "arraybuffer",
        timeout: 3e4
      });
      const loginData = await protoHandler.decode("MajorLogin.proto", "response", loginResponse.data);
      if (loginData && typeof loginData === "object" && "token" in loginData) {
        const decoded = loginData;
        return {
          jwt: decoded.token,
          serverUrl: decoded.serverUrl || "",
          accountId: decoded.accountId
        };
      }
      return null;
    } catch (error) {
      console.log(`[LikeAPI] Login error: ${getErrorMessage(error)}`);
      return null;
    }
  }
  _createLikePayload(targetUid, region) {
    const fields = [];
    const targetBytes = Buffer.from(targetUid, "utf8");
    fields.push(Buffer.concat([Buffer.from([10, targetBytes.length]), targetBytes]));
    const regionBytes = Buffer.from(region, "utf8");
    fields.push(Buffer.concat([Buffer.from([18, regionBytes.length]), regionBytes]));
    const payload = Buffer.concat(fields);
    const { encrypt: encrypt2 } = (init_crypto(), __toCommonJS(crypto_exports));
    return encrypt2(payload);
  }
  async _sendLikeWithGuest(guest, targetUid, region, obVersion) {
    try {
      const auth = await this._login(guest.uid, guest.password, obVersion);
      if (!auth) return { success: false, error: "Login failed" };
      const serverUrl = auth.serverUrl || this._getBaseUrl(region);
      const payload = this._createLikePayload(targetUid, region);
      const base = this._headers(obVersion);
      const headers = {
        "User-Agent": base["User-Agent"],
        Connection: base["Connection"],
        "Accept-Encoding": base["Accept-Encoding"],
        "Content-Type": "application/octet-stream",
        Expect: base["Expect"],
        Authorization: `Bearer ${auth.jwt}`,
        "X-Unity-Version": base["X-Unity-Version"],
        "X-GA": base["X-GA"],
        ReleaseVersion: base["ReleaseVersion"]
      };
      const response = await axios2.post(`${serverUrl}/LikeProfile`, payload, {
        headers,
        timeout: 3e4,
        responseType: "arraybuffer"
      });
      if (response.status === 200) return { success: true };
      return { success: false, error: `HTTP ${response.status}` };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
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
    if (typeof likeCount === "object" && likeCount !== null) {
      count = likeCount.likeCount ?? 100;
      if (likeCount.obVersion !== void 0) effectiveOb = likeCount.obVersion;
    } else if (typeof likeCount === "number") {
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
        message: "No available guests left for this target. All guests have been used.",
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
      process.stdout.write(`[LikeAPI] Progress: ${i + 1}/${guests.length} (${successCount}\u2713 ${failedCount}\u2717)\r`);
      const result = await this._sendLikeWithGuest(guest, targetUid, region, effectiveOb);
      if (result.success) {
        successCount++;
        cm.markUsed(targetUid, guest.uid);
      } else {
        failedCount++;
        console.log(`
[LikeAPI] Guest ${guest.uid} failed: ${result.error}`);
      }
      if (i < guests.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1e3));
      }
    }
    console.log(`
[LikeAPI] Completed: ${successCount}/${guests.length} likes sent successfully`);
    return {
      success: successCount > 0,
      successCount,
      failedCount,
      remainingGuests: cm.getAvailableCount(targetUid),
      message: `Sent ${successCount} likes to ${targetUid}. ${cm.getAvailableCount(targetUid)} guests remaining.`
    };
  }
};

// src/index.ts
init_crypto();

// src/lib/ai-tools.ts
var freefireTools = [
  {
    type: "function",
    function: {
      name: "search_player",
      description: "Search Free Fire players by nickname. Returns matching players with their account ID, nickname, and level. Optional obVersion (e.g. OB55) overrides the bundled OB for this call.",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: "Player nickname to search. Minimum 3 characters.",
            minLength: 3
          },
          obVersion: {
            type: "string",
            description: 'Optional OB override, e.g. "OB55". Use when library default is outdated. Accepts "55" or "OB55".'
          }
        },
        required: ["keyword"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_player_profile",
      description: "Get detailed profile information for a Free Fire player including basic info, clan, pet, and equipment.",
      parameters: {
        type: "object",
        properties: {
          uid: {
            type: "string",
            description: "Target player UID (account ID)."
          },
          obVersion: {
            type: "string",
            description: 'Optional OB override, e.g. "OB55".'
          }
        },
        required: ["uid"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_player_items",
      description: "Get a player's equipped items including outfit, weapons skins, skills, and pet details with metadata from the items database.",
      parameters: {
        type: "object",
        properties: {
          uid: {
            type: "string",
            description: "Target player UID (account ID)."
          },
          obVersion: {
            type: "string",
            description: 'Optional OB override, e.g. "OB55".'
          }
        },
        required: ["uid"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_player_stats",
      description: "Retrieve match statistics for a player. Supports Battle Royale (BR) and Clash Squad (CS) modes.",
      parameters: {
        type: "object",
        properties: {
          uid: {
            type: "string",
            description: "Target player UID (account ID)."
          },
          mode: {
            type: "string",
            description: "Game mode: br (Battle Royale) or cs (Clash Squad). Defaults to br.",
            enum: ["br", "cs"]
          },
          matchType: {
            type: "string",
            description: "Match type: career, ranked, or normal. Defaults to career.",
            enum: ["career", "ranked", "normal"]
          },
          obVersion: {
            type: "string",
            description: 'Optional OB override, e.g. "OB55".'
          }
        },
        required: ["uid"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "send_likes",
      description: "Send profile likes to a target player using available guest accounts. Maximum 100 likes per day per target.",
      parameters: {
        type: "object",
        properties: {
          targetUid: {
            type: "string",
            description: "UID of the player to receive likes."
          },
          region: {
            type: "string",
            description: "Region code (e.g., IND, BR, US)."
          },
          likeCount: {
            type: "number",
            description: "Number of likes to send. Defaults to 100, max 100.",
            minimum: 1,
            maximum: 100
          },
          obVersion: {
            type: "string",
            description: 'Optional OB override, e.g. "OB55".'
          }
        },
        required: ["targetUid", "region"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "register_account",
      description: "Register a new guest Free Fire account in the specified region.",
      parameters: {
        type: "object",
        properties: {
          region: {
            type: "string",
            description: "Target region code (e.g., IND, BR)."
          },
          nickname: {
            type: "string",
            description: "Optional nickname. A random one is generated if omitted."
          },
          obVersion: {
            type: "string",
            description: 'Optional OB override, e.g. "OB55".'
          }
        },
        required: ["region"]
      }
    }
  }
];
function getToolByName(name) {
  return freefireTools.find((t) => t.function.name === name);
}
function getToolNames() {
  return freefireTools.map((t) => t.function.name);
}

// src/lib/ai-handler.ts
var FreeFireAIToolHandler = class {
  constructor(options = {}) {
    this.defaultObVersion = options.obVersion ?? null;
    this.api = new FreeFireAPI(options.region || null, { obVersion: this.defaultObVersion });
    this.likeApi = new LikeAPI({ obVersion: this.defaultObVersion });
  }
  async execute(toolCall) {
    const tool = getToolByName(toolCall.function.name);
    if (!tool) {
      return this._buildResult(toolCall, `Error: Unknown tool "${toolCall.function.name}"`);
    }
    let args;
    try {
      args = JSON.parse(toolCall.function.arguments);
    } catch {
      return this._buildResult(toolCall, "Error: Invalid JSON in tool arguments");
    }
    try {
      const result = await this._dispatch(toolCall.function.name, args);
      return this._buildResult(toolCall, JSON.stringify(result));
    } catch (error) {
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
    const obVersion = typeof args.obVersion === "string" || typeof args.obVersion === "number" ? String(args.obVersion) : void 0;
    switch (name) {
      case "search_player": {
        const keyword = String(args.keyword);
        const results = await this.api.searchAccount(keyword, obVersion);
        return results.map((r) => ({
          accountid: r.accountid,
          nickname: r.nickname,
          level: r.level
        }));
      }
      case "get_player_profile": {
        const profile = await this.api.getPlayerProfile(String(args.uid), obVersion);
        return this._sanitizeProfile(profile);
      }
      case "get_player_items": {
        const items = await this.api.getPlayerItems(String(args.uid), obVersion);
        return items;
      }
      case "get_player_stats": {
        const stats = await this.api.getPlayerStats(
          String(args.uid),
          args.mode || "br",
          args.matchType || "career",
          obVersion
        );
        return stats;
      }
      case "send_likes": {
        const result = await this.likeApi.sendLikes(
          String(args.targetUid),
          String(args.region),
          args.likeCount ? Number(args.likeCount) : 100,
          obVersion
        );
        return this._sanitizeLikeResult(result);
      }
      case "register_account": {
        const result = await this.api.register(
          String(args.region),
          args.nickname ? String(args.nickname) : null,
          obVersion
        );
        return this._sanitizeRegisterResult(result);
      }
      default:
        throw new Error(`Tool "${name}" is not implemented`);
    }
  }
  _buildResult(toolCall, content) {
    return {
      tool_call_id: toolCall.id,
      role: "tool",
      name: toolCall.function.name,
      content
    };
  }
  _sanitizeProfile(profile) {
    return {
      basicinfo: profile.basicinfo,
      claninfo: profile.claninfo || null,
      petinfo: profile.petinfo ? {
        id: profile.petinfo.id,
        name: profile.petinfo.name,
        level: profile.petinfo.level
      } : null,
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
};

// src/index.ts
init_constants();
export {
  CredentialManager,
  DEFAULT_OB_VERSION,
  FreeFireAIToolHandler,
  FreeFireAPI,
  LikeAPI,
  encrypt,
  freefireTools,
  getCommonHeaders,
  getErrorMessage,
  getItemDetails,
  getToolByName,
  getToolNames,
  loadItems,
  normalizeObVersion,
  processPlayerItems,
  protoHandler,
  resolveObVersion
};
