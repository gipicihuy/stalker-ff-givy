"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protoHandler = void 0;
const protobufjs_1 = __importDefault(require("protobufjs"));
const crypto_1 = require("./crypto");
const embedded_data_1 = require("../embedded-data");
class ProtoHandler {
    constructor() {
        this.roots = {};
    }
    async load(filename) {
        if (!this.roots[filename]) {
            const descriptor = embedded_data_1.protoDescriptors[filename];
            if (!descriptor) {
                throw new Error(`No embedded proto descriptor found for ${filename}`);
            }
            this.roots[filename] = protobufjs_1.default.Root.fromJSON(descriptor);
        }
        return this.roots[filename];
    }
    async encode(filename, messageName, payload, shouldEncrypt = true) {
        const root = await this.load(filename);
        const Type = root.lookupType(messageName);
        const errMsg = Type.verify(payload);
        if (errMsg)
            throw new Error(errMsg);
        const message = Type.create(payload);
        const buffer = Type.encode(message).finish();
        if (shouldEncrypt) {
            return (0, crypto_1.encrypt)(Buffer.from(buffer));
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
}
exports.protoHandler = new ProtoHandler();
//# sourceMappingURL=protobuf.js.map