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
var mn2 = 'high mention quality unfair sudden shop coach ankle kind broken ski teach';
ava_1.default('tests constants', function (t) {
    var man = new keyman_1.default(mnemonic);
    // t.true(man.mainPubKey === '0333e58ea4e62a51a5b71b854881bb045f4e1b9bdc58e26f801030d0296a854e43');
    // t.true(man.walletId === '6KhqmvXQKFOPNBvbqQs0XCQ44+el9f2McTA+bui53pc=');
    // t.true(man.mainXpubKey.toString().startsWith('xpub'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5bWFuLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMva2V5bWFuL2tleW1hbi5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0RBQThCO0FBRTlCLHNFQUF3QztBQUN4Qyw0REFBa0M7QUFDMUIsSUFBQSxpREFBWSxDQUFhO0FBQ2pDLDRDQUFxQjtBQUVyQixJQUFJLFFBQVEsR0FBRywwRkFBMEYsQ0FBQztBQUMxRyxJQUFJLEdBQUcsR0FBRywyRUFBMkUsQ0FBQztBQUV0RixhQUFFLENBQUMsaUJBQWlCLEVBQUUsVUFBQSxDQUFDO0lBQ25CLElBQUksR0FBRyxHQUFHLElBQUksZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQixtR0FBbUc7SUFDbkcsMkVBQTJFO0lBQzNFLHlEQUF5RDtJQUN6RCxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEtBQUssa0NBQWtDLENBQUMsQ0FBQztBQUNuRSxDQUFDLENBQUMsQ0FBQztBQUVILGFBQUUsQ0FBQyxhQUFhLEVBQUUsVUFBQSxDQUFDO0lBQ2YsSUFBSSxHQUFHLEdBQUcsSUFBSSxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9CLElBQUksT0FBTyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEtBQUssa0NBQWtDLENBQUMsQ0FBQztBQUMzRCxDQUFDLENBQUMsQ0FBQztBQUVILGFBQUUsQ0FBQyxxQkFBcUIsRUFBRSxVQUFBLENBQUM7SUFDdkIsSUFBSSxFQUFFLEdBQUcsZ0ZBQWdGLENBQUM7SUFDMUYsSUFBSSxHQUFHLEdBQUcsSUFBSSxnQkFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3pCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssaUhBQWlILENBQUMsQ0FBQztJQUVqSyxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTNCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLGtDQUFrQyxDQUFDLENBQUM7SUFDbEQsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLDhDQUE4QyxDQUFDLENBQUM7SUFFOUUsSUFBSSxLQUFLLEdBQUcsMEJBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUMxQyxJQUFJLElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxpSEFBaUgsQ0FBQyxDQUFBO0lBRXpMLElBQUksTUFBTSxHQUFHLDBCQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDM0MsSUFBSSxLQUFLLEdBQUcsSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssaUhBQWlILENBQUMsQ0FBQTtBQUM1TCxDQUFDLENBQUMsQ0FBQztBQUVILGFBQUUsQ0FBQyxvQkFBb0IsRUFBRSxVQUFBLENBQUM7SUFDdEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9CLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssOENBQThDLENBQUMsQ0FBQztBQUN0RSxDQUFDLENBQUMsQ0FBQyJ9