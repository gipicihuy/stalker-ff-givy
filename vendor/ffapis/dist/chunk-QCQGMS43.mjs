var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lib/resolve-path.ts
import fs from "fs";
import path from "path";
function findPackageRoot() {
  let current = __dirname;
  for (let i = 0; i < 5; i++) {
    const pkgPath = path.join(current, "package.json");
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      if (pkg.name === "ffapis") return current;
    } catch {
    }
    current = path.dirname(current);
  }
  throw new Error("Could not find ffapis package root. Ensure package.json is present.");
}
function resolveProjectFile(relativePath) {
  const fullPath = path.join(PACKAGE_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Required file not found: ${fullPath} (resolved from package root: ${PACKAGE_ROOT})`);
  }
  return fullPath;
}
function resolveProjectDir(relativePath) {
  const fullPath = path.join(PACKAGE_ROOT, relativePath);
  try {
    if (fs.statSync(fullPath).isDirectory()) return fullPath;
  } catch {
  }
  throw new Error(`Required directory not found: ${fullPath} (resolved from package root: ${PACKAGE_ROOT})`);
}
var PACKAGE_ROOT;
var init_resolve_path = __esm({
  "src/lib/resolve-path.ts"() {
    "use strict";
    PACKAGE_ROOT = findPackageRoot();
  }
});

// src/lib/constants.ts
import fs2 from "fs";
import yaml from "js-yaml";
function loadYamlFile(filePath) {
  try {
    const yamlRaw = fs2.readFileSync(filePath, "utf8");
    return yaml.load(yamlRaw);
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
var settings, paths, AE, HEADERS, URLS, GARENA_CLIENT, DEFAULT_OB_VERSION;
var init_constants = __esm({
  "src/lib/constants.ts"() {
    "use strict";
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
import crypto from "crypto";
function encrypt(buffer) {
  const cipher = crypto.createCipheriv("aes-128-cbc", AE.MAIN_KEY, AE.MAIN_IV);
  return Buffer.concat([cipher.update(buffer), cipher.final()]);
}
var init_crypto = __esm({
  "src/lib/crypto.ts"() {
    init_constants();
  }
});

export {
  __toCommonJS,
  resolveProjectFile,
  resolveProjectDir,
  init_resolve_path,
  HEADERS,
  URLS,
  GARENA_CLIENT,
  DEFAULT_OB_VERSION,
  normalizeObVersion,
  resolveObVersion,
  getCommonHeaders,
  init_constants,
  encrypt,
  crypto_exports,
  init_crypto
};
