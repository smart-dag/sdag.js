"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var keyman_1 = __importDefault(require("./keyman"));
var bitcore_mnemonic_1 = __importDefault(require("bitcore-mnemonic"));
var bitcore_lib_1 = __importDefault(require("bitcore-lib"));
var HDPrivateKey = bitcore_lib_1.default.HDPrivateKey;
var ava_1 = __importDefault(require("ava"));
var mnemonic = 'picnic west extend source bag crawl antenna toss display carry desk offer dwarf code art';
var mn2 = 'own radio spatial train snack share core finger biology lounge remember unfair';
ava_1.default('tests constants', function (t) {
    var man = new keyman_1.default(mnemonic);
    t.true(man.mainPubKey === '0333e58ea4e62a51a5b71b854881bb045f4e1b9bdc58e26f801030d0296a854e43');
    t.true(man.walletId === '6KhqmvXQKFOPNBvbqQs0XCQ44+el9f2McTA+bui53pc=');
    t.true(man.mainXpubKey.toString().startsWith('xpub'));
    t.true(man.mainAddress === 'PE3L5RAB6OJDDHVBNRLRUDDL74B2BIJF');
});
ava_1.default('gen address', function (t) {
    var man = new keyman_1.default(mnemonic);
    var address = man.genAddress(0);
    t.true(address === 'PE3L5RAB6OJDDHVBNRLRUDDL74B2BIJF');
});
ava_1.default('tests sdag mnemonic', function (t) {
    var mn = 'own radio spatial train snack share core finger biology lounge remember unfair';
    var man = new keyman_1.default(mn);
    t.true(man.mainXpubKey.xpubkey.toString() === 'xpub6CNU9jsnu9NpZPzGWzkJenonVtdA3w9PMr6zPUdCxjNpzJTECcRTdszh4JToVDd6JtSKap9pUPpyKKDZeVhR53Dsfy2ZvGGAPeVSAjYqSaQ');
    var ga = man.genAddress(0);
    t.true(ga === '5YJKYU5NFWEUJAO4M2WNR4O3W5Z62ZYO');
    t.true(man.ecdsaPubkey(0) === 'A+QcVDmsFrNcKrN2a8X1WeRaHUTqAU+JPtbYJhvDQMaZ');
    var xpriv = bitcore_mnemonic_1.default(mn).toHDPrivateKey();
    var root = new HDPrivateKey(xpriv);
    t.true(root.derive("m/44'/0'/0'/0").hdPublicKey.xpubkey.toString() === 'xpub6Eyxw8GKRZdFhUtjiDB97A4usQyekQ52DbbzrPLs62myT6NzoePZQq2adknL5jz8vDBXksc9A3SQM9RB3sZMvqK2VUdkKtyT326JCP2fn2R');
    var xpriv2 = bitcore_mnemonic_1.default(mn).toHDPrivateKey();
    var root2 = new HDPrivateKey(xpriv2);
    t.true(root2.derive("m/44'/0'/0'").hdPublicKey.xpubkey.toString() === 'xpub6CNU9jsnu9NpZPzGWzkJenonVtdA3w9PMr6zPUdCxjNpzJTECcRTdszh4JToVDd6JtSKap9pUPpyKKDZeVhR53Dsfy2ZvGGAPeVSAjYqSaQ');
});
ava_1.default('tests ecdsa pubkey', function (t) {
    var man = new keyman_1.default(mnemonic);
    var pubkey = man.ecdsaPubkey(0);
    t.true(pubkey === 'A5Lxqw/ylE0HjLE2n08oASLUf5KvI16dQnlAEFjAK1bQ');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5bWFuLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvd2FsbGV0L2tleW1hbi9rZXltYW4uc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLG9EQUE4QjtBQUU5QixzRUFBd0M7QUFDeEMsNERBQWtDO0FBQzFCLElBQUEsaURBQVksQ0FBYTtBQUNqQyw0Q0FBcUI7QUFFckIsSUFBSSxRQUFRLEdBQUcsMEZBQTBGLENBQUM7QUFDMUcsSUFBSSxHQUFHLEdBQUcsZ0ZBQWdGLENBQUM7QUFFM0YsYUFBRSxDQUFDLGlCQUFpQixFQUFFLFVBQUEsQ0FBQztJQUNuQixJQUFJLEdBQUcsR0FBRyxJQUFJLGdCQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxLQUFLLG9FQUFvRSxDQUFDLENBQUM7SUFDaEcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLDhDQUE4QyxDQUFDLENBQUM7SUFDeEUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3RELENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsS0FBSyxrQ0FBa0MsQ0FBQyxDQUFDO0FBQ25FLENBQUMsQ0FBQyxDQUFDO0FBRUgsYUFBRSxDQUFDLGFBQWEsRUFBRSxVQUFBLENBQUM7SUFDZixJQUFJLEdBQUcsR0FBRyxJQUFJLGdCQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDL0IsSUFBSSxPQUFPLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxrQ0FBa0MsQ0FBQyxDQUFDO0FBQzNELENBQUMsQ0FBQyxDQUFDO0FBRUgsYUFBRSxDQUFDLHFCQUFxQixFQUFFLFVBQUEsQ0FBQztJQUN2QixJQUFJLEVBQUUsR0FBRyxnRkFBZ0YsQ0FBQztJQUMxRixJQUFJLEdBQUcsR0FBRyxJQUFJLGdCQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDekIsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxpSEFBaUgsQ0FBQyxDQUFDO0lBRWpLLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFM0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssa0NBQWtDLENBQUMsQ0FBQztJQUNsRCxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssOENBQThDLENBQUMsQ0FBQztJQUU5RSxJQUFJLEtBQUssR0FBRywwQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzFDLElBQUksSUFBSSxHQUFHLElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25DLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLGlIQUFpSCxDQUFDLENBQUE7SUFFekwsSUFBSSxNQUFNLEdBQUcsMEJBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUMzQyxJQUFJLEtBQUssR0FBRyxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxpSEFBaUgsQ0FBQyxDQUFBO0FBQzVMLENBQUMsQ0FBQyxDQUFDO0FBRUgsYUFBRSxDQUFDLG9CQUFvQixFQUFFLFVBQUEsQ0FBQztJQUN0QixJQUFJLEdBQUcsR0FBRyxJQUFJLGdCQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDL0IsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyw4Q0FBOEMsQ0FBQyxDQUFDO0FBQ3RFLENBQUMsQ0FBQyxDQUFDIn0=