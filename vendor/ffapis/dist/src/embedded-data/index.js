"use strict";
// Build-time embedded data. These files were originally loaded at runtime via
// fs.readFileSync() from proto/, config/settings.yaml and config/credentials/*.yaml.
// That approach doesn't work on serverless/edge runtimes without a real filesystem
// (e.g. Cloudflare Workers), so we embed everything as static JS imports instead.
// Regenerate by re-running the conversion script if proto/config files change.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddedCredentials = exports.embeddedSettings = exports.protoDescriptors = void 0;
const MajorLogin_json_1 = __importDefault(require("./MajorLogin.json"));
const MajorRegister_json_1 = __importDefault(require("./MajorRegister.json"));
const PlayerCSStats_json_1 = __importDefault(require("./PlayerCSStats.json"));
const PlayerPersonalShow_json_1 = __importDefault(require("./PlayerPersonalShow.json"));
const PlayerStats_json_1 = __importDefault(require("./PlayerStats.json"));
const SearchAccountByName_json_1 = __importDefault(require("./SearchAccountByName.json"));
const SetPlayerGalleryShowInfo_json_1 = __importDefault(require("./SetPlayerGalleryShowInfo.json"));
const settings_json_1 = __importDefault(require("./settings.json"));
const credentials_json_1 = __importDefault(require("./credentials.json"));
exports.protoDescriptors = {
    'MajorLogin.proto': MajorLogin_json_1.default,
    'MajorRegister.proto': MajorRegister_json_1.default,
    'PlayerCSStats.proto': PlayerCSStats_json_1.default,
    'PlayerPersonalShow.proto': PlayerPersonalShow_json_1.default,
    'PlayerStats.proto': PlayerStats_json_1.default,
    'SearchAccountByName.proto': SearchAccountByName_json_1.default,
    'SetPlayerGalleryShowInfo.proto': SetPlayerGalleryShowInfo_json_1.default,
};
exports.embeddedSettings = settings_json_1.default;
exports.embeddedCredentials = credentials_json_1.default;
//# sourceMappingURL=index.js.map