"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadItems = loadItems;
exports.getItemDetails = getItemDetails;
exports.processPlayerItems = processPlayerItems;
const types_1 = require("../types");
const items_json_1 = __importDefault(require("../embedded-data/items.json"));
function coerceString(value, fallback = '') {
    if (typeof value === 'string')
        return value;
    if (value === null || value === undefined)
        return fallback;
    return String(value);
}
function coerceBoolean(value, fallback = false) {
    if (typeof value === 'boolean')
        return value;
    return fallback;
}
let itemsDb = null;
function loadItems() {
    if (itemsDb)
        return itemsDb;
    try {
        itemsDb = {};
        for (const item of items_json_1.default) {
            const rawId = item.id ?? item.itemID;
            const id = typeof rawId === 'string' || typeof rawId === 'number' ? rawId : undefined;
            if (id !== undefined)
                itemsDb[String(id)] = item;
        }
        console.log(`Loaded ${Object.keys(itemsDb).length} items into database.`);
    }
    catch (e) {
        console.error('Failed to load items database:', (0, types_1.getErrorMessage)(e));
        itemsDb = {};
    }
    return itemsDb;
}
function getItemDetails(itemId) {
    const db = loadItems();
    const itemStrId = String(itemId);
    const currentItem = {
        id: itemId,
        name: 'Unknown Item',
        type: 'UNKNOWN',
        rarity: 'NONE',
        description: '',
        is_unique: false,
        image: `https://raw.githubusercontent.com/ashqking/FF-Items/main/ICONS/${itemId}.png`,
        image_fallback: `https://raw.githubusercontent.com/I-SHOW-AKIRU200/AKIRU-ICONS/main/ICONS/${itemId}.png`
    };
    if (db[itemStrId]) {
        const itemData = db[itemStrId];
        currentItem.name = coerceString(itemData.name ?? itemData.description ?? 'Unknown Name');
        currentItem.type = coerceString(itemData.type ?? 'UNKNOWN');
        currentItem.collection_type = coerceString(itemData.collection_type ?? 'NONE');
        currentItem.rarity = coerceString(itemData.rare ?? 'NONE');
        currentItem.description = coerceString(itemData.description ?? '');
        currentItem.is_unique = coerceBoolean(itemData.is_unique ?? false);
        currentItem.icon_code = coerceString(itemData.icon ?? '');
    }
    return currentItem;
}
function processPlayerItems(playerData) {
    const profileInfo = playerData.profileinfo;
    const basicInfo = playerData.basicinfo;
    const petInfo = playerData.petinfo;
    const outfitIds = profileInfo.clothes ?? [];
    const outfitDetails = outfitIds.map(getItemDetails);
    const weaponIds = basicInfo.weaponskinshows ?? [];
    const weaponDetails = weaponIds.map(getItemDetails);
    const skillIds = profileInfo.equipedskills ?? [];
    const skillDetails = skillIds.map(getItemDetails);
    let petDetails = null;
    if (petInfo && (petInfo.id || petInfo.skinid)) {
        petDetails = {
            id: getItemDetails(petInfo.id),
            name: petInfo.name || '',
            level: petInfo.level || 0,
            skin: getItemDetails(petInfo.skinid),
            selected_skill: getItemDetails(petInfo.selectedskillid)
        };
    }
    const normalizedBasicInfo = {
        accountid: basicInfo.accountid || '',
        nickname: basicInfo.nickname || '',
        level: basicInfo.level || 0,
        region: basicInfo.region || '',
        liked: basicInfo.liked || '',
        signature: basicInfo.signature || ''
    };
    return {
        basic_info: normalizedBasicInfo,
        items: {
            outfit: outfitDetails,
            skills: { equipped: skillDetails },
            weapons: { shown_skins: weaponDetails },
            pet: petDetails
        }
    };
}
//# sourceMappingURL=utils.js.map