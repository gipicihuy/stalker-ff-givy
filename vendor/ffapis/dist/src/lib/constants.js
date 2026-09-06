"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_OB_VERSION = exports.GARENA_CLIENT = exports.URLS = exports.HEADERS = exports.AE = void 0;
exports.normalizeObVersion = normalizeObVersion;
exports.resolveObVersion = resolveObVersion;
exports.getCommonHeaders = getCommonHeaders;
const embedded_data_1 = require("../embedded-data");
function readConfigValue(config, key, fallback) {
    const value = config[key];
    if (value === undefined || value === null || value === '') {
        if (fallback !== undefined)
            return fallback;
        throw new Error(`Missing required setting in config/settings.yaml: ${key}`);
    }
    return String(value);
}
function requireConfigValue(config, key) {
    return readConfigValue(config, key);
}
function loadSettings() {
    const parsed = embedded_data_1.embeddedSettings;
    return {
        AE: {
            MAIN_KEY: Buffer.from(requireConfigValue(parsed, 'AE_MAIN_KEY'), 'binary'),
            MAIN_IV: Buffer.from(requireConfigValue(parsed, 'AE_MAIN_IV'), 'binary')
        },
        HEADERS: {
            COMMON: {
                'User-Agent': requireConfigValue(parsed, 'HEADERS_COMMON_USER_AGENT'),
                'Connection': requireConfigValue(parsed, 'HEADERS_COMMON_CONNECTION'),
                'Accept-Encoding': requireConfigValue(parsed, 'HEADERS_COMMON_ACCEPT_ENCODING'),
                'Expect': requireConfigValue(parsed, 'HEADERS_COMMON_EXPECT'),
                'X-Unity-Version': requireConfigValue(parsed, 'HEADERS_COMMON_X_UNITY_VERSION'),
                'X-GA': requireConfigValue(parsed, 'HEADERS_COMMON_X_GA'),
                'ReleaseVersion': requireConfigValue(parsed, 'HEADERS_COMMON_RELEASE_VERSION'),
                'Content-Type': requireConfigValue(parsed, 'HEADERS_COMMON_CONTENT_TYPE')
            },
            GARENA_AUTH: {
                'User-Agent': requireConfigValue(parsed, 'HEADERS_GARENA_AUTH_USER_AGENT'),
                'Connection': requireConfigValue(parsed, 'HEADERS_GARENA_AUTH_CONNECTION'),
                'Accept-Encoding': requireConfigValue(parsed, 'HEADERS_GARENA_AUTH_ACCEPT_ENCODING')
            }
        },
        URLS: {
            GARENA_TOKEN: requireConfigValue(parsed, 'URL_GARENA_TOKEN'),
            GUEST_REGISTER: requireConfigValue(parsed, 'URL_GUEST_REGISTER'),
            MAJOR_LOGIN: requireConfigValue(parsed, 'URL_MAJOR_LOGIN'),
            MAJOR_REGISTER: requireConfigValue(parsed, 'URL_MAJOR_REGISTER'),
            SEARCH: (serverUrl) => `${serverUrl}${requireConfigValue(parsed, 'URL_PATH_SEARCH')}`,
            PERSONAL_SHOW: (serverUrl) => `${serverUrl}${requireConfigValue(parsed, 'URL_PATH_PERSONAL_SHOW')}`,
            PLAYER_STATS: (serverUrl) => `${serverUrl}${requireConfigValue(parsed, 'URL_PATH_PLAYER_STATS')}`,
            PLAYER_CS_STATS: (serverUrl) => `${serverUrl}${requireConfigValue(parsed, 'URL_PATH_PLAYER_CS_STATS')}`
        },
        GARENA_CLIENT: {
            CLIENT_ID: requireConfigValue(parsed, 'GARENA_CLIENT_ID'),
            CLIENT_SECRET: requireConfigValue(parsed, 'GARENA_CLIENT_SECRET')
        }
    };
}
const settings = loadSettings();
const paths = settings.URLS;
exports.AE = settings.AE;
exports.HEADERS = settings.HEADERS;
exports.URLS = {
    GARENA_TOKEN: paths.GARENA_TOKEN,
    GUEST_REGISTER: paths.GUEST_REGISTER,
    MAJOR_LOGIN: paths.MAJOR_LOGIN,
    MAJOR_REGISTER: paths.MAJOR_REGISTER,
    SEARCH: paths.SEARCH,
    PERSONAL_SHOW: paths.PERSONAL_SHOW,
    PLAYER_STATS: paths.PLAYER_STATS,
    PLAYER_CS_STATS: paths.PLAYER_CS_STATS
};
exports.GARENA_CLIENT = settings.GARENA_CLIENT;
/**
 * Default OB version from `config/settings.yaml` (`HEADERS_COMMON_RELEASE_VERSION`).
 * Example: "OB54"
 */
exports.DEFAULT_OB_VERSION = settings.HEADERS.COMMON['ReleaseVersion'];
/**
 * Normalize user-supplied OB version.
 * Accepts "OB54", "ob54", "54" -> returns "OB54".
 * Returns null for empty/invalid input (caller falls back to default).
 */
function normalizeObVersion(input) {
    if (input === undefined || input === null)
        return null;
    const raw = String(input).trim();
    if (!raw)
        return null;
    const upper = raw.toUpperCase();
    const digits = upper.startsWith('OB') ? upper.slice(2) : upper;
    if (!/^\d+$/.test(digits))
        return null;
    return `OB${digits}`;
}
/**
 * Resolve effective OB version with priority:
 * request override > instance override > env (FF_OB_VERSION / FFAPIS_OB_VERSION / FFAPIS_OB) > settings.yaml default.
 */
function resolveObVersion(requestOb, instanceOb) {
    const fromRequest = normalizeObVersion(requestOb);
    if (fromRequest)
        return fromRequest;
    const fromInstance = normalizeObVersion(instanceOb);
    if (fromInstance)
        return fromInstance;
    const fromEnv = (typeof process !== 'undefined' && process.env
        ? normalizeObVersion(process.env.FF_OB_VERSION) ||
            normalizeObVersion(process.env.FFAPIS_OB_VERSION) ||
            normalizeObVersion(process.env.FFAPIS_OB)
        : null) || null;
    if (fromEnv)
        return fromEnv;
    return exports.DEFAULT_OB_VERSION;
}
/**
 * Build COMMON headers with a specific OB version.
 * Does not mutate global HEADERS — safe for per-request override.
 */
function getCommonHeaders(obVersion, instanceOb) {
    return {
        ...exports.HEADERS.COMMON,
        ReleaseVersion: resolveObVersion(obVersion, instanceOb),
    };
}
//# sourceMappingURL=constants.js.map