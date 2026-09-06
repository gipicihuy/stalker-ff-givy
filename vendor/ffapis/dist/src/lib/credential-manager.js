"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialManager = void 0;
const fs_1 = __importDefault(require("fs"));
const types_1 = require("../types");
const resolve_path_1 = require("./resolve-path");
/**
 * Manages a pool of guest credentials for a specific Free Fire region.
 * Tracks usage to prevent reusing the same guest account on the same target.
 */
class CredentialManager {
    /**
     * @param region - Region code whose credential YAML file will be loaded.
     */
    constructor(region) {
        this.pool = [];
        this.currentIndex = 0;
        this.usageData = {};
        this.region = region;
        this._loadPool();
    }
    _loadPool() {
        const filePath = (0, resolve_path_1.resolveProjectFile)(`config/credentials/${this.region}.yaml`);
        try {
            const content = fs_1.default.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            let currentAccount = null;
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('- uid:')) {
                    if (currentAccount) {
                        this.pool.push(currentAccount);
                    }
                    const uidMatch = trimmed.match(/uid:\s*"([^"]+)"/);
                    currentAccount = { uid: uidMatch ? uidMatch[1] : '', password: '' };
                }
                else if (trimmed.startsWith('password:') && currentAccount) {
                    const pwdMatch = trimmed.match(/password:\s*"([^"]+)"/);
                    if (pwdMatch) {
                        currentAccount.password = pwdMatch[1];
                    }
                }
            }
            if (currentAccount && currentAccount.password) {
                this.pool.push(currentAccount);
            }
            console.log(`[CredentialManager] Loaded ${this.pool.length} accounts for ${this.region}`);
        }
        catch (error) {
            console.error(`[CredentialManager] Failed to load credentials for ${this.region}:`, (0, types_1.getErrorMessage)(error));
            this.pool = [];
        }
    }
    isUsedForTarget(targetUid, guestUid) {
        if (!this.usageData[targetUid])
            return false;
        return this.usageData[targetUid].used_guests[guestUid] !== undefined;
    }
    markUsed(targetUid, guestUid) {
        if (!this.usageData[targetUid]) {
            this.usageData[targetUid] = { used_guests: {}, total_likes: 0 };
        }
        this.usageData[targetUid].used_guests[guestUid] = new Date().toISOString();
        this.usageData[targetUid].total_likes = Object.keys(this.usageData[targetUid].used_guests).length;
    }
    getRandomCredential() {
        if (this.pool.length === 0)
            return null;
        const randomIndex = Math.floor(Math.random() * this.pool.length);
        return this.pool[randomIndex];
    }
    getNextCredential() {
        if (this.pool.length === 0)
            return null;
        const cred = this.pool[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.pool.length;
        return cred;
    }
    getNextForTarget(targetUid) {
        const available = this.pool.filter(acc => !this.isUsedForTarget(targetUid, acc.uid));
        if (available.length === 0)
            return null;
        return available[0];
    }
    getMultipleForTarget(targetUid, count) {
        const available = this.pool.filter(acc => !this.isUsedForTarget(targetUid, acc.uid));
        return available.slice(0, count);
    }
    getAvailableCount(targetUid) {
        return this.pool.filter(acc => !this.isUsedForTarget(targetUid, acc.uid)).length;
    }
    getPoolSize() {
        return this.pool.length;
    }
    clearUsage(targetUid) {
        if (targetUid) {
            delete this.usageData[targetUid];
        }
        else {
            this.usageData = {};
        }
    }
}
exports.CredentialManager = CredentialManager;
//# sourceMappingURL=credential-manager.js.map