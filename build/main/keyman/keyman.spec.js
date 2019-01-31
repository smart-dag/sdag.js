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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5bWFuLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMva2V5bWFuL2tleW1hbi5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0RBQThCO0FBRTlCLHNFQUF3QztBQUN4Qyw0REFBa0M7QUFDMUIsSUFBQSxpREFBWSxDQUFhO0FBQ2pDLDRDQUFxQjtBQUVyQixJQUFJLFFBQVEsR0FBRywwRkFBMEYsQ0FBQztBQUMxRyxJQUFJLEdBQUcsR0FBRyxnRkFBZ0YsQ0FBQztBQUUzRixhQUFFLENBQUMsaUJBQWlCLEVBQUUsVUFBQSxDQUFDO0lBQ25CLElBQUksR0FBRyxHQUFHLElBQUksZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEtBQUssb0VBQW9FLENBQUMsQ0FBQztJQUNoRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssOENBQThDLENBQUMsQ0FBQztJQUN4RSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDdEQsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxLQUFLLGtDQUFrQyxDQUFDLENBQUM7QUFDbkUsQ0FBQyxDQUFDLENBQUM7QUFFSCxhQUFFLENBQUMsYUFBYSxFQUFFLFVBQUEsQ0FBQztJQUNmLElBQUksR0FBRyxHQUFHLElBQUksZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQixJQUFJLE9BQU8sR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLGtDQUFrQyxDQUFDLENBQUM7QUFDM0QsQ0FBQyxDQUFDLENBQUM7QUFFSCxhQUFFLENBQUMscUJBQXFCLEVBQUUsVUFBQSxDQUFDO0lBQ3ZCLElBQUksRUFBRSxHQUFHLGdGQUFnRixDQUFDO0lBQzFGLElBQUksR0FBRyxHQUFHLElBQUksZ0JBQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6QixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLGlIQUFpSCxDQUFDLENBQUM7SUFFakssSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUzQixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxrQ0FBa0MsQ0FBQyxDQUFDO0lBQ2xELENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyw4Q0FBOEMsQ0FBQyxDQUFDO0lBRTlFLElBQUksS0FBSyxHQUFHLDBCQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDMUMsSUFBSSxJQUFJLEdBQUcsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssaUhBQWlILENBQUMsQ0FBQTtJQUV6TCxJQUFJLE1BQU0sR0FBRywwQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzNDLElBQUksS0FBSyxHQUFHLElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLGlIQUFpSCxDQUFDLENBQUE7QUFDNUwsQ0FBQyxDQUFDLENBQUM7QUFFSCxhQUFFLENBQUMsb0JBQW9CLEVBQUUsVUFBQSxDQUFDO0lBQ3RCLElBQUksR0FBRyxHQUFHLElBQUksZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQixJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLDhDQUE4QyxDQUFDLENBQUM7QUFDdEUsQ0FBQyxDQUFDLENBQUMifQ==