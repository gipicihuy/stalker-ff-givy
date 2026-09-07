import protobuf from 'protobufjs';
declare class ProtoHandler {
    private roots;
    load(filename: string): Promise<protobuf.Root>;
    encode(filename: string, messageName: string, payload: Record<string, unknown>, shouldEncrypt?: boolean): Promise<Buffer>;
    decode(filename: string, messageName: string, buffer: Buffer | ArrayBuffer): Promise<unknown>;
    decodeWithFallback(primaryFilename: string, fallbackFilename: string, messageName: string, buffer: Buffer | ArrayBuffer): Promise<unknown>;
}
export declare const protoHandler: ProtoHandler;
export {};
//# sourceMappingURL=protobuf.d.ts.map