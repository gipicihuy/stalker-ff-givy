"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lib/resolve-path.ts
function findPackageRoot() {
  let current = __dirname;
  for (let i = 0; i < 5; i++) {
    const pkgPath = import_path.default.join(current, "package.json");
    try {
      const pkg = JSON.parse(import_fs.default.readFileSync(pkgPath, "utf8"));
      if (pkg.name === "ffapis") return current;
    } catch {
    }
    current = import_path.default.dirname(current);
  }
  throw new Error("Could not find ffapis package root. Ensure package.json is present.");
}
function resolveProjectFile(relativePath) {
  const fullPath = import_path.default.join(PACKAGE_ROOT, relativePath);
  if (!import_fs.default.existsSync(fullPath)) {
    throw new Error(`Required file not found: ${fullPath} (resolved from package root: ${PACKAGE_ROOT})`);
  }
  return fullPath;
}
function resolveProjectDir(relativePath) {
  const fullPath = import_path.default.join(PACKAGE_ROOT, relativePath);
  try {
    if (import_fs.default.statSync(fullPath).isDirectory()) return fullPath;
  } catch {
  }
  throw new Error(`Required directory not found: ${fullPath} (resolved from package root: ${PACKAGE_ROOT})`);
}
var import_fs, import_path, PACKAGE_ROOT;
var init_resolve_path = __esm({
  "src/lib/resolve-path.ts"() {
    "use strict";
    import_fs = __toESM(require("fs"));
    import_path = __toESM(require("path"));
    PACKAGE_ROOT = findPackageRoot();
  }
});

// src/lib/constants.ts
function loadYamlFile(filePath) {
  try {
    const yamlRaw = import_fs2.default.readFileSync(filePath, "utf8");
    return import_js_yaml.default.load(yamlRaw);
  } catch {
    return {};
  }
}
function readConfigValue(config, key, fallback) {
  const value = config[key];
  if (value === void 0 || value === null || value === "") {
    if (fallback !== void 0) return fallback;
    throw new Error(`Missing required setting in config/settings.yaml: ${key}`);
  }
  return String(value);
}
function requireConfigValue(config, key) {
  return readConfigValue(config, key);
}
function loadSettings() {
  const parsed = loadYamlFile(resolveProjectFile("config/settings.yaml"));
  return {
    AE: {
      MAIN_KEY: Buffer.from(requireConfigValue(parsed, "AE_MAIN_KEY"), "binary"),
      MAIN_IV: Buffer.from(requireConfigValue(parsed, "AE_MAIN_IV"), "binary")
    },
    HEADERS: {
      COMMON: {
        "User-Agent": requireConfigValue(parsed, "HEADERS_COMMON_USER_AGENT"),
        "Connection": requireConfigValue(parsed, "HEADERS_COMMON_CONNECTION"),
        "Accept-Encoding": requireConfigValue(parsed, "HEADERS_COMMON_ACCEPT_ENCODING"),
        "Expect": requireConfigValue(parsed, "HEADERS_COMMON_EXPECT"),
        "X-Unity-Version": requireConfigValue(parsed, "HEADERS_COMMON_X_UNITY_VERSION"),
        "X-GA": requireConfigValue(parsed, "HEADERS_COMMON_X_GA"),
        "ReleaseVersion": requireConfigValue(parsed, "HEADERS_COMMON_RELEASE_VERSION"),
        "Content-Type": requireConfigValue(parsed, "HEADERS_COMMON_CONTENT_TYPE")
      },
      GARENA_AUTH: {
        "User-Agent": requireConfigValue(parsed, "HEADERS_GARENA_AUTH_USER_AGENT"),
        "Connection": requireConfigValue(parsed, "HEADERS_GARENA_AUTH_CONNECTION"),
        "Accept-Encoding": requireConfigValue(parsed, "HEADERS_GARENA_AUTH_ACCEPT_ENCODING")
      }
    },
    URLS: {
      GARENA_TOKEN: requireConfigValue(parsed, "URL_GARENA_TOKEN"),
      GUEST_REGISTER: requireConfigValue(parsed, "URL_GUEST_REGISTER"),
      MAJOR_LOGIN: requireConfigValue(parsed, "URL_MAJOR_LOGIN"),
      MAJOR_REGISTER: requireConfigValue(parsed, "URL_MAJOR_REGISTER"),
      SEARCH: (serverUrl) => `${serverUrl}${requireConfigValue(parsed, "URL_PATH_SEARCH")}`,
      PERSONAL_SHOW: (serverUrl) => `${serverUrl}${requireConfigValue(parsed, "URL_PATH_PERSONAL_SHOW")}`,
      PLAYER_STATS: (serverUrl) => `${serverUrl}${requireConfigValue(parsed, "URL_PATH_PLAYER_STATS")}`,
      PLAYER_CS_STATS: (serverUrl) => `${serverUrl}${requireConfigValue(parsed, "URL_PATH_PLAYER_CS_STATS")}`
    },
    GARENA_CLIENT: {
      CLIENT_ID: requireConfigValue(parsed, "GARENA_CLIENT_ID"),
      CLIENT_SECRET: requireConfigValue(parsed, "GARENA_CLIENT_SECRET")
    }
  };
}
function normalizeObVersion(input) {
  if (input === void 0 || input === null) return null;
  const raw = String(input).trim();
  if (!raw) return null;
  const upper = raw.toUpperCase();
  const digits = upper.startsWith("OB") ? upper.slice(2) : upper;
  if (!/^\d+$/.test(digits)) return null;
  return `OB${digits}`;
}
function resolveObVersion(requestOb, instanceOb) {
  const fromRequest = normalizeObVersion(requestOb);
  if (fromRequest) return fromRequest;
  const fromInstance = normalizeObVersion(instanceOb);
  if (fromInstance) return fromInstance;
  const fromEnv = (typeof process !== "undefined" && process.env ? normalizeObVersion(process.env.FF_OB_VERSION) || normalizeObVersion(process.env.FFAPIS_OB_VERSION) || normalizeObVersion(process.env.FFAPIS_OB) : null) || null;
  if (fromEnv) return fromEnv;
  return DEFAULT_OB_VERSION;
}
function getCommonHeaders(obVersion, instanceOb) {
  return {
    ...HEADERS.COMMON,
    ReleaseVersion: resolveObVersion(obVersion, instanceOb)
  };
}
var import_fs2, import_js_yaml, settings, paths, AE, HEADERS, URLS, GARENA_CLIENT, DEFAULT_OB_VERSION;
var init_constants = __esm({
  "src/lib/constants.ts"() {
    "use strict";
    import_fs2 = __toESM(require("fs"));
    import_js_yaml = __toESM(require("js-yaml"));
    init_resolve_path();
    settings = loadSettings();
    paths = settings.URLS;
    AE = settings.AE;
    HEADERS = settings.HEADERS;
    URLS = {
      GARENA_TOKEN: paths.GARENA_TOKEN,
      GUEST_REGISTER: paths.GUEST_REGISTER,
      MAJOR_LOGIN: paths.MAJOR_LOGIN,
      MAJOR_REGISTER: paths.MAJOR_REGISTER,
      SEARCH: paths.SEARCH,
      PERSONAL_SHOW: paths.PERSONAL_SHOW,
      PLAYER_STATS: paths.PLAYER_STATS,
      PLAYER_CS_STATS: paths.PLAYER_CS_STATS
    };
    GARENA_CLIENT = settings.GARENA_CLIENT;
    DEFAULT_OB_VERSION = settings.HEADERS.COMMON["ReleaseVersion"];
  }
});

// src/lib/crypto.ts
var crypto_exports = {};
__export(crypto_exports, {
  encrypt: () => encrypt
});
function encrypt(buffer) {
  const cipher = import_crypto.default.createCipheriv("aes-128-cbc", AE.MAIN_KEY, AE.MAIN_IV);
  return Buffer.concat([cipher.update(buffer), cipher.final()]);
}
var import_crypto;
var init_crypto = __esm({
  "src/lib/crypto.ts"() {
    "use strict";
    import_crypto = __toESM(require("crypto"));
    init_constants();
  }
});

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CredentialManager: () => CredentialManager,
  DEFAULT_OB_VERSION: () => DEFAULT_OB_VERSION,
  FreeFireAIToolHandler: () => FreeFireAIToolHandler,
  FreeFireAPI: () => FreeFireAPI,
  LikeAPI: () => LikeAPI,
  encrypt: () => encrypt,
  freefireTools: () => freefireTools,
  getCommonHeaders: () => getCommonHeaders,
  getErrorMessage: () => getErrorMessage,
  getItemDetails: () => getItemDetails,
  getToolByName: () => getToolByName,
  getToolNames: () => getToolNames,
  loadItems: () => loadItems,
  normalizeObVersion: () => normalizeObVersion,
  processPlayerItems: () => processPlayerItems,
  protoHandler: () => protoHandler,
  resolveObVersion: () => resolveObVersion
});
module.exports = __toCommonJS(index_exports);

// src/lib/api.ts
var import_axios = __toESM(require("axios"));
var import_crypto3 = __toESM(require("crypto"));

// src/lib/protobuf.ts
var import_protobufjs = __toESM(require("protobufjs"));
var import_path2 = __toESM(require("path"));
init_crypto();
init_resolve_path();
var PROTO_DIR = resolveProjectDir("proto");
var ProtoHandler = class {
  constructor() {
    this.roots = {};
  }
  async load(filename) {
    if (!this.roots[filename]) {
      this.roots[filename] = await import_protobufjs.default.load(import_path2.default.join(PROTO_DIR, filename));
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
var import_fs3 = __toESM(require("fs"));

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
    const data = import_fs3.default.readFileSync(resolveProjectFile("data/items.json"), "utf8");
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
var import_fs4 = __toESM(require("fs"));
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
      const content = import_fs4.default.readFileSync(filePath, "utf8");
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
var import_fs5 = __toESM(require("fs"));
var import_path3 = __toESM(require("path"));
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
      const files = import_fs5.default.readdirSync(credentialsDir);
      for (const file of files) {
        if (file.endsWith(".yaml")) {
          const filePath = import_path3.default.join(credentialsDir, file);
          const content = import_fs5.default.readFileSync(filePath, "utf8");
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
      const response = await import_axios.default.post(URLS.GARENA_TOKEN, params, { headers: HEADERS.GARENA_AUTH, timeout: 3e4 });
      return response.data;
    } catch (error) {
      throw new Error(`Garena Auth Request Failed: ${getErrorMessage(error)}`);
    }
  }
  async _majorLogin(accessToken, openId, obVersion) {
    const payload = { openid: openId, logintoken: accessToken, platform: "4" };
    const encryptedBody = await protoHandler.encode("MajorLogin.proto", "request", payload, true);
    try {
      const response = await import_axios.default.post(URLS.MAJOR_LOGIN, encryptedBody, {
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
      const response = await import_axios.default.post(url, encryptedBody, {
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
      const response = await import_axios.default.post(url, encryptedBody, {
        headers: { ...this._headers(obVersion), Authorization: `Bearer ${this.session.token}` },
        responseType: "arraybuffer",
        timeout: 3e4
      });
      const decoded = await protoHandler.decode("PlayerPersonalShow.proto", "response", response.data);
      return decoded;
    } catch (error) {
      const status = import_axios.default.isAxiosError(error) ? error.response?.status : 0;
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
      const response = await import_axios.default.post(url, encryptedBody, {
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
    const passwordHash = import_crypto3.default.createHash("sha256").update(password).digest("hex").toUpperCase();
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
    const signature = import_crypto3.default.createHmac("sha256", GARENA_CLIENT.CLIENT_SECRET).update(params.toString()).digest("hex");
    try {
      const response = await import_axios.default.post(URLS.GUEST_REGISTER, params, {
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
      const response = await import_axios.default.post(URLS.GARENA_TOKEN, params, { headers: HEADERS.GARENA_AUTH, timeout: 3e4 });
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
    const { encrypt: encrypt2 } = await Promise.resolve().then(() => (init_crypto(), crypto_exports));
    const encryptedBody = encrypt2(protoBytes);
    const headers = this._headers(obVersion);
    try {
      const response = await import_axios.default.post(URLS.MAJOR_REGISTER, encryptedBody, {
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
var import_axios2 = __toESM(require("axios"));
init_constants();
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
      const tokenResponse = await import_axios2.default.post(URLS.GARENA_TOKEN, params, { headers: HEADERS.GARENA_AUTH, timeout: 3e4 });
      if (!tokenResponse.data?.access_token) return null;
      const accessToken = tokenResponse.data.access_token;
      const openId = tokenResponse.data.open_id;
      const loginPayload = { openid: openId, logintoken: accessToken, platform: "4" };
      const encryptedBody = await protoHandler.encode("MajorLogin.proto", "request", loginPayload, true);
      const headers = this._headers(obVersion);
      const loginResponse = await import_axios2.default.post(URLS.MAJOR_LOGIN, encryptedBody, {
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
      const response = await import_axios2.default.post(`${serverUrl}/LikeProfile`, payload, {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
