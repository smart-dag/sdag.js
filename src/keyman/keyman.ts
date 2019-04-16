import bip39 from 'bip39';
import mnemonic from 'bitcore-mnemonic';
import { HDPublicKey, HDPrivateKey, PublicKey } from 'bitcore-lib';
import crypto from 'crypto';
import hash from '../helper/hash';
import ecdsa from 'secp256k1';
import chash from '../helper/chash';

export default class Keyman {

    mainXprivKey: HDPrivateKey;
    mainXpubKey: HDPublicKey;
    mainPubKey: string;
    mainEcdsaPubKey: string;
    walletId: string;
    mainAddress: string;

    constructor(mnemonicCode: string, passphrase: string = undefined) {
        if (!bip39.validateMnemonic(mnemonicCode)) {
            throw new Error('invalid mnemnoic code');
        }

        let xpriv = mnemonic(mnemonicCode).toHDPrivateKey(passphrase);

        let path = `m/44'/0'/0'`;
        let root = new HDPrivateKey(xpriv);
        let main = root.derive(path);
        this.mainXprivKey = main;
        this.mainXpubKey = main.hdPublicKey;

        this.mainPubKey = main.hdPublicKey.publicKey.toString();
        this.mainEcdsaPubKey = this.ecdsaPubkey(0);

        // assert.equal(main.privateKey.toString(), main.derive('m/0').privateKey.toString());

        this.walletId = crypto.createHash("sha256").update(this.mainXpubKey.toString(), "utf8").digest("base64").toString();
        this.mainAddress = this.genAddress(0);
        // this.deviceAddress = this.deviceAddress(root); //  hash.getChash160(['sig'], { 'pubkey': root.derive(`m/1'`).hdPublicKey.publicKey.toBuffer().toString('base64') });
    }

    deviceAddress(xPrivKey) {
        try {
            var priv_key = xPrivKey.derive(`m/1'`).privateKey.bn.toBuffer({
                size: 32
            });
            var pub_b64 = ecdsa.publicKeyCreate(priv_key, true).toString('base64');
            var device_address = hash.getDeviceAddress(pub_b64);
            return device_address;
        } catch (error) {
            return "0";
        }
    }

    genAddress(index: number) {
        let pubkey = this.mainXpubKey.derive(`m/0/${index}`).publicKey;
        let base64 = pubkey.toBuffer().toString('base64');
        let address = hash.getChash160(['sig', {
            "pubkey": base64
        }]) as string;

        return address;
    }

    validateAddress(addr: string) {
        return chash.isChashValid2(addr);
    }

    sign(b64_hash: string, index = 0) {
        try {
            let buf_to_sign = Buffer.from(b64_hash, 'base64');
            let xPrivKey = this.mainXprivKey;
            let privateKey = xPrivKey.derive(`m/0/${index}`)['privateKey'];
            let privKeyBuf = privateKey.bn.toBuffer({ size: 32 });

            let res = ecdsa.sign(buf_to_sign, privKeyBuf);
            return res.signature.toString("base64");
        } catch (error) {
            return error.message;
        }
    }

    verify(b64_hash: string, sig: string, pub_key: string) {
        try {
            var buf_to_verify = Buffer.from(b64_hash, "base64");
            var signature = Buffer.from(sig, "base64"); // 64 bytes (32+32)
            if (ecdsa.verify(buf_to_verify, signature, Buffer.from(pub_key, "base64")))
                return true;
            else
                return false;
        } catch (errer) {
            return false;
        }
    }

    signMessage(text: string) {
        let sha256 = crypto.createHash('sha256');
        let hash = sha256.update(text).digest('base64');
        return this.sign(hash);
    }

    verifyMessage(origin: string, signed: string, pubkeyBuf?: Buffer) {
        let sha256 = crypto.createHash('sha256');
        let hash = sha256.update(origin).digest('base64');

        let xPrivKey = this.mainXprivKey;
        let privateKey = xPrivKey.derive(`m/0/0`)['privateKey'];
        let privKeyBuf = privateKey.bn.toBuffer({ size: 32 });

        let pubKey = pubkeyBuf || ecdsa.publicKeyCreate(privKeyBuf);

        return ecdsa.verify(Buffer.from(hash, 'base64'), Buffer.from(signed, 'base64'), pubKey);
    }

    /**
     * Gen ecdsa pub key
     * @param {number} index 
     */
    ecdsaPubkey(index: number) {
        try {
            let xPrivKey = this.mainXprivKey;
            let priv_key = xPrivKey.derive(`m/0/${index}`)['privateKey'].bn.toBuffer({
                size: 32
            });
            let pubkey = ecdsa.publicKeyCreate(priv_key, true);
            let pub_b64 = pubkey.toString('base64');
            return pub_b64;
        } catch (error) {
            return "0";
        }
    }
}