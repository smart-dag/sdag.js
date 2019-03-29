"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var keyman_1 = __importDefault(require("./keyman"));
var bitcore_lib_1 = __importDefault(require("bitcore-lib"));
var HDPrivateKey = bitcore_lib_1.default.HDPrivateKey;
var ava_1 = __importDefault(require("ava"));
var mnemonic = 'picnic west extend source bag crawl antenna toss display carry desk offer dwarf code art';
var mn2 = 'sea absorb guilt regular retire fire invest urge tone peace enroll asthma';
ava_1.default('tests constants', function (t) {
    var man = new keyman_1.default(mn2);
    // t.true(man.mainPubKey === '0333e58ea4e62a51a5b71b854881bb045f4e1b9bdc58e26f801030d0296a854e43');
    // t.true(man.walletId === '6KhqmvXQKFOPNBvbqQs0XCQ44+el9f2McTA+bui53pc=');
    // t.true(man.mainXpubKey.toString().startsWith('xpub'));
    // t.true(man.mainAddress === 'PE3L5RAB6OJDDHVBNRLRUDDL74B2BIJF');
    t.true(man.mainAddress === '6CW76VRWSSGIVXGVUTWAAEFU23UOZQCT');
});
ava_1.default('signs message', function (t) {
    var man = new keyman_1.default(mnemonic);
    var signed = man.signMessage('hello world');
    t.true(signed === 'h4dRAK3M3bAw+nIYG850ShJopiHH67skURwtaMakY/QTs163csdEC8CkuvKbRcYhD57Y0NIyNQHpu+a4dSpt4g==');
    t.true(man.verifyMessage('hello world', signed));
});
// it('gen address', t => {
//     let man = new Keyman(mnemonic);
//     let address = man.genAddress(0);
//     t.true(address === 'PE3L5RAB6OJDDHVBNRLRUDDL74B2BIJF');
// });
// it('tests sdag mnemonic', t => {
//     let mn = 'own radio spatial train snack share core finger biology lounge remember unfair';
//     let man = new Keyman(mn);
//     t.true(man.mainXpubKey.xpubkey.toString() === 'xpub6CNU9jsnu9NpZPzGWzkJenonVtdA3w9PMr6zPUdCxjNpzJTECcRTdszh4JToVDd6JtSKap9pUPpyKKDZeVhR53Dsfy2ZvGGAPeVSAjYqSaQ');
//     let ga = man.genAddress(0);
//     t.true(ga === '5YJKYU5NFWEUJAO4M2WNR4O3W5Z62ZYO');
//     t.true(man.ecdsaPubkey(0) === 'A+QcVDmsFrNcKrN2a8X1WeRaHUTqAU+JPtbYJhvDQMaZ');
//     let xpriv = Mnemonic(mn).toHDPrivateKey();
//     let root = new HDPrivateKey(xpriv);
//     t.true(root.derive(`m/44'/0'/0'/0`).hdPublicKey.xpubkey.toString() === 'xpub6Eyxw8GKRZdFhUtjiDB97A4usQyekQ52DbbzrPLs62myT6NzoePZQq2adknL5jz8vDBXksc9A3SQM9RB3sZMvqK2VUdkKtyT326JCP2fn2R')
//     let xpriv2 = Mnemonic(mn).toHDPrivateKey();
//     let root2 = new HDPrivateKey(xpriv2);
//     t.true(root2.derive(`m/44'/0'/0'`).hdPublicKey.xpubkey.toString() === 'xpub6CNU9jsnu9NpZPzGWzkJenonVtdA3w9PMr6zPUdCxjNpzJTECcRTdszh4JToVDd6JtSKap9pUPpyKKDZeVhR53Dsfy2ZvGGAPeVSAjYqSaQ')
// });
// it('tests ecdsa pubkey', t => {
//     let man = new Keyman(mnemonic);
//     let pubkey = man.ecdsaPubkey(0);
//     t.true(pubkey === 'A5Lxqw/ylE0HjLE2n08oASLUf5KvI16dQnlAEFjAK1bQ');
// });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5bWFuLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMva2V5bWFuL2tleW1hbi5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0RBQThCO0FBRzlCLDREQUFrQztBQUMxQixJQUFBLGlEQUFZLENBQWE7QUFDakMsNENBQXFCO0FBRXJCLElBQUksUUFBUSxHQUFHLDBGQUEwRixDQUFDO0FBQzFHLElBQUksR0FBRyxHQUFHLDJFQUEyRSxDQUFDO0FBRXRGLGFBQUUsQ0FBQyxpQkFBaUIsRUFBRSxVQUFBLENBQUM7SUFDbkIsSUFBSSxHQUFHLEdBQUcsSUFBSSxnQkFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLG1HQUFtRztJQUNuRywyRUFBMkU7SUFDM0UseURBQXlEO0lBQ3pELGtFQUFrRTtJQUNsRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEtBQUssa0NBQWtDLENBQUMsQ0FBQTtBQUNsRSxDQUFDLENBQUMsQ0FBQztBQUVILGFBQUUsQ0FBQyxlQUFlLEVBQUUsVUFBQSxDQUFDO0lBQ2pCLElBQUksR0FBRyxHQUFHLElBQUksZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvQixJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzVDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLDBGQUEwRixDQUFDLENBQUM7SUFDOUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3JELENBQUMsQ0FBQyxDQUFDO0FBRUgsMkJBQTJCO0FBQzNCLHNDQUFzQztBQUN0Qyx1Q0FBdUM7QUFDdkMsOERBQThEO0FBQzlELE1BQU07QUFFTixtQ0FBbUM7QUFDbkMsaUdBQWlHO0FBQ2pHLGdDQUFnQztBQUNoQyx3S0FBd0s7QUFFeEssa0NBQWtDO0FBRWxDLHlEQUF5RDtBQUN6RCxxRkFBcUY7QUFFckYsaURBQWlEO0FBQ2pELDBDQUEwQztBQUMxQyxnTUFBZ007QUFFaE0sa0RBQWtEO0FBQ2xELDRDQUE0QztBQUM1QywrTEFBK0w7QUFDL0wsTUFBTTtBQUVOLGtDQUFrQztBQUNsQyxzQ0FBc0M7QUFDdEMsdUNBQXVDO0FBQ3ZDLHlFQUF5RTtBQUN6RSxNQUFNIn0=