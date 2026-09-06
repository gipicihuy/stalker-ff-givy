"use strict";
/**
 * Minimal axios-like HTTP client built on the global `fetch`.
 *
 * axios defaults to its Node `http`/`https` adapter, which does not perform
 * real network I/O on Cloudflare Workers (workerd only supports outbound
 * requests via the global `fetch`). Detection logic in axios can also
 * mis-identify the Workers runtime as Node (because nodejs_compat exposes
 * `process`), so it doesn't fall back to a working adapter on its own.
 * This module replaces every axios call in the library with `fetch`, which
 * works identically on Node.js and on Cloudflare Workers / other edge
 * runtimes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
exports.httpPost = httpPost;
exports.isHttpError = isHttpError;
class HttpError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
        this.data = data;
    }
}
exports.HttpError = HttpError;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toBodyInit(body) {
    if (body instanceof URLSearchParams)
        return body;
    if (Buffer.isBuffer(body))
        return new Uint8Array(body);
    if (body instanceof Uint8Array)
        return body;
    if (typeof body === 'string')
        return body;
    return body;
}
async function httpPost(url, body, options = {}) {
    const controller = new AbortController();
    const timeoutId = options.timeout
        ? setTimeout(() => controller.abort(), options.timeout)
        : undefined;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: options.headers,
            body: toBodyInit(body),
            signal: controller.signal
        });
        const statusOk = options.validateStatus ? options.validateStatus(res.status) : res.ok;
        if (!statusOk) {
            let errData;
            try {
                errData = options.responseType === 'arraybuffer'
                    ? Buffer.from(await res.arrayBuffer())
                    : await res.text();
            }
            catch {
                errData = undefined;
            }
            throw new HttpError(`Request failed with status code ${res.status}`, res.status, errData);
        }
        if (options.responseType === 'arraybuffer') {
            const buf = await res.arrayBuffer();
            return { data: Buffer.from(buf), status: res.status };
        }
        const data = (await res.json());
        return { data, status: res.status };
    }
    catch (error) {
        if (error instanceof HttpError)
            throw error;
        if (error instanceof Error && error.name === 'AbortError') {
            throw new HttpError('Request timed out', 0);
        }
        throw new HttpError(error instanceof Error ? error.message : String(error), 0);
    }
    finally {
        if (timeoutId)
            clearTimeout(timeoutId);
    }
}
function isHttpError(error) {
    return error instanceof HttpError;
}
//# sourceMappingURL=http-client.js.map