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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommonHeaders = exports.resolveObVersion = exports.normalizeObVersion = exports.DEFAULT_OB_VERSION = exports.FreeFireAIToolHandler = exports.getToolNames = exports.getToolByName = exports.freefireTools = exports.loadItems = exports.processPlayerItems = exports.getItemDetails = exports.encrypt = exports.protoHandler = exports.CredentialManager = exports.LikeAPI = exports.FreeFireAPI = void 0;
var api_1 = require("./lib/api");
Object.defineProperty(exports, "FreeFireAPI", { enumerable: true, get: function () { return api_1.FreeFireAPI; } });
var like_1 = require("./lib/like");
Object.defineProperty(exports, "LikeAPI", { enumerable: true, get: function () { return like_1.LikeAPI; } });
var credential_manager_1 = require("./lib/credential-manager");
Object.defineProperty(exports, "CredentialManager", { enumerable: true, get: function () { return credential_manager_1.CredentialManager; } });
var protobuf_1 = require("./lib/protobuf");
Object.defineProperty(exports, "protoHandler", { enumerable: true, get: function () { return protobuf_1.protoHandler; } });
var crypto_1 = require("./lib/crypto");
Object.defineProperty(exports, "encrypt", { enumerable: true, get: function () { return crypto_1.encrypt; } });
var utils_1 = require("./lib/utils");
Object.defineProperty(exports, "getItemDetails", { enumerable: true, get: function () { return utils_1.getItemDetails; } });
Object.defineProperty(exports, "processPlayerItems", { enumerable: true, get: function () { return utils_1.processPlayerItems; } });
Object.defineProperty(exports, "loadItems", { enumerable: true, get: function () { return utils_1.loadItems; } });
var ai_tools_1 = require("./lib/ai-tools");
Object.defineProperty(exports, "freefireTools", { enumerable: true, get: function () { return ai_tools_1.freefireTools; } });
Object.defineProperty(exports, "getToolByName", { enumerable: true, get: function () { return ai_tools_1.getToolByName; } });
Object.defineProperty(exports, "getToolNames", { enumerable: true, get: function () { return ai_tools_1.getToolNames; } });
var ai_handler_1 = require("./lib/ai-handler");
Object.defineProperty(exports, "FreeFireAIToolHandler", { enumerable: true, get: function () { return ai_handler_1.FreeFireAIToolHandler; } });
var constants_1 = require("./lib/constants");
Object.defineProperty(exports, "DEFAULT_OB_VERSION", { enumerable: true, get: function () { return constants_1.DEFAULT_OB_VERSION; } });
Object.defineProperty(exports, "normalizeObVersion", { enumerable: true, get: function () { return constants_1.normalizeObVersion; } });
Object.defineProperty(exports, "resolveObVersion", { enumerable: true, get: function () { return constants_1.resolveObVersion; } });
Object.defineProperty(exports, "getCommonHeaders", { enumerable: true, get: function () { return constants_1.getCommonHeaders; } });
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map