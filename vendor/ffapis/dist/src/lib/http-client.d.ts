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
export declare class HttpError extends Error {
    status: number;
    data?: unknown;
    constructor(message: string, status: number, data?: unknown);
}
export interface HttpRequestOptions {
    headers?: Record<string, string>;
    responseType?: 'json' | 'arraybuffer';
    timeout?: number;
    /** When provided, a non-2xx status is accepted instead of throwing if this returns true. */
    validateStatus?: (status: number) => boolean;
}
export interface HttpResponse<T> {
    data: T;
    status: number;
}
export declare function httpPost<T = Buffer>(url: string, body: unknown, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
export declare function isHttpError(error: unknown): error is HttpError;
//# sourceMappingURL=http-client.d.ts.map