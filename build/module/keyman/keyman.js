import bip39 from 'bip39';
import mnemonic from 'bitcore-mnemonic';
import { HDPrivateKey } from 'bitcore-lib';
import crypto from 'crypto';
import hash from './hash';
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
            let buf_to_sign = new Buffer(b64_hash, "base64");
            let xPrivKey = this.mainXprivKey;
            let privateKey = xPrivKey.derive(`m/${index}`)['privateKey'];
            let privKeyBuf = privateKey.bn.toBuffer({ size: 32 });
            let res = ecdsa.sign(buf_to_sign, privKeyBuf);
            return res.signature.toString("base64");
        }
        catch (error) {
            return "0";
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
    /**
     * 生成ecdsa签名公钥
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5bWFuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2tleW1hbi9rZXltYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQzFCLE9BQU8sUUFBUSxNQUFNLGtCQUFrQixDQUFDO0FBQ3hDLE9BQU8sRUFBZSxZQUFZLEVBQWEsTUFBTSxhQUFhLENBQUM7QUFDbkUsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBQzVCLE9BQU8sSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUMxQixPQUFPLEtBQUssTUFBTSxXQUFXLENBQUM7QUFFOUIsTUFBTSxDQUFDLE9BQU8sT0FBTyxNQUFNO0lBU3ZCLFlBQVksWUFBb0IsRUFBRSxhQUFxQixTQUFTO1FBQzVELElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1NBQzVDO1FBRUQsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUU5RCxJQUFJLElBQUksR0FBRyxhQUFhLENBQUM7UUFDekIsSUFBSSxJQUFJLEdBQUcsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFFcEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7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