import type { AEConfig, HeadersConfig, URLSConfig, GarenaClientConfig } from '../types';
export declare const AE: AEConfig;
export declare const HEADERS: HeadersConfig;
export declare const URLS: URLSConfig;
export declare const GARENA_CLIENT: GarenaClientConfig;
/**
 * Default OB version from `config/settings.yaml` (`HEADERS_COMMON_RELEASE_VERSION`).
 * Example: "OB54"
 */
export declare const DEFAULT_OB_VERSION: string;
/**
 * Normalize user-supplied OB version.
 * Accepts "OB54", "ob54", "54" -> returns "OB54".
 * Returns null for empty/invalid input (caller falls back to default).
 */
export declare function normalizeObVersion(input?: string | number | null): string | null;
/**
 * Resolve effective OB version with priority:
 * request override > instance override > env (FF_OB_VERSION / FFAPIS_OB_VERSION / FFAPIS_OB) > settings.yaml default.
 */
export declare function resolveObVersion(requestOb?: string | number | null, instanceOb?: string | number | null): string;
/**
 * Build COMMON headers with a specific OB version.
 * Does not mutate global HEADERS — safe for per-request override.
 */
export declare function getCommonHeaders(obVersion?: string | number | null, instanceOb?: string | number | null): Record<string, string>;
//# sourceMappingURL=constants.d.ts.map