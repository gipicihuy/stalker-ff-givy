"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
const types_1 = require("../src/types");
let passed = 0;
let failed = 0;
function assert(name, cond, detail = '') {
    if (cond) {
        passed++;
        console.log(`[✓] ${name}`);
    }
    else {
        failed++;
        console.error(`[✗] ${name} ${detail}`);
    }
}
async function main() {
    console.log('='.repeat(60));
    console.log(' OB-VERSION OVERRIDE TEST (unit, no network)');
    console.log('='.repeat(60));
    console.log(`DEFAULT_OB_VERSION from settings.yaml: ${index_1.DEFAULT_OB_VERSION}`);
    // 1. normalize
    assert('normalize "OB55" -> OB55', (0, index_1.normalizeObVersion)('OB55') === 'OB55');
    assert('normalize "ob55" -> OB55', (0, index_1.normalizeObVersion)('ob55') === 'OB55');
    assert('normalize "55" -> OB55', (0, index_1.normalizeObVersion)('55') === 'OB55');
    assert('normalize 56 -> OB56', (0, index_1.normalizeObVersion)(56) === 'OB56');
    assert('normalize empty -> null', (0, index_1.normalizeObVersion)('') === null);
    assert('normalize invalid -> null', (0, index_1.normalizeObVersion)('XYZ') === null);
    assert('normalize null -> null', (0, index_1.normalizeObVersion)(null) === null);
    // 2. resolve priority: request > instance > env > default
    assert('resolve request wins', (0, index_1.resolveObVersion)('OB99', 'OB55') === 'OB99');
    assert('resolve instance fallback', (0, index_1.resolveObVersion)(null, 'OB55') === 'OB55');
    assert('resolve default fallback', (0, index_1.resolveObVersion)(null, null) === index_1.DEFAULT_OB_VERSION);
    // env override
    const prevEnv = process.env.FF_OB_VERSION;
    process.env.FF_OB_VERSION = 'OB77';
    assert('resolve env fallback', (0, index_1.resolveObVersion)(null, null) === 'OB77');
    assert('resolve instance beats env', (0, index_1.resolveObVersion)(null, 'OB55') === 'OB55');
    assert('resolve request beats env', (0, index_1.resolveObVersion)('OB99', 'OB55') === 'OB99');
    if (prevEnv === undefined)
        delete process.env.FF_OB_VERSION;
    else
        process.env.FF_OB_VERSION = prevEnv;
    // 3. headers do not mutate global
    const h1 = (0, index_1.getCommonHeaders)('OB55', null);
    const h2 = (0, index_1.getCommonHeaders)(null, null);
    assert('headers override OB55', h1['ReleaseVersion'] === 'OB55');
    assert('headers default = DEFAULT', h2['ReleaseVersion'] === index_1.DEFAULT_OB_VERSION);
    // 4. FreeFireAPI instance handling
    const apiDefault = new index_1.FreeFireAPI();
    assert('FreeFireAPI default getObVersion = DEFAULT', apiDefault.getObVersion() === index_1.DEFAULT_OB_VERSION);
    const apiInst = new index_1.FreeFireAPI(null, { obVersion: 'OB55' });
    assert('FreeFireAPI ctor options OB55', apiInst.getObVersion() === 'OB55');
    const apiStr = new index_1.FreeFireAPI('IND', '56');
    assert('FreeFireAPI ctor string "56" -> OB56', apiStr.getObVersion() === 'OB56');
    apiDefault.setObVersion('OB58');
    assert('FreeFireAPI setObVersion OB58', apiDefault.getObVersion() === 'OB58');
    apiDefault.setObVersion(null);
    assert('FreeFireAPI clear obVersion -> DEFAULT', apiDefault.getObVersion() === index_1.DEFAULT_OB_VERSION);
    // 5. LikeAPI instance handling
    const likeDefault = new index_1.LikeAPI();
    assert('LikeAPI default getObVersion = DEFAULT', likeDefault.getObVersion() === index_1.DEFAULT_OB_VERSION);
    const likeInst = new index_1.LikeAPI({ obVersion: 'OB55' });
    assert('LikeAPI ctor options OB55', likeInst.getObVersion() === 'OB55');
    likeInst.setObVersion('OB60');
    assert('LikeAPI setObVersion OB60', likeInst.getObVersion() === 'OB60');
    // 6. AI tools schema includes obVersion
    const toolNames = ['search_player', 'get_player_profile', 'get_player_items', 'get_player_stats', 'send_likes', 'register_account'];
    for (const n of toolNames) {
        const t = (0, index_1.getToolByName)(n);
        const has = !!t?.function.parameters.properties['obVersion'];
        assert(`AI tool ${n} has obVersion param`, has);
    }
    // 7. AI handler accepts default obVersion without throwing
    const handler = new index_1.FreeFireAIToolHandler({ obVersion: 'OB55' });
    assert('AI handler constructed with obVersion', !!handler);
    const unknown = await handler.execute({ id: '1', type: 'function', function: { name: 'nope', arguments: '{}' } });
    assert('AI handler unknown tool error', unknown.content.includes('Unknown tool'));
    // 8. Signature check: per-request param exists (call with dry-run invalid keyword to prove param is accepted, not ignored)
    // searchAccount('ab') should throw length error BEFORE network, even with obVersion — proves param plumbing doesn't break validation.
    try {
        await apiInst.searchAccount('ab', 'OB55');
        assert('search validation with obVersion', false, 'should have thrown');
    }
    catch (e) {
        assert('search validation with obVersion', (0, types_1.getErrorMessage)(e).includes('at least 3 characters'));
    }
    console.log('='.repeat(60));
    console.log(`Passed: ${passed}, Failed: ${failed}`);
    console.log('='.repeat(60));
    // Optional live test: node dist/test/ob-version.js --live
    if (process.argv.includes('--live')) {
        console.log('\n[LIVE] testing search with explicit OB override...');
        const liveApi = new index_1.FreeFireAPI(null, { obVersion: index_1.DEFAULT_OB_VERSION });
        try {
            const res = await liveApi.searchAccount('folaa', index_1.DEFAULT_OB_VERSION);
            console.log(`[LIVE] search with OB ${index_1.DEFAULT_OB_VERSION}: found ${res.length} players`);
            console.log(`[LIVE] top: ${res[0]?.nickname} (${res[0]?.accountid})`);
        }
        catch (e) {
            console.error('[LIVE] failed:', (0, types_1.getErrorMessage)(e));
            process.exit(1);
        }
    }
    if (failed > 0)
        process.exit(1);
    console.log('\n[✓] ALL OB-VERSION TESTS PASSED');
}
main();
//# sourceMappingURL=ob-version.js.map