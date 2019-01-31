import Keyman from './keyman';
import assert from 'assert';
import Mnemonic from 'bitcore-mnemonic';
import bitcore from 'bitcore-lib';
const { HDPrivateKey } = bitcore;
import it from 'ava';

let mnemonic = 'picnic west extend source bag crawl antenna toss display carry desk offer dwarf code art';
let mn2 = 'own radio spatial train snack share core finger biology lounge remember unfair';

it('tests constants', t => {
    let man = new Keyman(mnemonic);
    t.true(man.mainPubKey === '0333e58ea4e62a51a5b71b854881bb045f4e1b9bdc58e26f801030d0296a854e43');
    t.true(man.walletId === '6KhqmvXQKFOPNBvbqQs0XCQ44+el9f2McTA+bui53pc=');
    t.true(man.mainXpubKey.toString().startsWith('xpub'));
    t.true(man.mainAddress === 'PE3L5RAB6OJDDHVBNRLRUDDL74B2BIJF');
});

it('gen address', t => {
    let man = new Keyman(mnemonic);
    let address = man.genAddress(0);
    t.true(address === 'PE3L5RAB6OJDDHVBNRLRUDDL74B2BIJF');
});

it('tests sdag mnemonic', t => {
    let mn = 'own radio spatial train snack share core finger biology lounge remember unfair';
    let man = new Keyman(mn);
    t.true(man.mainXpubKey.xpubkey.toString() === 'xpub6CNU9jsnu9NpZPzGWzkJenonVtdA3w9PMr6zPUdCxjNpzJTECcRTdszh4JToVDd6JtSKap9pUPpyKKDZeVhR53Dsfy2ZvGGAPeVSAjYqSaQ');

    let ga = man.genAddress(0);

    t.true(ga === '5YJKYU5NFWEUJAO4M2WNR4O3W5Z62ZYO');
    t.true(man.ecdsaPubkey(0) === 'A+QcVDmsFrNcKrN2a8X1WeRaHUTqAU+JPtbYJhvDQMaZ');

    let xpriv = Mnemonic(mn).toHDPrivateKey();
    let root = new HDPrivateKey(xpriv);
    t.true(root.derive(`m/44'/0'/0'/0`).hdPublicKey.xpubkey.toString() === 'xpub6Eyxw8GKRZdFhUtjiDB97A4usQyekQ52DbbzrPLs62myT6NzoePZQq2adknL5jz8vDBXksc9A3SQM9RB3sZMvqK2VUdkKtyT326JCP2fn2R')

    let xpriv2 = Mnemonic(mn).toHDPrivateKey();
    let root2 = new HDPrivateKey(xpriv2);
    t.true(root2.derive(`m/44'/0'/0'`).hdPublicKey.xpubkey.toString() === 'xpub6CNU9jsnu9NpZPzGWzkJenonVtdA3w9PMr6zPUdCxjNpzJTECcRTdszh4JToVDd6JtSKap9pUPpyKKDZeVhR53Dsfy2ZvGGAPeVSAjYqSaQ')
});

it('tests ecdsa pubkey', t => {
    let man = new Keyman(mnemonic);
    let pubkey = man.ecdsaPubkey(0);
    t.true(pubkey === 'A5Lxqw/ylE0HjLE2n08oASLUf5KvI16dQnlAEFjAK1bQ');
});
