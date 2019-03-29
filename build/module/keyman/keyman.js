import bip39 from 'bip39';
import mnemonic from 'bitcore-mnemonic';
import { HDPrivateKey } from 'bitcore-lib';
import crypto from 'crypto';
import hash from '../helper/hash';
import ecdsa from 'secp256k1';
export default class Keyman {
    constructor(mnemonicCode, passphrase = undefined) {
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
        }
        catch (error) {
            return "0";
        }
    }
    genAddress(index) {
        let pubkey = this.mainXpubKey.derive(`m/0/${index}`).publicKey;
        let base64 = pubkey.toBuffer().toString('base64');
        let address = hash.getChash160(['sig', {
                "pubkey": base64
            }]);
        return address;
    }
    sign(b64_hash, index = 0) {
        try {
            let buf_to_sign = new Buffer(b64_hash, 'base64');
            let xPrivKey = this.mainXprivKey;
            let privateKey = xPrivKey.derive(`m/0/${index}`)['privateKey'];
            let privKeyBuf = privateKey.bn.toBuffer({ size: 32 });
            let res = ecdsa.sign(buf_to_sign, privKeyBuf);
            return res.signature.toString("base64");
        }
        catch (error) {
            return error.message;
        }
    }
    verify(b64_hash, sig, pub_key) {
        try {
            var buf_to_verify = new Buffer(b64_hash, "base64");
            var signature = new Buffer(sig, "base64"); // 64 bytes (32+32)
            if (ecdsa.verify(buf_to_verify, signature, new Buffer(pub_key, "base64")))
                return true;
            else
                return false;
        }
        catch (errer) {
            return false;
        }
    }
    signMessage(text) {
        let sha256 = crypto.createHash('sha256');
        let hash = sha256.update(text).digest('base64');
        return this.sign(hash);
    }
    verifyMessage(origin, signed) {
        let sha256 = crypto.createHash('sha256');
        let hash = sha256.update(origin).digest('base64');
        let xPrivKey = this.mainXprivKey;
        let privateKey = xPrivKey.derive(`m/0/0`)['privateKey'];
        let privKeyBuf = privateKey.bn.toBuffer({ size: 32 });
        let pubKey = ecdsa.publicKeyCreate(privKeyBuf);
        return ecdsa.verify(Buffer.from(hash, 'base64'), Buffer.from(signed, 'base64'), pubKey);
    }
    /**
     * Gen ecdsa pub key
     * @param {number} index
     */
    ecdsaPubkey(index) {
        try {
            let xPrivKey = this.mainXprivKey;
            let priv_key = xPrivKey.derive(`m/0/${index}`)['privateKey'].bn.toBuffer({
                size: 32
            });
            let pubkey = ecdsa.publicKeyCreate(priv_key, true);
            let pub_b64 = pubkey.toString('base64');
            return pub_b64;
        }
        catch (error) {
            return "0";
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5bWFuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2tleW1hbi9rZXltYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQzFCLE9BQU8sUUFBUSxNQUFNLGtCQUFrQixDQUFDO0FBQ3hDLE9BQU8sRUFBZSxZQUFZLEVBQWEsTUFBTSxhQUFhLENBQUM7QUFDbkUsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBQzVCLE9BQU8sSUFBSSxNQUFNLGdCQUFnQixDQUFDO0FBQ2xDLE9BQU8sS0FBSyxNQUFNLFdBQVcsQ0FBQztBQUU5QixNQUFNLENBQUMsT0FBTyxPQUFPLE1BQU07SUFTdkIsWUFBWSxZQUFvQixFQUFFLGFBQXFCLFNBQVM7UUFDNUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUN2QyxNQUFNLElBQUksS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7U0FDNUM7UUFFRCxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRTlELElBQUksSUFBSSxHQUFHLGFBQWEsQ0FBQztRQUN6QixJQUFJLElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUVwQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FB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