"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
const types_1 = require("../src/types");
async function testLogin() {
    console.log('Starting Login Test...');
    const api = new index_1.FreeFireAPI();
    try {
        const session = await api.loginWithRandomCredentialFromAll();
        console.log('Login success!');
        console.log(`Token: ${session.token.substring(0, 20)}...`);
        console.log(`OpenID: ${session.openId}`);
    }
    catch (e) {
        console.error('Login failed:', (0, types_1.getErrorMessage)(e));
    }
}
testLogin();
//# sourceMappingURL=login.js.map