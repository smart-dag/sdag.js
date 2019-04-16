import chash from './chash';
import hash from './hash';
import { HDPrivateKey } from 'bitcore-lib';
import Mnemonic from 'bitcore-mnemonic';
import bip39 from 'bip39';
import it from 'ava';

const mnemonic = 'picnic west extend source bag crawl antenna toss display carry desk offer dwarf code art';

it('tests validation', t => {


    let key = new Mnemonic(mnemonic).toHDPrivateKey() as HDPrivateKey;
    let pubkey = key.hdPublicKey.publicKey;
    let base64 = pubkey.toBuffer().toString('base64');

    let address = hash.getChash160(['sig', {
        "pubkey": base64
    }]) as string;

    t.true(chash.isChashValid2(address));
});

it('generally tests', t => {

    for (let i = 0; i < 1; i++) {
        let mn = bip39.generateMnemonic();
        let key = new Mnemonic(mn).toHDPrivateKey() as HDPrivateKey;
        let pubkey = key.hdPublicKey.publicKey;
        let base64 = pubkey.toBuffer().toString('base64');

        let addr = hash.getChash160(['sig', {
            'pubkey': base64
        }]);

        t.true(chash.isChashValid2(addr));
    }
})