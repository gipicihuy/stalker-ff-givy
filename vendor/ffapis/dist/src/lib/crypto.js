"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
const crypto_1 = __importDefault(require("crypto"));
const constants_1 = require("./constants");
function encrypt(buffer) {
    const cipher = crypto_1.default.createCipheriv('aes-128-cbc', constants_1.AE.MAIN_KEY, constants_1.AE.MAIN_IV);
    return Buffer.concat([cipher.update(buffer), cipher.final()]);
}
//# sourceMappingURL=crypto.js.map