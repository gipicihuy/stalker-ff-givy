"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
const types_1 = require("../src/types");
async function testSearch() {
    const searchName = process.argv[2] || 'folaa';
    console.log(`Starting Search Test for '${searchName}'...`);
    const api = new index_1.FreeFireAPI();
    try {
        const searchResults = await api.searchAccount(searchName);
        if (searchResults && searchResults.length > 0) {
            console.log(`Found ${searchResults.length} players.`);
            console.log(`Top Result: ${searchResults[0].nickname} (UID: ${searchResults[0].accountid})`);
            searchResults.forEach((res, index) => {
                console.log(`[${index + 1}] ${res.nickname} - UID: ${res.accountid} - LVL: ${res.level}`);
            });
        }
        else {
            console.log('No players found.');
        }
    }
    catch (e) {
        console.error('Search failed:', (0, types_1.getErrorMessage)(e));
    }
}
testSearch();
//# sourceMappingURL=search.js.map