"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveProjectFile = resolveProjectFile;
exports.resolveProjectDir = resolveProjectDir;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function findPackageRoot() {
    let current = __dirname;
    for (let i = 0; i < 5; i++) {
        const pkgPath = path_1.default.join(current, 'package.json');
        try {
            const pkg = JSON.parse(fs_1.default.readFileSync(pkgPath, 'utf8'));
            if (pkg.name === 'ffapis')
                return current;
        }
        catch {
            // continue
        }
        current = path_1.default.dirname(current);
    }
    throw new Error('Could not find ffapis package root. Ensure package.json is present.');
}
const PACKAGE_ROOT = findPackageRoot();
function resolveProjectFile(relativePath) {
    const fullPath = path_1.default.join(PACKAGE_ROOT, relativePath);
    if (!fs_1.default.existsSync(fullPath)) {
        throw new Error(`Required file not found: ${fullPath} (resolved from package root: ${PACKAGE_ROOT})`);
    }
    return fullPath;
}
function resolveProjectDir(relativePath) {
    const fullPath = path_1.default.join(PACKAGE_ROOT, relativePath);
    try {
        if (fs_1.default.statSync(fullPath).isDirectory())
            return fullPath;
    }
    catch {
        // fall through
    }
    throw new Error(`Required directory not found: ${fullPath} (resolved from package root: ${PACKAGE_ROOT})`);
}
//# sourceMappingURL=resolve-path.js.map