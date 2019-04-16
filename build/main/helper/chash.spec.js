"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chash_1 = __importDefault(require("./chash"));
var hash_1 = __importDefault(require("./hash"));
var bitcore_mnemonic_1 = __importDefault(require("bitcore-mnemonic"));
var bip39_1 = __importDefault(require("bip39"));
var mnemonic = 'picnic west extend source bag crawl antenna toss display carry desk offer dwarf code art';
console.log(chash_1.default.isChashValid('RMCBQMSNGWCSCO4PIV2CVOM6PU7QIO22'));
console.log(chash_1.default.isChashValid2('RMCBQMSNGWCSCO4PIV2CVOM6PU7QIO22'));
// it('tests validation', t => {
//     let key = new Mnemonic(mnemonic).toHDPrivateKey() as HDPrivateKey;
//     let pubkey = key.hdPublicKey.publicKey;
//     let base64 = pubkey.toBuffer().toString('base64');
//     let address = hash.getChash160(['sig', {
//         "pubkey": base64
//     }]) as string;
//     t.true(chash.isChashValid(address));
// });
// it('generally tests', t => {
// })
for (var i = 0; i < 1; i++) {
    var mn = bip39_1.default.generateMnemonic();
    var key = new bitcore_mnemonic_1.default(mn).toHDPrivateKey();
    var pubkey = key.hdPublicKey.publicKey;
    var base64 = pubkey.toBuffer().toString('base64');
    var addr = hash_1.default.getChash160(['sig', {
            'pubkey': base64
        }]);
    console.log(chash_1.default.isChashValid(addr));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhc2guc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXIvY2hhc2guc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGtEQUE0QjtBQUM1QixnREFBMEI7QUFFMUIsc0VBQXdDO0FBQ3hDLGdEQUEwQjtBQUcxQixJQUFNLFFBQVEsR0FBRywwRkFBMEYsQ0FBQztBQUM1RyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQUssQ0FBQyxZQUFZLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBSyxDQUFDLGFBQWEsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDLENBQUM7QUFFckUsZ0NBQWdDO0FBR2hDLHlFQUF5RTtBQUN6RSw4Q0FBOEM7QUFDOUMseURBQXlEO0FBRXpELCtDQUErQztBQUMvQywyQkFBMkI7QUFDM0IscUJBQXFCO0FBRXJCLDJDQUEyQztBQUMzQyxNQUFNO0FBRU4sK0JBQStCO0FBRS9CLEtBQUs7QUFFTCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3hCLElBQUksRUFBRSxHQUFHLGVBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ2xDLElBQUksR0FBRyxHQUFHLElBQUksMEJBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxjQUFjLEVBQWtCLENBQUM7SUFDNUQsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7SUFDdkMsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUVsRCxJQUFJLElBQUksR0FBRyxjQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQ2hDLFFBQVEsRUFBRSxNQUFNO1NBQ25CLENBQUMsQ0FBQyxDQUFDO0lBRUosT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDekMifQ==