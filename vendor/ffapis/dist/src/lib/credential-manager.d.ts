import type { Credential } from '../types';
/**
 * Manages a pool of guest credentials for a specific Free Fire region.
 * Tracks usage to prevent reusing the same guest account on the same target.
 */
export declare class CredentialManager {
    region: string;
    private pool;
    private currentIndex;
    private usageData;
    /**
     * @param region - Region code whose embedded credential pool will be loaded.
     */
    constructor(region: string);
    private _loadPool;
    isUsedForTarget(targetUid: string, guestUid: string): boolean;
    markUsed(targetUid: string, guestUid: string): void;
    getRandomCredential(): Credential | null;
    getNextCredential(): Credential | null;
    getNextForTarget(targetUid: string): Credential | null;
    getMultipleForTarget(targetUid: string, count: number): Credential[];
    getAvailableCount(targetUid: string): number;
    getPoolSize(): number;
    clearUsage(targetUid?: string): void;
}
//# sourceMappingURL=credential-manager.d.ts.map