var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/embedded-data/MajorLogin.json
var MajorLogin_default;
var init_MajorLogin = __esm({
  "src/embedded-data/MajorLogin.json"() {
    MajorLogin_default = { nested: { MajorLogin: { nested: { request: { fields: { accountid: { type: "uint64", id: 1 }, gameserverid: { type: "string", id: 2 }, eventtime: { type: "string", id: 3 }, gameid: { type: "string", id: 4 }, platid: { type: "uint32", id: 5 }, zoneareaid: { type: "uint32", id: 6 }, clientversion: { type: "string", id: 7 }, systemsoftware: { type: "string", id: 8 }, systemhardware: { type: "string", id: 9 }, telecomoper: { type: "string", id: 10 }, network: { type: "string", id: 11 }, screenwidth: { type: "uint32", id: 12 }, screenhight: { type: "uint32", id: 13 }, dpi: { type: "string", id: 14 }, cpuhardware: { type: "string", id: 15 }, memory: { type: "uint32", id: 16 }, glrender: { type: "string", id: 17 }, glversion: { type: "string", id: 18 }, deviceid: { type: "string", id: 19 }, clientip: { type: "string", id: 20 }, language: { type: "string", id: 21 }, openid: { type: "string", id: 22 }, openidtype: { type: "string", id: 23 }, devicetype: { type: "string", id: 24 }, devicemodel: { type: "string", id: 25 }, region: { type: "string", id: 26 }, ipregion: { type: "string", id: 27 }, others: { type: "string", id: 28 }, logintoken: { type: "string", id: 29 }, platformsdkid: { type: "uint32", id: 30 }, level: { type: "uint32", id: 31 }, clanid: { type: "uint64", id: 32 }, platformuid: { type: "uint64", id: 33 }, nickname: { type: "string", id: 34 }, networkoperatora: { type: "string", id: 35 }, networktypea: { type: "string", id: 36 }, line1numa: { type: "string", id: 37 }, isemulator: { type: "bool", id: 38 }, ipaddress: { type: "string", id: 39 }, signaturemd5: { type: "string", id: 40 }, emulatorscore: { type: "uint32", id: 41 }, sdcardtotalstorage: { type: "int32", id: 42 }, sdcardavailstorage: { type: "int32", id: 43 }, innertotalstorage: { type: "int32", id: 44 }, inneravailstorage: { type: "int32", id: 45 }, gameinstalleddiskavailstorage: { type: "int32", id: 46 }, gameinstalleddisktotalstorage: { type: "int32", id: 47 }, externalsdcardavailstorage: { type: "int32", id: 48 }, externalsdcardtotalstorage: { type: "int32", id: 49 }, loginby: { type: "uint32", id: 50 }, notiregion: { type: "string", id: 51 }, source: { type: "AccountDownloadType", id: 52 }, regavatar: { type: "uint32", id: 53 }, lockregiontime: { type: "uint32", id: 54 }, quality: { type: "uint32", id: 55 }, libpath: { type: "string", id: 56 }, usingversion: { type: "AuthClientUsingVersion", id: 57 }, libtoken: { type: "string", id: 58 }, channeltype: { type: "uint32", id: 59 }, cputype: { type: "uint32", id: 60 }, cpuarchitecture: { type: "string", id: 61 }, clientversioncode: { type: "string", id: 62 }, tokenexpiresat: { type: "int64", id: 63 }, newbiechoice: { type: "AccountNewbieChoice", id: 64 }, systemgraphicsapi: { type: "string", id: 65 }, supportedastcbitset: { type: "uint32", id: 66 }, loginopenidtype: { type: "uint32", id: 67 }, ipcity: { type: "string", id: 68 }, ipsubdivision: { type: "string", id: 69 }, loadingtime: { type: "uint32", id: 70 }, releasechannel: { type: "string", id: 71 }, gindetail: { type: "bytes", id: 72 }, androidengineinitflag: { type: "uint32", id: 73 }, extrainfo: { type: "string", id: 74 }, ifpush: { type: "bool", id: 75 }, isvpn: { type: "bool", id: 76 }, orignplatformtype: { type: "string", id: 77 }, primaryplatformtype: { type: "string", id: 78 }, clientreportip: { type: "string", id: 79 }, ffantidetail: { type: "bytes", id: 80 }, armtype: { type: "string", id: 81 }, buildNumber: { type: "uint64", id: 83 }, graphicsApi: { type: "string", id: 86 }, graphicsFlags: { type: "uint32", id: 87 }, graphicsLevel: { type: "uint32", id: 88 }, performanceScore: { type: "uint32", id: 92 }, profileName: { type: "string", id: 93 }, secureToken: { type: "string", id: 94 }, sessionId: { type: "uint32", id: 95 }, refreshRates: { type: "string", id: 96 }, featureFlag: { type: "uint32", id: 98 }, platform: { type: "string", id: 99 }, mainactiveplatform: { type: "string", id: 100 } } }, response: { fields: { accountId: { type: "uint64", id: 1 }, lockRegion: { type: "string", id: 2 }, notiRegion: { type: "string", id: 3 }, ipRegion: { type: "string", id: 4 }, agoraEnvironment: { type: "string", id: 5 }, newActiveRegion: { type: "string", id: 6 }, recommendRegions: { rule: "repeated", type: "string", id: 7 }, token: { type: "string", id: 8 }, ttl: { type: "uint32", id: 9 }, serverUrl: { type: "string", id: 10 }, emulatorScore: { type: "uint32", id: 11 }, appServerId: { type: "uint32", id: 12 }, tpUrl: { type: "string", id: 13 }, blacklist: { type: "BlacklistInfoRes", id: 15 }, ipCity: { type: "string", id: 16 }, ipSubdivision: { type: "string", id: 17 }, kts: { type: "uint32", id: 18 }, ipCityDetail: { type: "string", id: 19 }, ipSubdivisionDetail: { type: "string", id: 20 }, ktsDetail: { type: "uint32", id: 21 }, ak: { type: "bytes", id: 22 }, aiv: { type: "bytes", id: 23 }, ffantiUrl: { type: "string", id: 24 }, ffantiDetail: { type: "bytes", id: 25 } } }, AccountDownloadType: { values: { AccountDownloadTypeNONE: 0, INSTANTGAME: 1, IOS: 2, HUAWEI: 3, XIAOMI: 4, SAMSUNG: 5 } }, AuthClientUsingVersion: { values: { AuthClientUsingVersionNONE: 0, NORMAL: 1, MAX: 2, FFI: 3, MAXHPE: 4 } }, AccountNewbieChoice: { values: { AccountNewbieChoiceNONE: 0, NEWPLAYER: 1, FPSPLAYER: 2, VETERAN: 3, NEEDMOREINFO: 99 } }, LoginQueueInfo: { fields: { allow: { type: "bool", id: 1 }, queuePosition: { type: "uint32", id: 2 }, needWaitSecs: { type: "uint32", id: 3 }, queueIsFull: { type: "bool", id: 4 } } }, BlacklistInfoRes: { fields: { banReason: { type: "AccountBanReason", id: 1 }, expireDuration: { type: "uint32", id: 2 }, banTime: { type: "uint32", id: 3 } } }, AccountBanReason: { values: { Unknown: 0, InGameAuto: 1, Refund: 2, Others: 3, Skinmod: 4, InGameAutoNew: 1014 } } } } } };
  }
});

// src/embedded-data/MajorRegister.json
var MajorRegister_default;
var init_MajorRegister = __esm({
  "src/embedded-data/MajorRegister.json"() {
    MajorRegister_default = { nested: { request: { fields: { nickname: { type: "string", id: 1 }, accessToken: { type: "string", id: 2 }, openid: { type: "string", id: 3 }, field_5: { type: "int32", id: 5 }, platform: { type: "int32", id: 6 }, field_7: { type: "int32", id: 7 }, field_13: { type: "int32", id: 13 }, field_14: { type: "bytes", id: 14 }, region: { type: "string", id: 15 }, field_16: { type: "int32", id: 16 } } }, response: { fields: { code: { type: "int32", id: 1 }, message: { type: "string", id: 2 }, uid: { type: "string", id: 3 }, token: { type: "string", id: 4 }, serverUrl: { type: "string", id: 5 } } } } };
  }
});

// src/embedded-data/PlayerCSStats.json
var PlayerCSStats_default;
var init_PlayerCSStats = __esm({
  "src/embedded-data/PlayerCSStats.json"() {
    PlayerCSStats_default = { nested: { PlayerCSStats: { nested: { request: { fields: { accountid: { type: "uint64", id: 1 }, seasonid: { type: "uint32", id: 2 }, gamemode: { type: "uint32", id: 3 }, matchmode: { type: "uint32", id: 4 } } }, response: { fields: { csstats: { type: "AccountInfoWithTCStats", id: 1 } } }, AccountInfoWithTCStats: { fields: { accountid: { type: "uint64", id: 1 }, gamesplayed: { type: "uint32", id: 2 }, wins: { type: "uint32", id: 3 }, kills: { type: "uint32", id: 4 }, detailedstats: { type: "DetailedTCStats", id: 5 } } }, DetailedTCStats: { fields: { mvpcount: { type: "uint32", id: 1 }, doublekills: { type: "uint32", id: 2 }, triplekills: { type: "uint32", id: 3 }, fourkills: { type: "uint32", id: 4 }, damage: { type: "uint32", id: 5 }, headshotkills: { type: "uint32", id: 6 }, knockdowns: { type: "uint32", id: 7 }, revivals: { type: "uint32", id: 8 }, assists: { type: "uint32", id: 9 }, deaths: { type: "uint32", id: 10 }, streakwins: { type: "uint32", id: 11 }, throwingkills: { type: "uint32", id: 12 }, onegamemostdamage: { type: "uint32", id: 13 }, onegamemostkills: { type: "uint32", id: 14 }, ratingpoints: { type: "double", id: 15 }, ratingenabledgames: { type: "uint32", id: 16 }, headshotcount: { type: "uint32", id: 17 }, hitcount: { type: "uint32", id: 18 } } } } } } };
  }
});

// src/embedded-data/PlayerPersonalShow.json
var PlayerPersonalShow_default;
var init_PlayerPersonalShow = __esm({
  "src/embedded-data/PlayerPersonalShow.json"() {
    PlayerPersonalShow_default = { nested: { PlayerPersonalShow: { nested: { CallSignSrcType: { values: { None: 0, Without: 1, SearchChampionship: 2, SearchCup: 3, SearchFriend: 4, SearchChummy: 5, GameOver: 6, PersonalShowView: 7, PersonalShowEp: 8, PersonalShowOwner: 9, BriefInfo: 10, FriendRecall: 11, FriendPlatform: 12, FriendRequest: 13, FriendList: 14, FriendNtf: 15, FriendRecommend: 16, FriendCdt: 17, ClanRequest: 18, ClanMembers: 19, CupRequest: 20, CupMembers: 21, ChampionshipRequest: 22, ChampionshipMembers: 23, ChampionshipSeason: 24, ChummyRequest: 25, ChummyList: 26, ChummyRecommendStudent: 27, ChummyRecommendMentor: 28, LeaderboardProfile: 29, PoolLeaderboardProfile: 30, RecentVisitors: 31, LobbyPopupWindow: 32, MatchmakingBlacklist: 33, MatchmakingSocial: 34, MatchSpectation: 35, SocialTeamUpRecommend: 36, ClanInviteStrangers: 37, SendGiftNotify: 38 } }, request: { fields: { accountId: { type: "uint64", id: 1 }, callSignSrc: { type: "CallSignSrcType", id: 2 }, needGalleryInfo: { type: "bool", id: 3 } } }, EAttendanceVeteranLeaveDays: { values: { VETERANLEAVEDAYSNONE: 0, VETERANLEAVEDAYSSHORT: 1, VETERANLEAVEDAYSNORMAL: 2, VETERANLEAVEDAYSLONG: 3, VETERANLEAVEDAYSVERYLONG: 4 } }, EAttendancePreVeteranActionType: { values: { PREVETERANACTIONTYPENONE: 0, PREVETERANACTIONTYPEACTIVITY: 1, PREVETERANACTIONTYPEBUFF: 2 } }, EAccountExternalIconStatus: { values: { EXTERNALICONSTATUSNONE: 0, EXTERNALICONSTATUSNOTINUSE: 1, EXTERNALICONSTATUSINUSE: 2 } }, EAccountExternalIconShowType: { values: { EXTERNALICONSHOWTYPENONE: 0, EXTERNALICONSHOWTYPEFRIEND: 1, EXTERNALICONSHOWTYPEALL: 2 } }, ESocialHighLight: { values: { HIGHLIGHTNONE: 0, HIGHLIGHTBRWIN: 1, HIGHLIGHTCSMVP: 2, HIGHLIGHTBRSTREAKWIN: 3, HIGHLIGHTCSSTREAKWIN: 4, HIGHLIGHTCSRANKGROUPUPGRADE: 5, HIGHLIGHTTEAMACE: 6, HIGHLIGHTWEAPONPOWERTITLE: 7, HIGHLIGHTBRRANKGROUPUPGRADE: 9, HIGHLIGHTBRSTREAKWINEXECELLENT: 10, HIGHLIGHTCSSTREAKWINEXECELLENT: 11, HIGHLIGHTVETERAN: 12, HIGHLIGHTRANKINGTITLE: 13, HIGHLIGHTCSPEAKTITLE: 14 } }, BadgeType: { values: { BADGETYPEUNSPECIFIED: 0, BADGETYPEROLE: 1, BADGETYPEPRIME: 2 } }, EPrimePrivilegeID: { values: { PRIVILEGEIDNONE: 0, PRIVILEGEIDBADGE: 1, PRIVILEGEIDPROFILESKIN: 2, PRIVILEGEIDPROFILEANI: 3, PRIVILEGEIDINTERFACESKIN: 4, PRIVILEGEIDSETSHARE: 5, PRIVILEGEIDAVATARFRAME: 6, PRIVILEGEIDNAMECOLOR: 7, PRIVILEGEIDFESTIVAL: 8, PRIVILEGEIDBIGSCREEN: 9, PRIVILEGEIDMATCHMAKINGBLACKLIST: 10, PRIVILEGEIDADDSET: 11, PRIVILEGEIDADDFRIEND: 12, PRIVILEGEIDEXCLUSIVESHOP: 13, PRIVILEGEIDEXCLUSIVEGACHA: 14, PRIVILEGEIDEMOTE: 15, PRIVILEGEIDAVATARBANNER1: 16, PRIVILEGEIDAVATARBANNER2: 17, PRIVILEGEIDAVATARBANNER3: 18, PRIVILEGEIDGLOOWALL: 19, PRIVILEGEIDPRIMELEADERBOARD: 20, PRIVILEGEIDPROFILEBADGE: 21 } }, EProfileEquipSource: { values: { EQUIPSOURCESELF: 0, EQUIPSOURCECONFIDANTFRIEND: 1 } }, EProfileUnlockType: { values: { UNLOCKTYPENONE: 0, UNLOCKTYPELINK: 1 } }, ESocialGender: { values: { GENDERNONE: 0, GENDERMALE: 1, GENDERFEMALE: 2, GENDERUNLIMITED: 999 } }, ESocialLanguage: { values: { LANGUAGENONE: 0, LANGUAGEEN: 1, LANGUAGECNSIMPLIFIED: 2, LANGUAGECNTRADITIONAL: 3, LANGUAGETHAI: 4, LANGUAGEVIETNAMESE: 5, LANGUAGEINDONESIAN: 6, LANGUAGEPORTUGUESE: 7, LANGUAGESPANISH: 8, LANGUAGERUSSIAN: 9, LANGUAGEKOREAN: 10, LANGUAGEFRENCH: 11, LANGUAGEGERMAN: 12, LANGUAGETURKISH: 13, LANGUAGEHINDI: 14, LANGUAGEJAPANESE: 15, LANGUAGEROMANIAN: 16, LANGUAGEARABIC: 17, LANGUAGEBURMESE: 18, LANGUAGEURDU: 19, LANGUAGEBENGALI: 20, LANGUAGEMALAY: 21, LANGUAGEUNLIMITED: 999 } }, ESocialTimeOnline: { values: { TIMEONLINENONE: 0, TIMEONLINEWORKDAY: 1, TIMEONLINEWEEKEND: 2, TIMEONLINEUNLIMITED: 999 } }, ESocialTimeActive: { values: { TIMEACTIVENONE: 0, TIMEACTIVEMORNING: 1, TIMEACTIVEAFTERNOON: 2, TIMEACTIVENIGHT: 3, TIMEACTIVEUNLIMITED: 999 } }, ESocialPlayerBattleTagID: { values: { PLAYERBATTLETAGIDNONE: 0, PLAYERBATTLETAGIDDOMINATION: 1101, PLAYERBATTLETAGIDUNCROWN: 1102, PLAYERBATTLETAGIDBESTPARTNER: 1103, PLAYERBATTLETAGIDSNIPER: 1104, PLAYERBATTLETAGIDMELEE: 1105, PLAYERBATTLETAGIDPEACEMAKER: 1106, PLAYERBATTLETAGIDAMBUSH: 1107, PLAYERBATTLETAGIDSHORTSTOP: 1108, PLAYERBATTLETAGIDRAMPAGE: 1109, PLAYERBATTLETAGIDLEADER: 1110 } }, ESocialSocialTag: { values: { SOCIALTAGNONE: 0, SOCIALTAGFASHION: 2101, SOCIALTAGSOCIAL: 2102, SOCIALTAGVETERAN: 2103, SOCIALTAGNEWBIE: 2104, SOCIALTAGPLAYFORWIN: 2105, SOCIALTAGPLAYFORFUN: 2106, SOCIALTAGVOICEON: 2107, SOCIALTAGVOICEOFF: 2108 } }, ESocialModePrefer: { values: { MODEPREFERNONE: 0, MODEPREFERBR: 1, MODEPREFERCS: 2, MODEPREFERENTERTAINMENT: 3, MODEPREFERUNLIMITED: 999 } }, ESocialRankShow: { values: { RANKSHOWNONE: 0, RANKSHOWBR: 1, RANKSHOWCS: 2, RANKSHOWUNLIMITED: 999 } }, ELeaderBoardTitleRegionType: { values: { LEADERBOARDTITLEREGIONTYPENONE: 0, LEADERBOARDTITLEREGIONTYPECOUNTRY: 1, LEADERBOARDTITLEREGIONTYPEPROVINCE: 2, LEADERBOARDTITLEREGIONTYPECITY: 3, LEADERBOARDTITLEREGIONTYPEREGION: 4 } }, ELeaderBoardTitleType: { values: { LEADERBOARDTITLETYPENONE: 0, LEADERBOARDTITLETYPEWEAPONPOWERBR: 1, LEADERBOARDTITLETYPEWEAPONPOWERCS: 2, LEADERBOARDTITLETYPECLANWAR: 3, LEADERBOARDTITLETYPERANKBR: 4, LEADERBOARDTITLETYPERANKCS: 5, LEADERBOARDTITLETYPEPEAKCS: 6, LEADERBOARDTITLETYPEGRANDMASTERBR: 99, LEADERBOARDTITLETYPEGRANDMASTERCS: 100 } }, ECreditScoreRewardState: { values: { REWARDSTATEINVALID: 0, REWARDSTATEUNCLAIMED: 1, REWARDSTATECLAIMED: 2 } }, ECreditScoreSummaryLevel: { values: { SUMMARYLEVELNOTINIT: 0, SUMMARYLEVELA: 1, SUMMARYLEVELB: 2, SUMMARYLEVELC: 3, SUMMARYLEVELD: 4 } }, response: { fields: { basicinfo: { type: "AccountInfoBasic", id: 1 }, profileinfo: { type: "AvatarProfile", id: 2 }, rankingleaderboardpos: { type: "int32", id: 3 }, news: { rule: "repeated", type: "AccountNews", id: 4 }, historyepinfo: { rule: "repeated", type: "BasicEPInfo", id: 5 }, clanbasicinfo: { type: "ClanInfoBasic", id: 6 }, captainbasicinfo: { type: "AccountInfoBasic", id: 7 }, petinfo: { type: "PetInfo", id: 8 }, socialinfo: { type: "SocialBasicInfo", id: 9 }, diamondcostres: { type: "DiamondCostRes", id: 10 }, creditscoreinfo: { type: "CreditScoreInfoBasic", id: 11 }, preveterantype: { type: "EAttendancePreVeteranActionType", id: 12 }, mmrlist: { rule: "repeated", type: "AccountMMRInfo", id: 13 }, modestatssummaryinfo: { type: "ModeStatsSummaryInfo", id: 14 } } }, AccountInfoBasic: { fields: { accountid: { type: "uint64", id: 1 }, accounttype: { type: "uint32", id: 2 }, nickname: { type: "string", id: 3 }, externalid: { type: "string", id: 4 }, region: { type: "string", id: 5 }, level: { type: "uint32", id: 6 }, exp: { type: "uint32", id: 7 }, liked: { type: "uint32", id: 21 }, lastloginat: { type: "int64", id: 24 }, createat: { type: "int64", id: 44 } } }, AccountPrefers: { fields: { hidemylobby: { type: "bool", id: 1 }, pregameshowchoices: { rule: "repeated", type: "uint32", id: 2 }, brpregameshowchoices: { rule: "repeated", type: "uint32", id: 3 }, hidepersonalinfo: { type: "bool", id: 4 }, disablefriendspectate: { type: "bool", id: 5 }, hideoccupation: { type: "bool", id: 6 } } }, ExternalIconInfo: { fields: { externalicon: { type: "string", id: 1 }, status: { type: "EAccountExternalIconStatus", id: 2 }, showtype: { type: "EAccountExternalIconShowType", id: 3 } } }, OccupationSeasonInfo: { fields: { seasonid: { type: "uint32", id: 1 }, gamemode: { type: "uint32", id: 2 }, info: { type: "OccupationInfo", id: 3 }, matchmode: { type: "uint32", id: 4 }, extendval: { type: "uint32", id: 5 } } }, OccupationInfo: { fields: { occupationid: { type: "uint32", id: 1 }, scores: { type: "uint64", id: 2 }, proficients: { type: "uint64", id: 3 }, proficientlv: { type: "uint32", id: 4 }, isselect: { type: "bool", id: 5 } } }, SocialHighLightsWithSocialBasicInfo: { fields: { socialhighlights: { rule: "repeated", type: "SocialHighLight", id: 1 }, socialbasicinfo: { type: "SocialBasicInfo", id: 2 } } }, SocialHighLight: { fields: { highlight: { type: "ESocialHighLight", id: 1 }, expireat: { type: "int64", id: 2 }, value: { type: "uint32", id: 3 } } }, AbTestChoice: { fields: { type: { type: "uint32", id: 1 }, val: { type: "uint32", id: 2 } } }, ItemTagInfo: { fields: { itemid: { type: "uint32", id: 1 }, seriesid: { type: "uint32", id: 2 }, numid: { type: "uint32", id: 3 } } }, ModeStatsInfo: { fields: { gamemode: { type: "uint32", id: 1 }, score: { type: "uint32", id: 2 } } }, BadgeInfo: { fields: { badgetype: { type: "BadgeType", id: 1 }, subtype: { type: "uint32", id: 2 } } }, PrimePrivilegeDetail: { fields: { accountid: { type: "uint64", id: 1 }, primelevel: { type: "uint32", id: 2 }, privilegeidlist: { rule: "repeated", type: "EPrimePrivilegeID", id: 3 }, monthlypoints: { type: "int32", id: 4 }, annuallypoints: { type: "int32", id: 5 }, sumpoints: { type: "int32", id: 6 }, shareeremaintimes: { type: "uint32", id: 7 } } }, AvatarProfile: { oneofs: { _avatarid: { oneof: ["avatarid"] }, _skincolor: { oneof: ["skincolor"] }, _isselected: { oneof: ["isselected"] }, _pveprimaryweapon: { oneof: ["pveprimaryweapon"] }, _isselectedawaken: { oneof: ["isselectedawaken"] }, _endtime: { oneof: ["endtime"] }, _unlocktype: { oneof: ["unlocktype"] }, _unlocktime: { oneof: ["unlocktime"] }, _ismarkedstar: { oneof: ["ismarkedstar"] } }, fields: { avatarid: { type: "uint32", id: 1, options: { proto3_optional: true } }, skincolor: { type: "uint32", id: 2, options: { proto3_optional: true } }, clothes: { rule: "repeated", type: "uint32", id: 3 }, equipedskills: { rule: "repeated", type: "uint32", id: 4 }, isselected: { type: "bool", id: 5, options: { proto3_optional: true } }, pveprimaryweapon: { type: "uint32", id: 6, options: { proto3_optional: true } }, isselectedawaken: { type: "bool", id: 7, options: { proto3_optional: true } }, endtime: { type: "uint32", id: 8, options: { proto3_optional: true } }, unlocktype: { type: "EProfileUnlockType", id: 9, options: { proto3_optional: true } }, unlocktime: { type: "uint32", id: 10, options: { proto3_optional: true } }, ismarkedstar: { type: "bool", id: 11, options: { proto3_optional: true } }, clothestailoreffects: { rule: "repeated", type: "uint32", id: 12 }, itemtaginfo: { rule: "repeated", type: "ItemTagInfo", id: 13 } } }, AvatarSkillSlot: { fields: { slotid: { type: "uint32", id: 1 }, skillid: { type: "uint32", id: 2 }, equipsource: { type: "EProfileEquipSource", id: 3 } } }, EAccountNewsType: { values: { NEWSTYPENONE: 0, NEWSTYPERANK: 1, NEWSTYPELOTTERY: 2, NEWSTYPEPURCHASE: 3, NEWSTYPETREASUREBOX: 4, NEWSTYPEELITEPASS: 5, NEWSTYPEEXCHANGESTORE: 6, NEWSTYPEBUNDLE: 7, NEWSTYPELOTTERYSPECIALEXCHANGE: 8, NEWSTYPEOTHERS: 9 } }, AccountNews: { fields: { type: { type: "EAccountNewsType", id: 1 }, content: { type: "AccountNewsContent", id: 2 }, updatetime: { type: "int64", id: 3 } } }, AccountNewsContent: { fields: { itemids: { rule: "repeated", type: "uint32", id: 1 }, rank: { type: "uint32", id: 2 }, matchmode: { type: "uint32", id: 3 }, mapid: { type: "uint32", id: 4 }, gamemode: { type: "uint32", id: 5 }, groupmode: { type: "uint32", id: 6 }, treasureboxid: { type: "uint32", id: 7 }, commodityid: { type: "uint32", id: 8 }, storeid: { type: "uint32", id: 9 } } }, BasicEPInfo: { fields: { epeventid: { type: "uint32", id: 1 }, ownedpass: { type: "bool", id: 2 }, epbadge: { type: "uint32", id: 3 }, badgecnt: { type: "uint32", id: 4 }, bpicon: { type: "string", id: 5 }, maxlevel: { type: "uint32", id: 6 }, eventname: { type: "string", id: 7 } } }, ClanInfoBasic: { fields: { clanid: { type: "uint64", id: 1 }, clanname: { type: "string", id: 2 }, captainid: { type: "uint64", id: 3 }, clanlevel: { type: "uint32", id: 4 }, capacity: { type: "uint32", id: 5 }, membernum: { type: "uint32", id: 6 }, honorpoint: { type: "uint32", id: 7 } } }, PetInfo: { fields: { id: { type: "uint32", id: 1 }, name: { type: "string", id: 2 }, level: { type: "uint32", id: 3 }, exp: { type: "uint32", id: 4 }, isselected: { type: "bool", id: 5 }, skinid: { type: "uint32", id: 6 }, actions: { rule: "repeated", type: "uint32", id: 7 }, skills: { rule: "repeated", type: "PetSkillInfo", id: 8 }, selectedskillid: { type: "uint32", id: 9 }, ismarkedstar: { type: "bool", id: 10 }, endtime: { type: "uint32", id: 11 } } }, PetSkillInfo: { fields: { petid: { type: "uint32", id: 1 }, skillid: { type: "uint32", id: 2 }, skilllevel: { type: "uint32", id: 3 } } }, SocialBasicInfo: { fields: { accountid: { type: "uint64", id: 1 }, gender: { type: "ESocialGender", id: 2 }, language: { type: "ESocialLanguage", id: 3 }, timeonline: { type: "ESocialTimeOnline", id: 4 }, timeactive: { type: "ESocialTimeActive", id: 5 }, battletag: { rule: "repeated", type: "ESocialPlayerBattleTagID", id: 6 }, socialtag: { rule: "repeated", type: "ESocialSocialTag", id: 7 }, modeprefer: { type: "ESocialModePrefer", id: 8 }, signature: { type: "string", id: 9 }, rankshow: { type: "ESocialRankShow", id: 10 }, battletagcount: { rule: "repeated", type: "uint32", id: 11 }, signaturebanexpiretime: { type: "int64", id: 12 }, leaderboardtitles: { type: "LeaderboardTitleInfo", id: 13 } } }, LeaderboardTitleInfo: { fields: { weaponpowertitleinfo: { rule: "repeated", type: "WeaponPowerTitleInfo", id: 1 }, guildwartitleinfo: { rule: "repeated", type: "GuildWarTitleInfo", id: 2 }, rankingtitleinfo: { rule: "repeated", type: "RankingTitleInfo", id: 3 }, titlefirstreceive: { type: "bool", id: 4 }, cspeaktitleinfo: { rule: "repeated", type: "CSPeakTitleInfo", id: 5 }, peaktitlefirstreceive: { type: "bool", id: 6 } } }, WeaponPowerTitleInfo: { fields: { region: { type: "string", id: 1 }, titlecfgid: { type: "uint32", id: 2 }, leaderboardid: { type: "uint64", id: 3 }, weaponid: { type: "uint32", id: 4 }, rank: { type: "uint32", id: 5 }, expiretime: { type: "int64", id: 6 }, rewardtime: { type: "int64", id: 7 }, regionname: { type: "string", id: 8 }, regiontype: { type: "ELeaderBoardTitleRegionType", id: 9 }, isbr: { type: "bool", id: 10 }, titletype: { type: "ELeaderBoardTitleType", id: 11 } } }, GuildWarTitleInfo: { fields: { region: { type: "string", id: 1 }, clanid: { type: "uint64", id: 2 }, titlecfgid: { type: "uint32", id: 3 }, leaderboardid: { type: "uint64", id: 4 }, rank: { type: "uint32", id: 5 }, expiretime: { type: "int64", id: 6 }, rewardtime: { type: "int64", id: 7 }, isequipped: { type: "bool", id: 8 }, clanname: { type: "string", id: 9 } } }, RankingTitleInfo: { fields: { region: { type: "string", id: 1 }, titlecfgid: { type: "uint32", id: 2 }, leaderboardid: { type: "uint64", id: 3 }, rank: { type: "uint32", id: 4 }, expiretime: { type: "int64", id: 5 }, rewardtime: { type: "int64", id: 6 }, regionname: { type: "string", id: 7 }, regiontype: { type: "ELeaderBoardTitleRegionType", id: 8 }, isbr: { type: "bool", id: 9 } } }, CSPeakTitleInfo: { fields: { region: { type: "string", id: 1 }, titlecfgid: { type: "uint32", id: 2 }, leaderboardid: { type: "uint64", id: 3 }, rank: { type: "uint32", id: 4 }, expiretime: { type: "int64", id: 5 }, rewardtime: { type: "int64", id: 6 }, regionname: { type: "string", id: 7 }, isbr: { type: "bool", id: 8 }, regiontype: { type: "ELeaderBoardTitleRegionType", id: 9 } } }, DiamondCostRes: { fields: { diamondcost: { type: "uint32", id: 1 } } }, CreditScoreInfoBasic: { fields: { creditscore: { type: "uint32", id: 1 }, isinit: { type: "bool", id: 2 }, rewardstate: { type: "ECreditScoreRewardState", id: 3 }, periodicsummarylikecnt: { type: "uint32", id: 4 }, periodicsummaryillegalcnt: { type: "uint32", id: 5 }, weeklymatchcnt: { type: "uint32", id: 6 }, periodicsummarystarttime: { type: "int64", id: 7 }, periodicsummaryendtime: { type: "int64", id: 8 }, periodicsummarylevel: { type: "ECreditScoreSummaryLevel", id: 9 } } }, AccountMMRInfo: { fields: { gamemode: { type: "uint32", id: 1 }, mmr: { type: "uint32", id: 2 }, botpoint: { type: "uint32", id: 3 }, streakwins: { type: "uint32", id: 4 } } }, ModeStatsSummaryInfo: { fields: { reachedheroiccnt: { type: "uint32", id: 1 }, maxscore: { type: "uint32", id: 2 } } } } } } };
  }
});

// src/embedded-data/PlayerStats.json
var PlayerStats_default;
var init_PlayerStats = __esm({
  "src/embedded-data/PlayerStats.json"() {
    PlayerStats_default = { nested: { PlayerStats: { nested: { request: { fields: { accountid: { type: "uint64", id: 1 }, matchmode: { type: "uint32", id: 2 } } }, response: { fields: { solostats: { type: "AccountInfoWithStatsToClient", id: 1 }, duostats: { type: "AccountInfoWithStatsToClient", id: 2 }, quadstats: { type: "AccountInfoWithStatsToClient", id: 3 } } }, AccountInfoWithStatsToClient: { fields: { accountid: { type: "uint64", id: 1 }, gamesplayed: { type: "uint32", id: 2 }, wins: { type: "uint32", id: 3 }, kills: { type: "uint32", id: 4 }, detailedstats: { type: "PlayerDetailedStats", id: 5 } } }, PlayerDetailedStats: { fields: { deaths: { type: "uint32", id: 1 }, top10times: { type: "uint32", id: 2 }, topntimes: { type: "uint32", id: 3 }, distancetravelled: { type: "uint32", id: 4 }, survivaltime: { type: "uint32", id: 5 }, revives: { type: "uint32", id: 6 }, highestkills: { type: "uint32", id: 7 }, damage: { type: "uint32", id: 8 }, roadkills: { type: "uint32", id: 9 }, headshots: { type: "uint32", id: 10 }, headshotkills: { type: "uint32", id: 11 }, knockdown: { type: "uint32", id: 12 }, pickups: { type: "uint32", id: 13 } } } } } } };
  }
});

// src/embedded-data/SearchAccountByName.json
var SearchAccountByName_default;
var init_SearchAccountByName = __esm({
  "src/embedded-data/SearchAccountByName.json"() {
    SearchAccountByName_default = { nested: { SearchAccountByName: { nested: { request: { fields: { keyword: { type: "string", id: 1 } } }, response: { fields: { infos: { rule: "repeated", type: "PlayerPersonalShow.AccountInfoBasic", id: 1 } } } } }, PlayerPersonalShow: { nested: { CallSignSrcType: { values: { None: 0, Without: 1, SearchChampionship: 2, SearchCup: 3, SearchFriend: 4, SearchChummy: 5, GameOver: 6, PersonalShowView: 7, PersonalShowEp: 8, PersonalShowOwner: 9, BriefInfo: 10, FriendRecall: 11, FriendPlatform: 12, FriendRequest: 13, FriendList: 14, FriendNtf: 15, FriendRecommend: 16, FriendCdt: 17, ClanRequest: 18, ClanMembers: 19, CupRequest: 20, CupMembers: 21, ChampionshipRequest: 22, ChampionshipMembers: 23, ChampionshipSeason: 24, ChummyRequest: 25, ChummyList: 26, ChummyRecommendStudent: 27, ChummyRecommendMentor: 28, LeaderboardProfile: 29, PoolLeaderboardProfile: 30, RecentVisitors: 31, LobbyPopupWindow: 32, MatchmakingBlacklist: 33, MatchmakingSocial: 34, MatchSpectation: 35, SocialTeamUpRecommend: 36, ClanInviteStrangers: 37, SendGiftNotify: 38 } }, request: { fields: { accountId: { type: "uint64", id: 1 }, callSignSrc: { type: "CallSignSrcType", id: 2 }, needGalleryInfo: { type: "bool", id: 3 } } }, EAttendanceVeteranLeaveDays: { values: { VETERANLEAVEDAYSNONE: 0, VETERANLEAVEDAYSSHORT: 1, VETERANLEAVEDAYSNORMAL: 2, VETERANLEAVEDAYSLONG: 3, VETERANLEAVEDAYSVERYLONG: 4 } }, EAttendancePreVeteranActionType: { values: { PREVETERANACTIONTYPENONE: 0, PREVETERANACTIONTYPEACTIVITY: 1, PREVETERANACTIONTYPEBUFF: 2 } }, EAccountExternalIconStatus: { values: { EXTERNALICONSTATUSNONE: 0, EXTERNALICONSTATUSNOTINUSE: 1, EXTERNALICONSTATUSINUSE: 2 } }, EAccountExternalIconShowType: { values: { EXTERNALICONSHOWTYPENONE: 0, EXTERNALICONSHOWTYPEFRIEND: 1, EXTERNALICONSHOWTYPEALL: 2 } }, ESocialHighLight: { values: { HIGHLIGHTNONE: 0, HIGHLIGHTBRWIN: 1, HIGHLIGHTCSMVP: 2, HIGHLIGHTBRSTREAKWIN: 3, HIGHLIGHTCSSTREAKWIN: 4, HIGHLIGHTCSRANKGROUPUPGRADE: 5, HIGHLIGHTTEAMACE: 6, HIGHLIGHTWEAPONPOWERTITLE: 7, HIGHLIGHTBRRANKGROUPUPGRADE: 9, HIGHLIGHTBRSTREAKWINEXECELLENT: 10, HIGHLIGHTCSSTREAKWINEXECELLENT: 11, HIGHLIGHTVETERAN: 12, HIGHLIGHTRANKINGTITLE: 13, HIGHLIGHTCSPEAKTITLE: 14 } }, BadgeType: { values: { BADGETYPEUNSPECIFIED: 0, BADGETYPEROLE: 1, BADGETYPEPRIME: 2 } }, EPrimePrivilegeID: { values: { PRIVILEGEIDNONE: 0, PRIVILEGEIDBADGE: 1, PRIVILEGEIDPROFILESKIN: 2, PRIVILEGEIDPROFILEANI: 3, PRIVILEGEIDINTERFACESKIN: 4, PRIVILEGEIDSETSHARE: 5, PRIVILEGEIDAVATARFRAME: 6, PRIVILEGEIDNAMECOLOR: 7, PRIVILEGEIDFESTIVAL: 8, PRIVILEGEIDBIGSCREEN: 9, PRIVILEGEIDMATCHMAKINGBLACKLIST: 10, PRIVILEGEIDADDSET: 11, PRIVILEGEIDADDFRIEND: 12, PRIVILEGEIDEXCLUSIVESHOP: 13, PRIVILEGEIDEXCLUSIVEGACHA: 14, PRIVILEGEIDEMOTE: 15, PRIVILEGEIDAVATARBANNER1: 16, PRIVILEGEIDAVATARBANNER2: 17, PRIVILEGEIDAVATARBANNER3: 18, PRIVILEGEIDGLOOWALL: 19, PRIVILEGEIDPRIMELEADERBOARD: 20, PRIVILEGEIDPROFILEBADGE: 21 } }, EProfileEquipSource: { values: { EQUIPSOURCESELF: 0, EQUIPSOURCECONFIDANTFRIEND: 1 } }, EProfileUnlockType: { values: { UNLOCKTYPENONE: 0, UNLOCKTYPELINK: 1 } }, ESocialGender: { values: { GENDERNONE: 0, GENDERMALE: 1, GENDERFEMALE: 2, GENDERUNLIMITED: 999 } }, ESocialLanguage: { values: { LANGUAGENONE: 0, LANGUAGEEN: 1, LANGUAGECNSIMPLIFIED: 2, LANGUAGECNTRADITIONAL: 3, LANGUAGETHAI: 4, LANGUAGEVIETNAMESE: 5, LANGUAGEINDONESIAN: 6, LANGUAGEPORTUGUESE: 7, LANGUAGESPANISH: 8, LANGUAGERUSSIAN: 9, LANGUAGEKOREAN: 10, LANGUAGEFRENCH: 11, LANGUAGEGERMAN: 12, LANGUAGETURKISH: 13, LANGUAGEHINDI: 14, LANGUAGEJAPANESE: 15, LANGUAGEROMANIAN: 16, LANGUAGEARABIC: 17, LANGUAGEBURMESE: 18, LANGUAGEURDU: 19, LANGUAGEBENGALI: 20, LANGUAGEMALAY: 21, LANGUAGEUNLIMITED: 999 } }, ESocialTimeOnline: { values: { TIMEONLINENONE: 0, TIMEONLINEWORKDAY: 1, TIMEONLINEWEEKEND: 2, TIMEONLINEUNLIMITED: 999 } }, ESocialTimeActive: { values: { TIMEACTIVENONE: 0, TIMEACTIVEMORNING: 1, TIMEACTIVEAFTERNOON: 2, TIMEACTIVENIGHT: 3, TIMEACTIVEUNLIMITED: 999 } }, ESocialPlayerBattleTagID: { values: { PLAYERBATTLETAGIDNONE: 0, PLAYERBATTLETAGIDDOMINATION: 1101, PLAYERBATTLETAGIDUNCROWN: 1102, PLAYERBATTLETAGIDBESTPARTNER: 1103, PLAYERBATTLETAGIDSNIPER: 1104, PLAYERBATTLETAGIDMELEE: 1105, PLAYERBATTLETAGIDPEACEMAKER: 1106, PLAYERBATTLETAGIDAMBUSH: 1107, PLAYERBATTLETAGIDSHORTSTOP: 1108, PLAYERBATTLETAGIDRAMPAGE: 1109, PLAYERBATTLETAGIDLEADER: 1110 } }, ESocialSocialTag: { values: { SOCIALTAGNONE: 0, SOCIALTAGFASHION: 2101, SOCIALTAGSOCIAL: 2102, SOCIALTAGVETERAN: 2103, SOCIALTAGNEWBIE: 2104, SOCIALTAGPLAYFORWIN: 2105, SOCIALTAGPLAYFORFUN: 2106, SOCIALTAGVOICEON: 2107, SOCIALTAGVOICEOFF: 2108 } }, ESocialModePrefer: { values: { MODEPREFERNONE: 0, MODEPREFERBR: 1, MODEPREFERCS: 2, MODEPREFERENTERTAINMENT: 3, MODEPREFERUNLIMITED: 999 } }, ESocialRankShow: { values: { RANKSHOWNONE: 0, RANKSHOWBR: 1, RANKSHOWCS: 2, RANKSHOWUNLIMITED: 999 } }, ELeaderBoardTitleRegionType: { values: { LEADERBOARDTITLEREGIONTYPENONE: 0, LEADERBOARDTITLEREGIONTYPECOUNTRY: 1, LEADERBOARDTITLEREGIONTYPEPROVINCE: 2, LEADERBOARDTITLEREGIONTYPECITY: 3, LEADERBOARDTITLEREGIONTYPEREGION: 4 } }, ELeaderBoardTitleType: { values: { LEADERBOARDTITLETYPENONE: 0, LEADERBOARDTITLETYPEWEAPONPOWERBR: 1, LEADERBOARDTITLETYPEWEAPONPOWERCS: 2, LEADERBOARDTITLETYPECLANWAR: 3, LEADERBOARDTITLETYPERANKBR: 4, LEADERBOARDTITLETYPERANKCS: 5, LEADERBOARDTITLETYPEPEAKCS: 6, LEADERBOARDTITLETYPEGRANDMASTERBR: 99, LEADERBOARDTITLETYPEGRANDMASTERCS: 100 } }, ECreditScoreRewardState: { values: { REWARDSTATEINVALID: 0, REWARDSTATEUNCLAIMED: 1, REWARDSTATECLAIMED: 2 } }, ECreditScoreSummaryLevel: { values: { SUMMARYLEVELNOTINIT: 0, SUMMARYLEVELA: 1, SUMMARYLEVELB: 2, SUMMARYLEVELC: 3, SUMMARYLEVELD: 4 } }, response: { fields: { basicinfo: { type: "AccountInfoBasic", id: 1 }, profileinfo: { type: "AvatarProfile", id: 2 }, rankingleaderboardpos: { type: "int32", id: 3 }, news: { rule: "repeated", type: "AccountNews", id: 4 }, historyepinfo: { rule: "repeated", type: "BasicEPInfo", id: 5 }, clanbasicinfo: { type: "ClanInfoBasic", id: 6 }, captainbasicinfo: { type: "AccountInfoBasic", id: 7 }, petinfo: { type: "PetInfo", id: 8 }, socialinfo: { type: "SocialBasicInfo", id: 9 }, diamondcostres: { type: "DiamondCostRes", id: 10 }, creditscoreinfo: { type: "CreditScoreInfoBasic", id: 11 }, preveterantype: { type: "EAttendancePreVeteranActionType", id: 12 }, mmrlist: { rule: "repeated", type: "AccountMMRInfo", id: 13 }, modestatssummaryinfo: { type: "ModeStatsSummaryInfo", id: 14 } } }, AccountInfoBasic: { fields: { accountid: { type: "uint64", id: 1 }, accounttype: { type: "uint32", id: 2 }, nickname: { type: "string", id: 3 }, externalid: { type: "string", id: 4 }, region: { type: "string", id: 5 }, level: { type: "uint32", id: 6 }, exp: { type: "uint32", id: 7 }, liked: { type: "uint32", id: 21 }, lastloginat: { type: "int64", id: 24 }, createat: { type: "int64", id: 44 } } }, AccountPrefers: { fields: { hidemylobby: { type: "bool", id: 1 }, pregameshowchoices: { rule: "repeated", type: "uint32", id: 2 }, brpregameshowchoices: { rule: "repeated", type: "uint32", id: 3 }, hidepersonalinfo: { type: "bool", id: 4 }, disablefriendspectate: { type: "bool", id: 5 }, hideoccupation: { type: "bool", id: 6 } } }, ExternalIconInfo: { fields: { externalicon: { type: "string", id: 1 }, status: { type: "EAccountExternalIconStatus", id: 2 }, showtype: { type: "EAccountExternalIconShowType", id: 3 } } }, OccupationSeasonInfo: { fields: { seasonid: { type: "uint32", id: 1 }, gamemode: { type: "uint32", id: 2 }, info: { type: "OccupationInfo", id: 3 }, matchmode: { type: "uint32", id: 4 }, extendval: { type: "uint32", id: 5 } } }, OccupationInfo: { fields: { occupationid: { type: "uint32", id: 1 }, scores: { type: "uint64", id: 2 }, proficients: { type: "uint64", id: 3 }, proficientlv: { type: "uint32", id: 4 }, isselect: { type: "bool", id: 5 } } }, SocialHighLightsWithSocialBasicInfo: { fields: { socialhighlights: { rule: "repeated", type: "SocialHighLight", id: 1 }, socialbasicinfo: { type: "SocialBasicInfo", id: 2 } } }, SocialHighLight: { fields: { highlight: { type: "ESocialHighLight", id: 1 }, expireat: { type: "int64", id: 2 }, value: { type: "uint32", id: 3 } } }, AbTestChoice: { fields: { type: { type: "uint32", id: 1 }, val: { type: "uint32", id: 2 } } }, ItemTagInfo: { fields: { itemid: { type: "uint32", id: 1 }, seriesid: { type: "uint32", id: 2 }, numid: { type: "uint32", id: 3 } } }, ModeStatsInfo: { fields: { gamemode: { type: "uint32", id: 1 }, score: { type: "uint32", id: 2 } } }, BadgeInfo: { fields: { badgetype: { type: "BadgeType", id: 1 }, subtype: { type: "uint32", id: 2 } } }, PrimePrivilegeDetail: { fields: { accountid: { type: "uint64", id: 1 }, primelevel: { type: "uint32", id: 2 }, privilegeidlist: { rule: "repeated", type: "EPrimePrivilegeID", id: 3 }, monthlypoints: { type: "int32", id: 4 }, annuallypoints: { type: "int32", id: 5 }, sumpoints: { type: "int32", id: 6 }, shareeremaintimes: { type: "uint32", id: 7 } } }, AvatarProfile: { oneofs: { _avatarid: { oneof: ["avatarid"] }, _skincolor: { oneof: ["skincolor"] }, _isselected: { oneof: ["isselected"] }, _pveprimaryweapon: { oneof: ["pveprimaryweapon"] }, _isselectedawaken: { oneof: ["isselectedawaken"] }, _endtime: { oneof: ["endtime"] }, _unlocktype: { oneof: ["unlocktype"] }, _unlocktime: { oneof: ["unlocktime"] }, _ismarkedstar: { oneof: ["ismarkedstar"] } }, fields: { avatarid: { type: "uint32", id: 1, options: { proto3_optional: true } }, skincolor: { type: "uint32", id: 2, options: { proto3_optional: true } }, clothes: { rule: "repeated", type: "uint32", id: 3 }, equipedskills: { rule: "repeated", type: "uint32", id: 4 }, isselected: { type: "bool", id: 5, options: { proto3_optional: true } }, pveprimaryweapon: { type: "uint32", id: 6, options: { proto3_optional: true } }, isselectedawaken: { type: "bool", id: 7, options: { proto3_optional: true } }, endtime: { type: "uint32", id: 8, options: { proto3_optional: true } }, unlocktype: { type: "EProfileUnlockType", id: 9, options: { proto3_optional: true } }, unlocktime: { type: "uint32", id: 10, options: { proto3_optional: true } }, ismarkedstar: { type: "bool", id: 11, options: { proto3_optional: true } }, clothestailoreffects: { rule: "repeated", type: "uint32", id: 12 }, itemtaginfo: { rule: "repeated", type: "ItemTagInfo", id: 13 } } }, AvatarSkillSlot: { fields: { slotid: { type: "uint32", id: 1 }, skillid: { type: "uint32", id: 2 }, equipsource: { type: "EProfileEquipSource", id: 3 } } }, EAccountNewsType: { values: { NEWSTYPENONE: 0, NEWSTYPERANK: 1, NEWSTYPELOTTERY: 2, NEWSTYPEPURCHASE: 3, NEWSTYPETREASUREBOX: 4, NEWSTYPEELITEPASS: 5, NEWSTYPEEXCHANGESTORE: 6, NEWSTYPEBUNDLE: 7, NEWSTYPELOTTERYSPECIALEXCHANGE: 8, NEWSTYPEOTHERS: 9 } }, AccountNews: { fields: { type: { type: "EAccountNewsType", id: 1 }, content: { type: "AccountNewsContent", id: 2 }, updatetime: { type: "int64", id: 3 } } }, AccountNewsContent: { fields: { itemids: { rule: "repeated", type: "uint32", id: 1 }, rank: { type: "uint32", id: 2 }, matchmode: { type: "uint32", id: 3 }, mapid: { type: "uint32", id: 4 }, gamemode: { type: "uint32", id: 5 }, groupmode: { type: "uint32", id: 6 }, treasureboxid: { type: "uint32", id: 7 }, commodityid: { type: "uint32", id: 8 }, storeid: { type: "uint32", id: 9 } } }, BasicEPInfo: { fields: { epeventid: { type: "uint32", id: 1 }, ownedpass: { type: "bool", id: 2 }, epbadge: { type: "uint32", id: 3 }, badgecnt: { type: "uint32", id: 4 }, bpicon: { type: "string", id: 5 }, maxlevel: { type: "uint32", id: 6 }, eventname: { type: "string", id: 7 } } }, ClanInfoBasic: { fields: { clanid: { type: "uint64", id: 1 }, clanname: { type: "string", id: 2 }, captainid: { type: "uint64", id: 3 }, clanlevel: { type: "uint32", id: 4 }, capacity: { type: "uint32", id: 5 }, membernum: { type: "uint32", id: 6 }, honorpoint: { type: "uint32", id: 7 } } }, PetInfo: { fields: { id: { type: "uint32", id: 1 }, name: { type: "string", id: 2 }, level: { type: "uint32", id: 3 }, exp: { type: "uint32", id: 4 }, isselected: { type: "bool", id: 5 }, skinid: { type: "uint32", id: 6 }, actions: { rule: "repeated", type: "uint32", id: 7 }, skills: { rule: "repeated", type: "PetSkillInfo", id: 8 }, selectedskillid: { type: "uint32", id: 9 }, ismarkedstar: { type: "bool", id: 10 }, endtime: { type: "uint32", id: 11 } } }, PetSkillInfo: { fields: { petid: { type: "uint32", id: 1 }, skillid: { type: "uint32", id: 2 }, skilllevel: { type: "uint32", id: 3 } } }, SocialBasicInfo: { fields: { accountid: { type: "uint64", id: 1 }, gender: { type: "ESocialGender", id: 2 }, language: { type: "ESocialLanguage", id: 3 }, timeonline: { type: "ESocialTimeOnline", id: 4 }, timeactive: { type: "ESocialTimeActive", id: 5 }, battletag: { rule: "repeated", type: "ESocialPlayerBattleTagID", id: 6 }, socialtag: { rule: "repeated", type: "ESocialSocialTag", id: 7 }, modeprefer: { type: "ESocialModePrefer", id: 8 }, signature: { type: "string", id: 9 }, rankshow: { type: "ESocialRankShow", id: 10 }, battletagcount: { rule: "repeated", type: "uint32", id: 11 }, signaturebanexpiretime: { type: "int64", id: 12 }, leaderboardtitles: { type: "LeaderboardTitleInfo", id: 13 } } }, LeaderboardTitleInfo: { fields: { weaponpowertitleinfo: { rule: "repeated", type: "WeaponPowerTitleInfo", id: 1 }, guildwartitleinfo: { rule: "repeated", type: "GuildWarTitleInfo", id: 2 }, rankingtitleinfo: { rule: "repeated", type: "RankingTitleInfo", id: 3 }, titlefirstreceive: { type: "bool", id: 4 }, cspeaktitleinfo: { rule: "repeated", type: "CSPeakTitleInfo", id: 5 }, peaktitlefirstreceive: { type: "bool", id: 6 } } }, WeaponPowerTitleInfo: { fields: { region: { type: "string", id: 1 }, titlecfgid: { type: "uint32", id: 2 }, leaderboardid: { type: "uint64", id: 3 }, weaponid: { type: "uint32", id: 4 }, rank: { type: "uint32", id: 5 }, expiretime: { type: "int64", id: 6 }, rewardtime: { type: "int64", id: 7 }, regionname: { type: "string", id: 8 }, regiontype: { type: "ELeaderBoardTitleRegionType", id: 9 }, isbr: { type: "bool", id: 10 }, titletype: { type: "ELeaderBoardTitleType", id: 11 } } }, GuildWarTitleInfo: { fields: { region: { type: "string", id: 1 }, clanid: { type: "uint64", id: 2 }, titlecfgid: { type: "uint32", id: 3 }, leaderboardid: { type: "uint64", id: 4 }, rank: { type: "uint32", id: 5 }, expiretime: { type: "int64", id: 6 }, rewardtime: { type: "int64", id: 7 }, isequipped: { type: "bool", id: 8 }, clanname: { type: "string", id: 9 } } }, RankingTitleInfo: { fields: { region: { type: "string", id: 1 }, titlecfgid: { type: "uint32", id: 2 }, leaderboardid: { type: "uint64", id: 3 }, rank: { type: "uint32", id: 4 }, expiretime: { type: "int64", id: 5 }, rewardtime: { type: "int64", id: 6 }, regionname: { type: "string", id: 7 }, regiontype: { type: "ELeaderBoardTitleRegionType", id: 8 }, isbr: { type: "bool", id: 9 } } }, CSPeakTitleInfo: { fields: { region: { type: "string", id: 1 }, titlecfgid: { type: "uint32", id: 2 }, leaderboardid: { type: "uint64", id: 3 }, rank: { type: "uint32", id: 4 }, expiretime: { type: "int64", id: 5 }, rewardtime: { type: "int64", id: 6 }, regionname: { type: "string", id: 7 }, isbr: { type: "bool", id: 8 }, regiontype: { type: "ELeaderBoardTitleRegionType", id: 9 } } }, DiamondCostRes: { fields: { diamondcost: { type: "uint32", id: 1 } } }, CreditScoreInfoBasic: { fields: { creditscore: { type: "uint32", id: 1 }, isinit: { type: "bool", id: 2 }, rewardstate: { type: "ECreditScoreRewardState", id: 3 }, periodicsummarylikecnt: { type: "uint32", id: 4 }, periodicsummaryillegalcnt: { type: "uint32", id: 5 }, weeklymatchcnt: { type: "uint32", id: 6 }, periodicsummarystarttime: { type: "int64", id: 7 }, periodicsummaryendtime: { type: "int64", id: 8 }, periodicsummarylevel: { type: "ECreditScoreSummaryLevel", id: 9 } } }, AccountMMRInfo: { fields: { gamemode: { type: "uint32", id: 1 }, mmr: { type: "uint32", id: 2 }, botpoint: { type: "uint32", id: 3 }, streakwins: { type: "uint32", id: 4 } } }, ModeStatsSummaryInfo: { fields: { reachedheroiccnt: { type: "uint32", id: 1 }, maxscore: { type: "uint32", id: 2 } } } } } } };
  }
});

// src/embedded-data/SetPlayerGalleryShowInfo.json
var SetPlayerGalleryShowInfo_default;
var init_SetPlayerGalleryShowInfo = __esm({
  "src/embedded-data/SetPlayerGalleryShowInfo.json"() {
    SetPlayerGalleryShowInfo_default = { nested: { SetPlayerGalleryShowInfo: { nested: { request: { fields: { version: { type: "uint32", id: 1 }, infoItem: { rule: "repeated", type: "GalleryShowInfo", id: 2 } } }, request_single: { fields: { version: { type: "uint32", id: 1 }, infoItem: { type: "GalleryShowInfo", id: 2 } } }, GalleryShowInfo: { fields: { infoType: { type: "GalleryShow_InfoType", id: 1 }, items: { rule: "repeated", type: "GalleryShowInfoItem", id: 2 } } }, GalleryShow_InfoType: { values: { InfoType_NONE: 0, InfoType_ITEM: 1, InfoType_BATTLEPASS: 2, InfoType_ACHIEVEMENT: 3, InfoType_WEAPONEXP: 4, InfoType_SIGNATURE: 5, InfoType_BUDDYINFO: 6, InfoType_RANKINGSTATS: 7, InfoType_LEADERBOARDTITLE: 8, InfoType_CLANINFO: 9, InfoType_CLANHISOTRYLEADERBOARD: 10, InfoType_ACHIEVEMENT_STATS: 11, InfoType_BADGE: 12 } }, GalleryShowInfoItem: { fields: { type: { type: "uint32", id: 1 }, subType: { type: "uint32", id: 2 }, isExtra: { type: "bool", id: 3 }, positionX: { type: "uint32", id: 4 }, positionY: { type: "uint32", id: 5 }, extraInfo: { type: "GalleryShowExtraInfo", id: 6 } } }, GalleryShowExtraInfo: { fields: { region: { type: "string", id: 1 }, level: { type: "uint32", id: 2 }, rank: { type: "uint32", id: 3 }, maxLevel: { type: "uint32", id: 4 }, friendId: { type: "uint64", id: 5 }, itemId: { type: "uint32", id: 6 }, itemExtraId: { type: "uint32", id: 7 }, value: { type: "uint32", id: 8 }, key: { type: "string", id: 9 }, expireTime: { type: "int64", id: 10 }, leaderboardId: { type: "uint64", id: 11 }, weaponId: { type: "uint32", id: 12 }, titleCfgId: { type: "uint32", id: 13 }, clanId: { type: "uint64", id: 14 }, createTime: { type: "int64", id: 15 }, seriesId: { type: "uint32", id: 16 }, numId: { type: "uint32", id: 17 }, clanName: { type: "string", id: 18 }, clanLevel: { type: "uint32", id: 19 }, clanFrameId: { type: "uint32", id: 20 }, clanBadgeId: { type: "uint32", id: 21 }, clanUseCustomBadge: { type: "bool", id: 22 }, clanCustomBadge: { type: "string", id: 23 }, clanGloryNum: { type: "uint32", id: 24 } } } } } } };
  }
});

// src/embedded-data/settings.json
var settings_default;
var init_settings = __esm({
  "src/embedded-data/settings.json"() {
    settings_default = {
      AE_MAIN_KEY: "Yg&tc%DEuh6%Zc^8",
      AE_MAIN_IV: "6oyZDr22E3ychjM%",
      HEADERS_COMMON_USER_AGENT: "Dalvik/2.1.0 (Linux; U; Android 13; A063 Build/TKQ1.221220.001)",
      HEADERS_COMMON_CONNECTION: "Keep-Alive",
      HEADERS_COMMON_ACCEPT_ENCODING: "gzip",
      HEADERS_COMMON_EXPECT: "100-continue",
      HEADERS_COMMON_X_UNITY_VERSION: "2018.4.11f1",
      HEADERS_COMMON_X_GA: "v1 1",
      HEADERS_COMMON_RELEASE_VERSION: "OB54",
      HEADERS_COMMON_CONTENT_TYPE: "application/x-www-form-urlencoded",
      HEADERS_GARENA_AUTH_USER_AGENT: "GarenaMSDK/4.0.19P9(A063 ;Android 13;en;IN;)",
      HEADERS_GARENA_AUTH_CONNECTION: "Keep-Alive",
      HEADERS_GARENA_AUTH_ACCEPT_ENCODING: "gzip",
      URL_GARENA_TOKEN: "https://ffmconnect.live.gop.garenanow.com/oauth/guest/token/grant",
      URL_GUEST_REGISTER: "https://ffmconnect.live.gop.garenanow.com/oauth/guest/register",
      URL_MAJOR_LOGIN: "https://loginbp.ggblueshark.com/MajorLogin",
      URL_MAJOR_REGISTER: "https://loginbp.ggblueshark.com/MajorRegister",
      URL_PATH_SEARCH: "/FuzzySearchAccountByName",
      URL_PATH_PERSONAL_SHOW: "/GetPlayerPersonalShow",
      URL_PATH_PLAYER_STATS: "/GetPlayerStats",
      URL_PATH_PLAYER_CS_STATS: "/GetPlayerTCStats",
      GARENA_CLIENT_ID: "100067",
      GARENA_CLIENT_SECRET: "2ee44819e9b4598845141067b281621874d0d5d7af9d8f7e00c1e54715b7d1e3"
    };
  }
});

// src/embedded-data/credentials.json
var credentials_default;
var init_credentials = __esm({
  "src/embedded-data/credentials.json"() {
    credentials_default = {
      IND: [
        {
          uid: "4718507406",
          password: "8C33879DCE23FB788CE56E20CC28D2504CF1886C94F232164ACC20E155E36006"
        },
        {
          uid: "4718507483",
          password: "D4A89FB4921DDAF2BC0F18456E1B849B2238DA0BE95A6B77F705FCAC173F025E"
        },
        {
          uid: "4718507546",
          password: "2A0AF07C7F56F2E893327B450DE709CCB1AF884519710C40999EEFA8932B875F"
        },
        {
          uid: "4718507624",
          password: "55A57072116F6777B372EF6536F3B4BA0EB8CD6DF6F062ABC64D88091F546EAA"
        },
        {
          uid: "4718507684",
          password: "97FE5EA08B24C2851EBAAE4D2AAA71298FCAD45EE30E08FF41AFDB3A9F1EA7D0"
        },
        {
          uid: "4718507737",
          password: "0DA176F091769F1022CB9CCC9E4EA29D44735624E88E016A81D8061AC07BD777"
        },
        {
          uid: "4718507823",
          password: "506D5EF550F365C89806066468D5327C9FC7E40F60548BF9FE7BAA64D1ACF099"
        },
        {
          uid: "4718507893",
          password: "04C83B39FC0C43240AD6B6A55247B258075EA30A844D4671F035CEC3EB43228A"
        },
        {
          uid: "4718507964",
          password: "707957DD8BE099FF429D79B49BBA52C5926096BBBEB243C2C9B0849909206AB9"
        },
        {
          uid: "4718508029",
          password: "D25435CB701067838FBC9836D3DFB7423FC19B06F7868B88CDB1EB270B9BD164"
        },
        {
          uid: "4718548282",
          password: "1E805CD54DE99E2E172BAAE00CD7A42F5A43F654258C1101DFC9E1BCB3878643"
        },
        {
          uid: "4718548400",
          password: "D97F7650F59A2CC15047551DBC5F624DDE5D8EC9D576E315FF6610F7D10CB08C"
        },
        {
          uid: "4718548568",
          password: "B6B1C8C0C79CA76455F6329353EF803960585E0F453F3E8C0BECD8A8F23FCF26"
        },
        {
          uid: "4718548792",
          password: "F9CA37B8B027A9D39977386BFF3806A48290607E82B84FE7051A697B88F8216A"
        },
        {
          uid: "4718548953",
          password: "AB2F3769CFEC482DA1E83E30CF3DAB4E4792D27BB96EC95C445AE707E79485A3"
        },
        {
          uid: "4718549095",
          password: "67F7BF181585716984F41928A62045D1D4A7716F5D81F3515A75DC78B46559A8"
        },
        {
          uid: "4718549327",
          password: "B789D11291938DAAAC0446F4BDD9DD1D77ABE422686413AA70E130192D8E96A8"
        },
        {
          uid: "4718549470",
          password: "CEC51F94D2CC395B7B93AFBE0F2F54A01F38903AC41F41DA997DBDACE4454FFB"
        },
        {
          uid: "4718549623",
          password: "C99ED47BA662806EA8F8D42066C411BAB5D7AB6D9E17434991F03CE006F9C8C5"
        },
        {
          uid: "4718549826",
          password: "C81FBFB184E0AA5245239ED5C61130E28E85F7773D1BEA51A6E8DC700EE4E11C"
        },
        {
          uid: "4718550018",
          password: "B3D77D67FF465349AE3F35A9EC65ECEDC37BABA563380E7C2FF480DA43FB2C02"
        },
        {
          uid: "4718550189",
          password: "0E5A41835F576A2A9D5495601ADD5ABD4B21CF6110F4178F1AD02982E0DC0919"
        },
        {
          uid: "4718550346",
          password: "4F5D814AECA6E50FBA538DAF55AB0F26F560620F1E63CD47DAFAA7C7B6E2EC26"
        },
        {
          uid: "4718550505",
          password: "EDB4E6D13D63D9D92CF449D42A2A92094CC68E711E2BDFB57D3B4AA28BF942DA"
        },
        {
          uid: "4718550640",
          password: "28DA66FC70EB5A72C514AFD7BD0048C1BC4A1A897D96512749C5561151FFEABF"
        },
        {
          uid: "4718550799",
          password: "B7B67DB1BBE2F488B167B0960A86F248D7D9721F61A9A251D53AF87E59D04853"
        },
        {
          uid: "4718550968",
          password: "5D803919A5837EC86CC2C5CED596675057A1688F3BD19D31DB14757F70F445EA"
        },
        {
          uid: "4718551115",
          password: "F8A3AC945D2E7E1BFCF8847298BEBD8DDF35029FBBDC383EF1299ED6BDF9439D"
        },
        {
          uid: "4718551245",
          password: "CE568B4126F503F38217D7337618B4A032F1A85F4948E075BBF10BDA6ECB48DB"
        },
        {
          uid: "4718551454",
          password: "F8C27E6D7D9C7A48962DDC538441D55C581E6731C478ED4C7368A26CE352ADF1"
        },
        {
          uid: "4718551631",
          password: "507D2504AFD9787A8BA0575137976F186A71CE197A515EBD6FF840BA5857D217"
        },
        {
          uid: "4718551796",
          password: "1201ABB7C812A55637D083B17067500A661334F4425530E7700A1D40A05CBE69"
        },
        {
          uid: "4718551956",
          password: "5FBF3453B4DD5F31F16E52684E80D5812491C9AC989B3E3F465DE5F2F92621EB"
        },
        {
          uid: "4718552115",
          password: "08EA28CF2C39EB27951476095CB06FE138CF60F185E4852ED4CB42144B1B8025"
        },
        {
          uid: "4718552247",
          password: "48B2F0A7D60FD1CD3220C6763BBE932A463594E36C65268BC0894AEDA996BDF8"
        },
        {
          uid: "4718552393",
          password: "20994576D91C8E09763F253C9BC1D9C275025618A24DBD32D2CBD58DFACC5076"
        },
        {
          uid: "4718552558",
          password: "B49C566F97FE0B44BB046C99BE97B49D781E46F767292A22B1FDE7A1C1EAB9D7"
        },
        {
          uid: "4718552714",
          password: "1566D6582F89142DB904BB7BECCA977D5CA72BC9238FE29A8FD85B012E7B1BBD"
        },
        {
          uid: "4718552850",
          password: "46DB4EB161D449C176450DBDC53E04161C6F626B4915E6F88BC6BB1D93627341"
        },
        {
          uid: "4718553054",
          password: "962C1110307063E76FFF92F799A960AEF465FB16AA32FB5EB86F3397882171BA"
        },
        {
          uid: "4718553251",
          password: "7F82558A52C6ACDC9B62F032329D7C40F77428D3FE12B402B58A847C38861D96"
        },
        {
          uid: "4718553396",
          password: "66FD19F034F96ED0F522E50ABF6C5E897D35AFD883065DD765242EC118DF5EB8"
        },
        {
          uid: "4718553552",
          password: "7A16C92665E821F009F42AF6CB3AF36C4398D8FD51FF36AEB0A718AE810D959B"
        },
        {
          uid: "4718553721",
          password: "FBE965213ED79A40273F3829C5FD612F7ACA5E05AB3D650F0F3106DCFF8B7068"
        },
        {
          uid: "4718553888",
          password: "6F5AC6C9245F9A638C3ED91B7B88E2A533A7EB5FB5B344E2F841E127A507EEA9"
        },
        {
          uid: "4718554054",
          password: "7C94B5243D012B51F695BA81F031AB6ABC77CDA007461EDE4E93D41E8DA4ADAA"
        },
        {
          uid: "4718554216",
          password: "DDF10640FF992BA8CB1CCA616ED792312BFFAEC5C16C421ADA1B241F3EDADEF3"
        },
        {
          uid: "4718554396",
          password: "4ACBF6CA90F8947E77E4674BC7FEA5796C8E6F1956192D83864A080A9F53B138"
        },
        {
          uid: "4718554693",
          password: "8C69ECCE37D069A55E74836171293B15386131576005ABC0DD4AF8AC15A5C384"
        },
        {
          uid: "4718554901",
          password: "6DA113B50175E0B7702CAF37DAA1827E99C8A64916C45449289FAE1CD700CAA6"
        },
        {
          uid: "4718555088",
          password: "03E1BBFAD8A452222BAEAA12FEF899D81860B3F358E172A0C7427CA483694A33"
        },
        {
          uid: "4718555240",
          password: "1E5DC4F909E0FAC7ABAE30795A5DC7C2F589F689B02AE06928B175F4EC712DEA"
        },
        {
          uid: "4718555380",
          password: "B0F0C191618D80B770BE351954D8C3775FD5ECD1CF6876F3B66799C8711C50B4"
        },
        {
          uid: "4718555534",
          password: "0D2FF41B8ED9991F734BE9765DDA64C8BB5F91D4B8B86F4C18D0DA7671555961"
        },
        {
          uid: "4718555694",
          password: "47927297A17D7C764240E96F0932A434064316304BBBCBA6F25C20E212831E87"
        },
        {
          uid: "4718555861",
          password: "F15A724AE355036DA7483C054DD8B8C384A65530D8166DC7B48B2E831CF57EA1"
        },
        {
          uid: "4718556002",
          password: "9C6405DBF56A167A6D08922C093419999507DEFC56BF67900BD2A0EAE1D5FC0F"
        },
        {
          uid: "4718556142",
          password: "CB6D716175CF8D59A78850508DAE262D40EEE4B616788CE0525F12F9A87A8180"
        },
        {
          uid: "4718556298",
          password: "F48C1FFA7FFA48233C7005A37625FE9020F391032C541652ABF37F7411B9E30D"
        },
        {
          uid: "4718556463",
          password: "4EF645DA14E382076759748F5C652C2F6815A2EACDE0A701132A2B9CDA1B710B"
        },
        {
          uid: "4718556681",
          password: "8CD8B6E20F4BE134C4F022A7634E77D9699DE65BED42A1A6B445307FD80975CA"
        },
        {
          uid: "4718556846",
          password: "CC716916E2C18B2100664243D5A9C74CF4710C9BA0FF9DECD0EC55323ED36B2D"
        },
        {
          uid: "4718557018",
          password: "76B4657F534C382EFE6F849CE0C4E76A1A93E578653F3ABF6080DF8E3A8F5001"
        },
        {
          uid: "4718557191",
          password: "2B06C7F451E8469280EA1633E1CF0E20A0DF1E502AE2ABB9BAC4B5B3FB63C1EF"
        },
        {
          uid: "4718557362",
          password: "B0B1BE597E8CFB6F9FA1961D250FC0064F8C2CFDAC520B72DD5A116F6C374E17"
        },
        {
          uid: "4718557515",
          password: "347395F389DF638A92D3A68A75CBF6FE27E48927413DB1BE27BEBAB4E2719F53"
        },
        {
          uid: "4718557643",
          password: "151A0BBDA65594C79449C1A92CA9926FC4E3CDCEEED91B07FD2BE05392A4866D"
        },
        {
          uid: "4718557815",
          password: "3C2FA3B7463AF2877EC143642C4BAAFB932BDE005777FCC6B075B8553E6F04E1"
        },
        {
          uid: "4718557970",
          password: "660B746458596479630F0991B81B56BF9D48DDE63C43428CCC047CB27F4690AF"
        },
        {
          uid: "4718558121",
          password: "B64ED57C5049E8E94725D6717AE33241F9682CF8E41042386174553C5D64E501"
        },
        {
          uid: "4718558361",
          password: "7C1BEA7BC9585079296C52B1A1E1682F90AE255BFC726737BE247A2ADE54766D"
        },
        {
          uid: "4718558528",
          password: "0BF6807B6F41757FAC800D2F73E97A5D3AC41F1101DA47D497DF532CA78D3E0B"
        },
        {
          uid: "4718558774",
          password: "0A7147FA2433E1E1869A0369A102167FCDB519A34525EB593FB2D78576BF5156"
        },
        {
          uid: "4718558924",
          password: "24568FDB99529E0478CF47929B8601E15604B15966CB1B62D8CAE0DBA3385BAB"
        },
        {
          uid: "4718559066",
          password: "3CE06ECDE6055CAB3C6D4453589C1E7E36946E45BEECCAB4BD2C5F800DCA6CED"
        },
        {
          uid: "4718559233",
          password: "C05F5019C55AFBBD58EF4E301B6A0C000220089CCE3900976BD214A6E909675F"
        },
        {
          uid: "4718559360",
          password: "A2CBA5DBC0C0E14F425234ABB35B3D5E39D21EE74FC81F05224F28C5BCD15575"
        },
        {
          uid: "4718559528",
          password: "F9F6556703F2CF126F53E6CD1D09C1C07A66703AD1949D6EE172557F8B7B77E9"
        },
        {
          uid: "4718559662",
          password: "DC6E2BE581776223C9D5F4F78043FA1662F8CC05D41F8433100592CFA92AE914"
        },
        {
          uid: "4718559814",
          password: "C37395E2CBF44AB52D2CD2110562093C3B74C89B7F9620665CEA14CDED542876"
        },
        {
          uid: "4718560062",
          password: "1B7455CCC64E95FF77FAAD39A09AD641DE2512C8D22407C6C5CAD3E3E1BF6BE4"
        },
        {
          uid: "4718560236",
          password: "8B35451D1249AD1AD7ECDFC0286CCF7E91334D8D63F436444D1DCE1A37925120"
        },
        {
          uid: "4718560437",
          password: "ABEB05A0C1B1D3F5F88E738F7A10B5FD2EC3F4491B7AA7EB1D658BACE3865914"
        },
        {
          uid: "4718560608",
          password: "7E83899D3233A281D344EB139A0A3377D0A3501E6EB5A9135624CD386439126B"
        },
        {
          uid: "4718560784",
          password: "F7B8B1136AA2C1BFAF49AD2A21BCDBF30A19CFCB5EE32F137420127BB454EF64"
        },
        {
          uid: "4718560956",
          password: "0F5EA84120A02BD519F317381570F01429B01C42A54C6AEE7110CC5456F76808"
        },
        {
          uid: "4718561114",
          password: "10EB6A620B0332E549E6767FE815F2AA40F7485A4A7553A935FA0670F82D5342"
        },
        {
          uid: "4718561270",
          password: "EDE4F4BE2815A929155BC0BB4B419AA3CC47FC5460F12B86AA8CBF4B8E6327EE"
        },
        {
          uid: "4718561425",
          password: "78FAAB24AAE53722574A0268B563EF67E6DAD41CE464155FF7ECD473E48D9D54"
        },
        {
          uid: "4718561577",
          password: "0D889934632CB14B74AA7AA417506ACD17FB3CF8451A4683CDDE88C29F77B3C2"
        },
        {
          uid: "4718561810",
          password: "FD60D4F013BB52FB81E69FF5FB83DFB93B5A697C99929B2420EB1677D957F6EB"
        },
        {
          uid: "4718561995",
          password: "E81E72CA7E822F73B82F3AEAFADA0A116D61A4477B22CD109C07AF8D91BFD0B6"
        },
        {
          uid: "4718562181",
          password: "DC6EE7B73D9A15C0E242738F6BB389E7751357FC10762C795EB41EE3E5C0F0B0"
        },
        {
          uid: "4718562339",
          password: "88A5A4A8B83C02FE2F3CDB88F60FE24B1CF68074AAD07373BA5C144CB59599F1"
        },
        {
          uid: "4718562505",
          password: "A60371E43B7C3FAA1995C2414C7C5021B2B26D2F37D4169F447419B25E348BD6"
        },
        {
          uid: "4718562666",
          password: "00D553E072F4D35A37447A659C7E844814BD2759D329C3EFB962458B5501ED2F"
        },
        {
          uid: "4718562845",
          password: "110EFF81D375BBB95CDDCAAF944ECBA0FE081387555D73A8C2548A60CE501A8B"
        },
        {
          uid: "4718563025",
          password: "5BE82809FE37B03AB1107143F486B10D72326B35B72D6D92561EF20D69C121EA"
        },
        {
          uid: "4718563171",
          password: "136059ACDE819541403A31C0BACEF6041AA804D7C5B66150E8F9B1A22DF6ACF8"
        },
        {
          uid: "4718563314",
          password: "AD63A32548B17831B3A78C0659BAF5A6A0CB027DED61218B1AB09BB9DFEFEAA2"
        },
        {
          uid: "4718563552",
          password: "6388D6B66AADCB56A870F9A6F8E52AE05F591F4D44A193B14CD35FB7BF21AF3F"
        },
        {
          uid: "4718563734",
          password: "C63AD7040A28188242E8AD0682B67390EB67A74097899E20051E2ABD40C54D36"
        },
        {
          uid: "4718563906",
          password: "8FD27AB9572E573E691DC890D31891EEC7AB6A14845CAF8E5900B5678F70F8C2"
        },
        {
          uid: "4718564095",
          password: "4EA8C5D9E84E6D2EA23A3BDE86DA380FD51F24B498C2FA11C9E874F772BEE2BB"
        },
        {
          uid: "4718564293",
          password: "58D2886D17C7DF26FA0D706EBF667B165722194B63BFF30E3D1709B788D14665"
        },
        {
          uid: "4718564504",
          password: "A298C85D83CB46A1E322E87924D86DF1128CB9F5C7B6F5875D46AB9AA7C0B7EA"
        },
        {
          uid: "4718564686",
          password: "429A7CF6D985EEFD2E82FCA9F26250177C57B241111323432027B2546934D293"
        },
        {
          uid: "4718564865",
          password: "817C050301598D45CE35FEA621C90B3F5D5E70CDE3244EC8D8BBC1C2869697E8"
        },
        {
          uid: "4718565069",
          password: "4D9FBE95B04C860406AC47CD2880421325AD96135089A509CEEBD623B306CBC8"
        }
      ],
      RU: [
        {
          uid: "4718583914",
          password: "E7C86185363FE41E9CB42E0D0368E36A941C427C49110D40F004AD5A00C2FB4B"
        },
        {
          uid: "4718584057",
          password: "8B7FA54A934D5B44BD6E27186534F6496260FE6BF9761E3453CEAB85865A86D3"
        },
        {
          uid: "4718584195",
          password: "A7C0F7F96D64DA0F08692E04E2FF23F286B51E25D82D5C126896E90AE160D5BD"
        },
        {
          uid: "4718584338",
          password: "5E4728C7154D38BEF559D460A57199EF37C171C028CAC6E20C7E594D851B08DB"
        },
        {
          uid: "4718584492",
          password: "B816812B2A54DA396CE263E87073AE439ECFD3553247362BB47251563646E498"
        },
        {
          uid: "4718584635",
          password: "537098BE301523FE20ACE01CF838EF0EF123E1282DEC320EEA4229DCFBFD7C8C"
        },
        {
          uid: "4718584765",
          password: "A5DC0C69E090A1ABD669F985EF4AAC95C26F4971AB48DC1C6150518173C4A4A2"
        },
        {
          uid: "4718584949",
          password: "9E32ABBE5F7AD91B8E0F52F0EEAA5F413D871A481239D189E6FD34F6A303AF50"
        },
        {
          uid: "4718585116",
          password: "2CF9DC492508149E08532677EDE1A11EC3ACDE44F9EFE709F0AF047EC5E55FDB"
        },
        {
          uid: "4718585282",
          password: "A4493A943E6F764F29539D38D7E80F5F190DC7A29E54129537C5CEFDB0DECEB4"
        },
        {
          uid: "4718585414",
          password: "255C83172D3B0065FA8A77EE7EED59069F10C774AE7D3F7FFCDA1D2EBC5F9C07"
        },
        {
          uid: "4718585614",
          password: "2B4BE5F44C14067687FD7154D11B4B42BBA2A49DB4AD61832248692AB9EC351A"
        },
        {
          uid: "4718585758",
          password: "E8D4B16F2B7EB0709097BF17927BD4A81B9262CE7EF69B625AF7C13E8A56FE63"
        },
        {
          uid: "4718585896",
          password: "76966E584E735D482DB222129D9D26E80E0618D3CEFD5FB2B9B7962EFD7CD2A8"
        },
        {
          uid: "4718586069",
          password: "751C561455E214F0FF3B56423D9DCF43D8B635CA10187B300D21EAFFFB1EA032"
        },
        {
          uid: "4718586217",
          password: "A7556687E161862DCEE6D8CC20F5EC29993E353D6258B2515E8B3E533ACB19B9"
        },
        {
          uid: "4718586328",
          password: "21EC651F7A4F0E6DEBA42E36E0DDAD6AAB8D886DE4EE415CC82D05AF806945B1"
        },
        {
          uid: "4718586501",
          password: "E3E4ADCCA4324117B3160CD918FD3CF3AC272E9B3FE3068ADDB64A6A8707C26F"
        },
        {
          uid: "4718586725",
          password: "2197187C1BFAEF3E719E303DCA540028F705FB292D438EB7FE338B7ADAC83279"
        },
        {
          uid: "4718586906",
          password: "CA7BD45B2BA590195F329016176C42106866EBFC0F195C02EDB4EA93666A7C65"
        },
        {
          uid: "4718587064",
          password: "D11701CA44C1E1E9ABD1170A4797DEE28E4ACDC9BB843584C5E6800E0DF0FDBF"
        },
        {
          uid: "4718587204",
          password: "1E1BFB7DB34649311F124B907C36919B65387BE4E594F17A1FF2A39D69372776"
        },
        {
          uid: "4718587338",
          password: "767D8D12DF2733D32EA9C5E5BC49FAD91D7D70242F83542A6C68543FD614BFF9"
        },
        {
          uid: "4718587487",
          password: "CEE80E48B08B0DAC2EF7D0190C69511BEDA342D468CCC52CDAA8D828B7F92F3A"
        },
        {
          uid: "4718587638",
          password: "858413DE39262DAE28C0B28D7E532BEA8FF7539A15BB3DE68E679695B42267B5"
        },
        {
          uid: "4718587783",
          password: "80E948C178A7A4B57BA123C6E9B96686092FA5EAF65CC8DC4C2242815B35B03E"
        },
        {
          uid: "4718587943",
          password: "802F06BDE52F1BFCE64FE71EDB016DEB16EF35E06A1A961DC9EDFC641A5586D5"
        },
        {
          uid: "4718588130",
          password: "9DAAE6784B5D7AAF9DA937021A32E08A02E0C6F448B2BB82ADB77B2070772D3E"
        },
        {
          uid: "4718588360",
          password: "F331832A6769431A8F0C158A3D75F68BFE10F2DB18EF70464B66669636E1FB3D"
        },
        {
          uid: "4718588555",
          password: "998DDB8FAA8A1A34D7B3ED882AA7F3AE5CC3E68DA330077DA9686B848EA86486"
        },
        {
          uid: "4718588693",
          password: "715BF1ED7FFB14CAF34575AD2AA0024F1F1023AE0943014F16D18584F144D6F1"
        },
        {
          uid: "4718588855",
          password: "FFF4071CB4A2EAA0745E79968800E92961810F0B7A6B7B43BA7AAB0CD8E103B0"
        },
        {
          uid: "4718589012",
          password: "C6753B8F9AB0E349EF41DC21D6AFFA75D069591E7B4BADBD2A6EA95AC24A8DAD"
        },
        {
          uid: "4718589168",
          password: "1D1179243660597037726B776F8647AD777AFA1FCBD7A2855D9A6A233D53A96F"
        },
        {
          uid: "4718589304",
          password: "171856E1581EB6047620535BF7B411229EBACD0B3C9E2CCCC35ADE0D757D8C55"
        },
        {
          uid: "4718589473",
          password: "230A3022E01474A6BEC623BD7C1BAE5516EF67068313B9831508CD60040629F6"
        },
        {
          uid: "4718589607",
          password: "B0D73F25BD592C29E9F57C22E7803EDCB8F0C9E88B99EF9ED0087D5586F9E8C0"
        },
        {
          uid: "4718589740",
          password: "67A0F7550482CDC785CC3FA56F483BB27BFC8477D172606F5B1A37B89F15B144"
        },
        {
          uid: "4718589886",
          password: "CA098EC0A2B4FC938E2BDDAED3206C93A1084AF0E782CE1BD2F6E14E50C34E99"
        },
        {
          uid: "4718590096",
          password: "CC5125DE51FD2F8A25CD31D599BB8167AAF35A883C03FD09E1B4CE600950124F"
        },
        {
          uid: "4718590260",
          password: "D77A6FB1332FD2FC70A314D84293EAE3C5B8AC1E64443EA588DE7E12C1112EFA"
        },
        {
          uid: "4718590393",
          password: "D57E9BF57096AE108471E1171F602F996DEF6BBB4B90C80178E232F398338963"
        }
      ],
      SG: [
        {
          uid: "4718565476",
          password: "CF5A1FA4FF5E6F91AEDBF3367CED649268E27E937A246DA9652D2E98577D5208"
        },
        {
          uid: "4718565664",
          password: "64ADA113C9EF2CCD604B2C3536CC4CAADB6254140B6F87167B1F1648C0BE21A1"
        },
        {
          uid: "4718565833",
          password: "5AA871EEEB403FB8FA6FBCD2423696D38818CFA22D2E57EE45F43540E70BB33C"
        },
        {
          uid: "4718566059",
          password: "A4DA53478A1BBA4D3746B8D71084532A431D8E144CA52B7DD6001C70A8272D52"
        },
        {
          uid: "4718566274",
          password: "7DF6B9A1200382142D18BA69BDE34277DBB7E9B3F6EA2FC52B374AF94675045C"
        },
        {
          uid: "4718566451",
          password: "7C4A5C6453999A51AA0D35C9C76456C647C8E0FADD5CB04E339FD03FEB39AC95"
        },
        {
          uid: "4718566643",
          password: "F59B26384E2AD801AFD0D40190E7E46189B2DABF50929D04FCBEEBD1C3828CC1"
        },
        {
          uid: "4718566865",
          password: "BE03149F5D2D7F6ADD07A9190A2AD50788A3E1716A7FC4340B0EF0B2A16478CD"
        },
        {
          uid: "4718567085",
          password: "F0E2F07E45E2D7ABC19569A05ED9FAC909AB34F13973C7DA39113785B0597038"
        },
        {
          uid: "4718567270",
          password: "BF0D1EBEC114DE115571F36E153DC684EDE61CC76D110936392A64F982951B95"
        },
        {
          uid: "4718567407",
          password: "3CFBC7A60008EFE25C96A86E54AFD95855555E3E275F318FB5C95D50CAABA391"
        },
        {
          uid: "4718567594",
          password: "C1351D9489064E949DC159D22FE3490805A56A678E1C820919DFDC0A40D78127"
        },
        {
          uid: "4718567745",
          password: "2C1122B039ACEDB54D8D241D79DE6C5A1AC4E9BE06D7EF7E5E8C16B727BBFDFC"
        },
        {
          uid: "4718567908",
          password: "57E5A23A1C01A250CF2CA7A3B067D8091345C7A4C6B5AD0B1D05A2D490AB86ED"
        },
        {
          uid: "4718568040",
          password: "F8921D7B10D2B706B0923D45BD579C9618040E0BF82AC972D88F0767084307A7"
        },
        {
          uid: "4718568166",
          password: "5A68F4E193E169C622CBF31BA9B3811083820C2E091DCB1F9EB8F302EF8B8BBA"
        },
        {
          uid: "4718568305",
          password: "DDECBC4D48C1571A983F730B94180F116F998C1CD7E82BCAAD032465DB3788C3"
        },
        {
          uid: "4718568449",
          password: "6A2D36B120E3E078671946C5DCE89E942244507F82F98D4D9072263613CE83E9"
        },
        {
          uid: "4718568643",
          password: "125B4B682C36A6C40D7317B93EAE4FAEBAFC15E15EB130D6484CC9641EF22274"
        },
        {
          uid: "4718568830",
          password: "6A940B04448444DD41FD96C3424EDB67DCC24E2A1CDBF0F74C13D59087F181E5"
        },
        {
          uid: "4718568967",
          password: "E7A7AC2BC3D7701CD4A55DE1F66B4A9A78CA2C559BD8129FAFE71BC579B94735"
        },
        {
          uid: "4718569096",
          password: "6B9D477ADF044CA008EA0A1F2098AEAD6D5ED66110277EDDBC4EA43FCD1C86FF"
        },
        {
          uid: "4718569253",
          password: "AB2084EF45DE9C6DA3840A35155586C375AFD39CBB4E0E05225D553DACA0C9DB"
        },
        {
          uid: "4718569400",
          password: "ECAC3119CE7DFB8EAD90427010D618E0746DEAEA9F478ABA91C451EBB0FF6D96"
        },
        {
          uid: "4718569546",
          password: "5D8AC86FF5E495006825D2E66C280D40C5321BEFA40626DDF84C9E5C20EFCB1B"
        },
        {
          uid: "4718569675",
          password: "96F1B0781B7D0A34B4449E82ACCFBE32CFD2FCC4F96A0960913E5F1DEDC3515A"
        },
        {
          uid: "4718569825",
          password: "F5C6B7421649399998D98DF4CAE53E9D7CDF2E015B36BDED1CFB6668B605897F"
        },
        {
          uid: "4718569971",
          password: "9D8BDBDB8480B9CABA4DA56F9AECAC61D238AB0D909AF0121F384EA39EB370B2"
        },
        {
          uid: "4718570097",
          password: "1D24030FBBEA44FED059577FAAFAB0BF648E445F7E8C47DB4A579CD6B1E4D4FD"
        },
        {
          uid: "4718570278",
          password: "12C0593DF2F08E1B3ACF1A26F4982B6E7DDEFADC815B84D1C97716D0D09FCB98"
        },
        {
          uid: "4718570424",
          password: "880E4DD56C1D8B3DFBC4050446323558203DA753194462C6D4117EEE52EE3C09"
        },
        {
          uid: "4718570566",
          password: "8C9D8DC484669CC71268E63E2923968731667C150CF43C6C0D5D391C8BC3FA35"
        },
        {
          uid: "4718570712",
          password: "DEAA2A9BAD80F4434FCC3CD93FF3C5A4AC4352F8BC6B20236D2F1636DB49CE03"
        },
        {
          uid: "4718570863",
          password: "D0BBB8E9DF61AAD70A7DC61FB588E433C212D86625ADEEE4264DA239B19E4EDC"
        },
        {
          uid: "4718571007",
          password: "DD7C2800F39E30E7448A2C3A6B51DC1209B19C437B39FE4EAE0E22130D48F4E6"
        },
        {
          uid: "4718571122",
          password: "C18DED0D245EE77B835CEBC31E4680FF94DAA56F09C339A6527F8D482B15DC0A"
        },
        {
          uid: "4718571259",
          password: "5F16052267F745A27F02D4334EB5E45013474842744D7B6106979B097026455F"
        },
        {
          uid: "4718571425",
          password: "F72192959251EB429285FF01E48E4E3042C68B2B0D9CCE4BEB5D95CF46F4B05F"
        },
        {
          uid: "4718571595",
          password: "DF1DACD97D6FE0A1E23124172DC2DCA53EB12EA23C85550E8DBC118763D1FD02"
        },
        {
          uid: "4718571781",
          password: "82D27D5B1C7B50E7F4781CF5F1C6FDA01821FF11EBCBA9A991C7DE7EAA2A4743"
        },
        {
          uid: "4718571969",
          password: "D01F686AC1C31AA1DFABE1E73734648732DCCC30AC2D588260131D0B63C9CA98"
        },
        {
          uid: "4718572176",
          password: "6FABA7E9C8D394CA150E49398C0CB9CE869C8B835B7899FD8B8EE3111E0C734C"
        },
        {
          uid: "4718572343",
          password: "C25C74EBCCE678397A294D8350F22ABC2ECB53157B2FD47C39E3B575B6FA74E7"
        },
        {
          uid: "4718572486",
          password: "554C5CC1DC33D28D7682703106E6D959A6AB986BC91A67FBD8AF99933168EEDF"
        },
        {
          uid: "4718572610",
          password: "0B5BF56EFBBEE912CA4959E0AFBE7D120E2154BB8450A707192248AA231315B6"
        },
        {
          uid: "4718572776",
          password: "E9EB8B60D33E75BC0B0520EA7FBDA876178D194FEC465268D671BD1537770819"
        },
        {
          uid: "4718572947",
          password: "BF6EB2D019F58E6941BEE5821B5ACD4B9B874D809F4DB7D2838730591FDE2300"
        },
        {
          uid: "4718573074",
          password: "E19CA0053641132B174CDDE08F8ADC5B6BEBFA66A2DA17427CEF534C6589AC76"
        },
        {
          uid: "4718573212",
          password: "9928FAE14E91BA58AA76B42F4D4AE4AD636F58ABF1BD2CAA52E1F710D5C9D502"
        },
        {
          uid: "4718573403",
          password: "8D10D6BBEBA5F9FECC64D062A26874A1AE949F3B62C8EAF9202548FAB8E90B5B"
        },
        {
          uid: "4718573590",
          password: "7DC099B375C1D866FEF6AB67A2869845ED558D3371404F71B22A5736B481E481"
        },
        {
          uid: "4718573769",
          password: "FB594958CC4771BA350A5946656AC836B225E5A5A87AFA9293A43403811B0172"
        },
        {
          uid: "4718573997",
          password: "DF3EA097911483B05B92B860C9880FA1E72822F9D7D570CA4FFFEDDE90CFFFA9"
        },
        {
          uid: "4718574278",
          password: "419AD6BF8F6A196E4B5CB9DFD416B174038B71023C35D3D2C850C2860DD7EC6D"
        },
        {
          uid: "4718574456",
          password: "B79CD4C7D8507E9856EA93EC475DEFDB40B732FB6B44AD5DE818BD349793D5AA"
        },
        {
          uid: "4718574628",
          password: "09BE85C9ABEF13F9CE605D0292136F00F13FC51DDFE9050677C017EFED561A5A"
        },
        {
          uid: "4718574819",
          password: "3957831A225C2EAED397BB50B9D9FBF1D1AC7B36BC5871D9310011DF1A4C2B91"
        },
        {
          uid: "4718575023",
          password: "A66B52399CB938A181946DD1C042CB371199CE6A338B173B397FF1F2C61349A0"
        },
        {
          uid: "4718575236",
          password: "1DCD07EE9C75262D03B6E76B4FED2A715E0F197B5085BF1554355A3EB2B2C69E"
        },
        {
          uid: "4718575420",
          password: "8FE559597EFA7B2C03CCA5E5FA491A0C2F5836BCE3DF640E52FDA0B73047724C"
        },
        {
          uid: "4718575604",
          password: "C3C5C058D054FD8A6F97A92DF466B1315AB98DF2566471E94343A53181EB2060"
        },
        {
          uid: "4718575734",
          password: "46CB00E77B9712875752D21A91C81D124B0E4DE527DA556A7013CB62C81DBB69"
        },
        {
          uid: "4718575893",
          password: "A86B8A9A0E76616D93EE93924653097BF0B0A3743A854EAE6613B55EE3A49FD6"
        },
        {
          uid: "4718576058",
          password: "DD43C0DEFEC54BB63D9618F340AB1BD1D36A1F711DB814D228377558F55D70B2"
        },
        {
          uid: "4718576206",
          password: "F3BB39E108114612C8F14443009E11AD8213B22EC78ECEB2C9760641516D0CB4"
        },
        {
          uid: "4718576341",
          password: "0C6E3FF471CA26D3D48EB3E80EC2A4FA418E1D15D65BF4C09F4552B9E4E71515"
        },
        {
          uid: "4718576493",
          password: "4553A740208196DAA773135E1758F27FF850A2C647EEE7DF2BEF62669A04ED2F"
        },
        {
          uid: "4718576716",
          password: "5119D8CE9DBF5CBC6D274F30B4752EA550812C922CE887FE5D873F2857CBC54C"
        },
        {
          uid: "4718576909",
          password: "22CE2AB7420999C983DA0AD281EBC3CB094844AFD16353E4901373F971556F09"
        },
        {
          uid: "4718577067",
          password: "A66A304BA0180BAD4BC42E863C8E3ABEC641D1888617D07DD854A2DE214D60A0"
        },
        {
          uid: "4718577233",
          password: "51FB9D04CDF456D1D819FB23201F8A5B8BDB76FB5B6040673D18E1977B2F18CA"
        },
        {
          uid: "4718577387",
          password: "8BFF4103CD1BDD22145986841C5A25BF0E6799736D9E0686B3C8CF13BB3A7CFD"
        },
        {
          uid: "4718577556",
          password: "92A485E2FC9603CD18560E277913E1CE7B70222A0320E1646FC9E7A9F042748D"
        },
        {
          uid: "4718577729",
          password: "BD95A7CC24FEC3A0D299C2913CDC4C42B3C04256BAF751FA139DEF196979B9CA"
        },
        {
          uid: "4718577878",
          password: "4AFAC525696F3F6D754D08C613FC207511DE49C0038276C74E3ABB87DA1604DE"
        },
        {
          uid: "4718578018",
          password: "C7756C5B93AFD1D2B53DC9C22F8B56D51C8D70B0F0E2584D8FC78029EB241DFC"
        },
        {
          uid: "4718578170",
          password: "AC32A3B4578287854057BFE5D490E3A51BA4C5D470A226EC6E63CBC654AECECB"
        },
        {
          uid: "4718578370",
          password: "BD6479501E47A61B340C4E585B061A20D55EAA558BF1DD59CCF1E4E4FB8237B9"
        },
        {
          uid: "4718578571",
          password: "33CFD2E64A671CE958F0A82CBA1670322FAB2F0E9073596A4CC6CEAC0F648D72"
        },
        {
          uid: "4718578754",
          password: "E80EDC7D92543102C1273361837764B4A76B2F3DA90986F0830B93AEC226259B"
        },
        {
          uid: "4718578920",
          password: "1399A11DCBD3355B09B38ACFAF84DA7301260C42E2E4CEF40B136AA8144D43D4"
        },
        {
          uid: "4718579099",
          password: "91A19BB7BFC4E0F6FAFDC8BCF94E7B0E4CD1FC9AB163405F32AAE571D48532FB"
        },
        {
          uid: "4718579334",
          password: "F88A25B96519C77FE362EABEAA9A322E41F1ABE327FF7E7C0F99D26EEA163AA1"
        },
        {
          uid: "4718579488",
          password: "0E5F24F7AB2A93E200D9EB28799F25FCBA1491F68A27FCD38696ED5E3DA8D579"
        },
        {
          uid: "4718579634",
          password: "DEB3ECE1A701AA38785FE23D79D5CFB867B72142CA4DF10CC7F686F0CAC34638"
        },
        {
          uid: "4718579794",
          password: "58301FC6B7C89FF5D35628F26E5074743F0C55D54CBCAC1D3263E6848476BE2B"
        },
        {
          uid: "4718579953",
          password: "75FFA63C23863E1C5DA03AB4646DD9D861770301DAED739AE5374F89BE5E0E3D"
        },
        {
          uid: "4718580184",
          password: "E724BCD7B7120E25B8AC9EC56A104807FDFE63DFA812AA0708A93A792F51D105"
        },
        {
          uid: "4718580341",
          password: "170DD05EF773311B19CECE3D1FC50FBD56D654EC31434B944F78ACF490EBB866"
        },
        {
          uid: "4718580494",
          password: "ED4A794B592686FB2161DDACB75148202445895B949053B7A3119DA1804379A7"
        },
        {
          uid: "4718580679",
          password: "16C580522BA5D28C4041708FDE1600CFC37A52EFC5EEEC8900C75BE77E8DBC19"
        },
        {
          uid: "4718580845",
          password: "5D8843533787B4AA74BDDEEA42DFEDEA2649A329EB71288B330BF9172BEE2ADE"
        },
        {
          uid: "4718581026",
          password: "B14EB8E5E030BA3B9B89CD258595095839F21C450777D66034E4EA3782E69A8D"
        },
        {
          uid: "4718581169",
          password: "63E8971420CEB9EB5CC601F9C5BDF7D732AAA575B6D02EBA110A94E1D613C866"
        },
        {
          uid: "4718581318",
          password: "67596ECE83F2D332B1A67BE717AED5917399DA7D15F8FD7BC245C7F29B43FF43"
        },
        {
          uid: "4718581462",
          password: "50992A25E6AF66C0B8B38945B756623E3EC356025A778CFCB819E7915026BCBA"
        },
        {
          uid: "4718581594",
          password: "AA857E0B21B6768D483221763A08097175541316A3733C32A29F26A21C77A8B4"
        },
        {
          uid: "4718581802",
          password: "B7652A8FEBA8A0A9C23CDF50BE63F080B281188C1BBB2B47FC0CA0C5A3DFFBA7"
        },
        {
          uid: "4718581948",
          password: "55515B4621D438F70ACF58D5CBB14BF1C88BB7ACE9954FE3DBDDF84CA9B90B64"
        },
        {
          uid: "4718582102",
          password: "2B256D1BDD8BE705D54548BC0D9F8C200444A943EFC72EE1DE940E4226614FA2"
        },
        {
          uid: "4718582266",
          password: "21CBD58F2D2367AE6F7498715F15731EA811F8C2C51B638475D7543F9E492F35"
        },
        {
          uid: "4718582408",
          password: "BE336BA22797CDC9CCF298781131B7676FECE36B976D18DAC63F26EEE1B050D1"
        },
        {
          uid: "4718582552",
          password: "06F91DEF7D3092743B99F3E38F92BB2546BE078EE732437C795673EF92EC3477"
        },
        {
          uid: "4718582674",
          password: "DFDD12119990828F96924B25097BB12B451CD9C98215F62FB0EB7F0CA94F421E"
        },
        {
          uid: "4718582809",
          password: "CD80B7074C0EA73486033A78A3DD707218E3DDD4F254DC489055DC962A92068A"
        },
        {
          uid: "4718582973",
          password: "8D2E3B7DF6CA1A8EB30FE053A4FED511CE04230FA167926E64DD1CED06091146"
        },
        {
          uid: "4718583114",
          password: "66DE6F8E19A79C7D21ED151EA10775ED4BE793F75D3DCD27C72E339BD2F55088"
        },
        {
          uid: "4718583252",
          password: "827B7E0FA42ADB893F0912911B1E940DE8B1289EC677B0AE49EBF465981E09E4"
        },
        {
          uid: "4718583453",
          password: "FBAECE895D6DA8284FB72976B4C49C9F4E9D6B5DDAFC23BD7C7A2A73487D63B9"
        },
        {
          uid: "4718583611",
          password: "5429C02DEB29AA8788E85C40C13C1AC062ACFAAD65FB2729F8C1C85FA24819D0"
        }
      ]
    };
  }
});

// src/embedded-data/index.ts
var protoDescriptors, embeddedSettings, embeddedCredentials;
var init_embedded_data = __esm({
  "src/embedded-data/index.ts"() {
    "use strict";
    init_MajorLogin();
    init_MajorRegister();
    init_PlayerCSStats();
    init_PlayerPersonalShow();
    init_PlayerStats();
    init_SearchAccountByName();
    init_SetPlayerGalleryShowInfo();
    init_settings();
    init_credentials();
    protoDescriptors = {
      "MajorLogin.proto": MajorLogin_default,
      "MajorRegister.proto": MajorRegister_default,
      "PlayerCSStats.proto": PlayerCSStats_default,
      "PlayerPersonalShow.proto": PlayerPersonalShow_default,
      "PlayerStats.proto": PlayerStats_default,
      "SearchAccountByName.proto": SearchAccountByName_default,
      "SetPlayerGalleryShowInfo.proto": SetPlayerGalleryShowInfo_default
    };
    embeddedSettings = settings_default;
    embeddedCredentials = credentials_default;
  }
});

// src/lib/constants.ts
function readConfigValue(config, key, fallback) {
  const value = config[key];
  if (value === void 0 || value === null || value === "") {
    if (fallback !== void 0) return fallback;
    throw new Error(`Missing required setting in config/settings.yaml: ${key}`);
  }
  return String(value);
}
function requireConfigValue(config, key) {
  return readConfigValue(config, key);
}
function loadSettings() {
  const parsed = embeddedSettings;
  return {
    AE: {
      MAIN_KEY: Buffer.from(requireConfigValue(parsed, "AE_MAIN_KEY"), "binary"),
      MAIN_IV: Buffer.from(requireConfigValue(parsed, "AE_MAIN_IV"), "binary")
    },
    HEADERS: {
      COMMON: {
        "User-Agent": requireConfigValue(parsed, "HEADERS_COMMON_USER_AGENT"),
        "Connection": requireConfigValue(parsed, "HEADERS_COMMON_CONNECTION"),
        "Accept-Encoding": requireConfigValue(parsed, "HEADERS_COMMON_ACCEPT_ENCODING"),
        "Expect": requireConfigValue(parsed, "HEADERS_COMMON_EXPECT"),
        "X-Unity-Version": requireConfigValue(parsed, "HEADERS_COMMON_X_UNITY_VERSION"),
        "X-GA": requireConfigValue(parsed, "HEADERS_COMMON_X_GA"),
        "ReleaseVersion": requireConfigValue(parsed, "HEADERS_COMMON_RELEASE_VERSION"),
        "Content-Type": requireConfigValue(parsed, "HEADERS_COMMON_CONTENT_TYPE")
      },
      GARENA_AUTH: {
        "User-Agent": requireConfigValue(parsed, "HEADERS_GARENA_AUTH_USER_AGENT"),
        "Connection": requireConfigValue(parsed, "HEADERS_GARENA_AUTH_CONNECTION"),
        "Accept-Encoding": requireConfigValue(parsed, "HEADERS_GARENA_AUTH_ACCEPT_ENCODING")
      }
    },
    URLS: {
      GARENA_TOKEN: requireConfigValue(parsed, "URL_GARENA_TOKEN"),
      GUEST_REGISTER: requireConfigValue(parsed, "URL_GUEST_REGISTER"),
      MAJOR_LOGIN: requireConfigValue(parsed, "URL_MAJOR_LOGIN"),
      MAJOR_REGISTER: requireConfigValue(parsed, "URL_MAJOR_REGISTER"),
      SEARCH: (serverUrl) => `${serverUrl}${requireConfigValue(parsed, "URL_PATH_SEARCH")}`,
      PERSONAL_SHOW: (serverUrl) => `${serverUrl}${requireConfigValue(parsed, "URL_PATH_PERSONAL_SHOW")}`,
      PLAYER_STATS: (serverUrl) => `${serverUrl}${requireConfigValue(parsed, "URL_PATH_PLAYER_STATS")}`,
      PLAYER_CS_STATS: (serverUrl) => `${serverUrl}${requireConfigValue(parsed, "URL_PATH_PLAYER_CS_STATS")}`
    },
    GARENA_CLIENT: {
      CLIENT_ID: requireConfigValue(parsed, "GARENA_CLIENT_ID"),
      CLIENT_SECRET: requireConfigValue(parsed, "GARENA_CLIENT_SECRET")
    }
  };
}
function normalizeObVersion(input) {
  if (input === void 0 || input === null) return null;
  const raw = String(input).trim();
  if (!raw) return null;
  const upper = raw.toUpperCase();
  const digits = upper.startsWith("OB") ? upper.slice(2) : upper;
  if (!/^\d+$/.test(digits)) return null;
  return `OB${digits}`;
}
function resolveObVersion(requestOb, instanceOb) {
  const fromRequest = normalizeObVersion(requestOb);
  if (fromRequest) return fromRequest;
  const fromInstance = normalizeObVersion(instanceOb);
  if (fromInstance) return fromInstance;
  const fromEnv = (typeof process !== "undefined" && process.env ? normalizeObVersion(process.env.FF_OB_VERSION) || normalizeObVersion(process.env.FFAPIS_OB_VERSION) || normalizeObVersion(process.env.FFAPIS_OB) : null) || null;
  if (fromEnv) return fromEnv;
  return DEFAULT_OB_VERSION;
}
function getCommonHeaders(obVersion, instanceOb) {
  return {
    ...HEADERS.COMMON,
    ReleaseVersion: resolveObVersion(obVersion, instanceOb)
  };
}
var settings, paths, AE, HEADERS, URLS, GARENA_CLIENT, DEFAULT_OB_VERSION;
var init_constants = __esm({
  "src/lib/constants.ts"() {
    "use strict";
    init_embedded_data();
    settings = loadSettings();
    paths = settings.URLS;
    AE = settings.AE;
    HEADERS = settings.HEADERS;
    URLS = {
      GARENA_TOKEN: paths.GARENA_TOKEN,
      GUEST_REGISTER: paths.GUEST_REGISTER,
      MAJOR_LOGIN: paths.MAJOR_LOGIN,
      MAJOR_REGISTER: paths.MAJOR_REGISTER,
      SEARCH: paths.SEARCH,
      PERSONAL_SHOW: paths.PERSONAL_SHOW,
      PLAYER_STATS: paths.PLAYER_STATS,
      PLAYER_CS_STATS: paths.PLAYER_CS_STATS
    };
    GARENA_CLIENT = settings.GARENA_CLIENT;
    DEFAULT_OB_VERSION = settings.HEADERS.COMMON["ReleaseVersion"];
  }
});

// src/lib/crypto.ts
var crypto_exports = {};
__export(crypto_exports, {
  encrypt: () => encrypt
});
import crypto from "crypto";
function encrypt(buffer) {
  const cipher = crypto.createCipheriv("aes-128-cbc", AE.MAIN_KEY, AE.MAIN_IV);
  return Buffer.concat([cipher.update(buffer), cipher.final()]);
}
var init_crypto = __esm({
  "src/lib/crypto.ts"() {
    init_constants();
  }
});

export {
  __toCommonJS,
  protoDescriptors,
  embeddedCredentials,
  init_embedded_data,
  HEADERS,
  URLS,
  GARENA_CLIENT,
  DEFAULT_OB_VERSION,
  normalizeObVersion,
  resolveObVersion,
  getCommonHeaders,
  init_constants,
  encrypt,
  crypto_exports,
  init_crypto
};
