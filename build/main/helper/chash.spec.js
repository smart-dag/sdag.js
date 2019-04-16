"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chash_1 = __importDefault(require("./chash"));
var hash_1 = __importDefault(require("./hash"));
var bitcore_mnemonic_1 = __importDefault(require("bitcore-mnemonic"));
var bip39_1 = __importDefault(require("bip39"));
var ava_1 = __importDefault(require("ava"));
var mnemonic = 'picnic west extend source bag crawl antenna toss display carry desk offer dwarf code art';
ava_1.default('tests validation', function (t) {
    var key = new bitcore_mnemonic_1.default(mnemonic).toHDPrivateKey();
    var pubkey = key.hdPublicKey.publicKey;
    var base64 = pubkey.toBuffer().toString('base64');
    var address = hash_1.default.getChash160(['sig', {
            "pubkey": base64
        }]);
    t.true(chash_1.default.isChashValid2(address));
});
ava_1.default('generally tests', function (t) {
    for (var i = 0; i < 1; i++) {
        var mn = bip39_1.default.generateMnemonic();
        var key = new bitcore_mnemonic_1.default(mn).toHDPrivateKey();
        var pubkey = key.hdPublicKey.publicKey;
        var base64 = pubkey.toBuffer().toString('base64');
        var addr = hash_1.default.getChash160(['sig', {
                'pubkey': base64
            }]);
        t.true(chash_1.default.isChashValid2(addr));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhc2guc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXIvY2hhc2guc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGtEQUE0QjtBQUM1QixnREFBMEI7QUFFMUIsc0VBQXdDO0FBQ3hDLGdEQUEwQjtBQUMxQiw0Q0FBcUI7QUFFckIsSUFBTSxRQUFRLEdBQUcsMEZBQTBGLENBQUM7QUFFNUcsYUFBRSxDQUFDLGtCQUFrQixFQUFFLFVBQUEsQ0FBQztJQUdwQixJQUFJLEdBQUcsR0FBRyxJQUFJLDBCQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsY0FBYyxFQUFrQixDQUFDO0lBQ2xFLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDO0lBQ3ZDLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFbEQsSUFBSSxPQUFPLEdBQUcsY0FBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssRUFBRTtZQUNuQyxRQUFRLEVBQUUsTUFBTTtTQUNuQixDQUFDLENBQVcsQ0FBQztJQUVkLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLENBQUMsQ0FBQyxDQUFDO0FBRUgsYUFBRSxDQUFDLGlCQUFpQixFQUFFLFVBQUEsQ0FBQztJQUVuQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3hCLElBQUksRUFBRSxHQUFHLGVBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ2xDLElBQUksR0FBRyxHQUFHLElBQUksMEJBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxjQUFjLEVBQWtCLENBQUM7UUFDNUQsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7UUFDdkMsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVsRCxJQUFJLElBQUksR0FBRyxjQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsS0FBSyxFQUFFO2dCQUNoQyxRQUFRLEVBQUUsTUFBTTthQUNuQixDQUFDLENBQUMsQ0FBQztRQUVKLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3JDO0FBQ0wsQ0FBQyxDQUFDLENBQUEifQ==