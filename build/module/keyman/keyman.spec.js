import Keyman from './keyman';
import bitcore from 'bitcore-lib';
const { HDPrivateKey } = bitcore;
import it from 'ava';
let mnemonic = 'picnic west extend source bag crawl antenna toss display carry desk offer dwarf code art';
let mn2 = 'sea absorb guilt regular retire fire invest urge tone peace enroll asthma';
it('tests constants', t => {
    let man = new Keyman(mn2);
    // t.true(man.mainPubKey === '0333e58ea4e62a51a5b71b854881bb045f4e1b9bdc58e26f801030d0296a854e43');
    // t.true(man.walletId === '6KhqmvXQKFOPNBvbqQs0XCQ44+el9f2McTA+bui53pc=');
    // t.true(man.mainXpubKey.toString().startsWith('xpub'));
    // t.true(man.mainAddress === 'PE3L5RAB6OJDDHVBNRLRUDDL74B2BIJF');
    t.true(man.mainAddress === '6CW76VRWSSGIVXGVUTWAAEFU23UOZQCT');
    t.true(man.validateAddress(man.mainAddress));
});
it('signs message', t => {
    let man = new Keyman(mnemonic);
    let signed = man.signMessage('hello world');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5bWFuLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMva2V5bWFuL2tleW1hbi5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxNQUFNLFVBQVUsQ0FBQztBQUc5QixPQUFPLE9BQU8sTUFBTSxhQUFhLENBQUM7QUFDbEMsTUFBTSxFQUFFLFlBQVksRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUNqQyxPQUFPLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFFckIsSUFBSSxRQUFRLEdBQUcsMEZBQTBGLENBQUM7QUFDMUcsSUFBSSxHQUFHLEdBQUcsMkVBQTJFLENBQUM7QUFFdEYsRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxFQUFFO0lBQ3RCLElBQUksR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLG1HQUFtRztJQUNuRywyRUFBMkU7SUFDM0UseURBQXlEO0lBQ3pELGtFQUFrRTtJQUNsRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEtBQUssa0NBQWtDLENBQUMsQ0FBQztJQUMvRCxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDakQsQ0FBQyxDQUFDLENBQUM7QUFFSCxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxFQUFFO0lBQ3BCLElBQUksR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9CLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDNUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssMEZBQTBGLENBQUMsQ0FBQztJQUM5RyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDckQsQ0FBQyxDQUFDLENBQUM7QUFFSCwyQkFBMkI7QUFDM0Isc0NBQXNDO0FBQ3RDLHVDQUF1QztBQUN2Qyw4REFBOEQ7QUFDOUQsTUFBTTtBQUVOLG1DQUFtQztBQUNuQyxpR0FBaUc7QUFDakcsZ0NBQWdDO0FBQ2hDLHdLQUF3SztBQUV4SyxrQ0FBa0M7QUFFbEMseURBQXlEO0FBQ3pELHFGQUFxRjtBQUVyRixpREFBaUQ7QUFDakQsMENBQTBDO0FBQzFDLGdNQUFnTTtBQUVoTSxrREFBa0Q7QUFDbEQsNENBQTRDO0FBQzVDLCtMQUErTDtBQUMvTCxNQUFNO0FBRU4sa0NBQWtDO0FBQ2xDLHNDQUFzQztBQUN0Qyx1Q0FBdUM7QUFDdkMseUVBQXlFO0FBQ3pFLE1BQU0ifQ==