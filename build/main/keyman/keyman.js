"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bip39_1 = __importDefault(require("bip39"));
var bitcore_mnemonic_1 = __importDefault(require("bitcore-mnemonic"));
var bitcore_lib_1 = require("bitcore-lib");
var crypto_1 = __importDefault(require("crypto"));
var hash_1 = __importDefault(require("./hash"));
var secp256k1_1 = __importDefault(require("secp256k1"));
var Keyman = /** @class */ (function () {
    function Keyman(mnemonicCode, passphrase) {
        if (passphrase === void 0) { passphrase = undefined; }
        if (!bip39_1.default.validateMnemonic(mnemonicCode)) {
            throw new Error('invalid mnemnoic code');
        }
        var xpriv = bitcore_mnemonic_1.default(mnemonicCode).toHDPrivateKey(passphrase);
        var path = "m/44'/0'/0'";
        var root = new bitcore_lib_1.HDPrivateKey(xpriv);
        var main = root.derive(path);
        this.mainXprivKey = main;
        this.mainXpubKey = main.hdPublicKey;
        this.mainPubKey = main.hdPublicKey.publicKey.toString();
        this.mainEcdsaPubKey = this.ecdsaPubkey(0);
        // assert.equal(main.privateKey.toString(), main.derive('m/0').privateKey.toString());
        this.walletId = crypto_1.default.createHash("sha256").update(this.mainXpubKey.toString(), "utf8").digest("base64").toString();
        this.mainAddress = this.genAddress(0);
        // this.deviceAddress = this.deviceAddress(root); //  hash.getChash160(['sig'], { 'pubkey': root.derive(`m/1'`).hdPublicKey.publicKey.toBuffer().toString('base64') });
    }
    Keyman.prototype.deviceAddress = function (xPrivKey) {
        try {
            var priv_key = xPrivKey.derive("m/1'").privateKey.bn.toBuffer({
                size: 32
            });
            var pub_b64 = secp256k1_1.default.publicKeyCreate(priv_key, true).toString('base64');
            var device_address = hash_1.default.getDeviceAddress(pub_b64);
            return device_address;
        }
        catch (error) {
            return "0";
        }
    };
    Keyman.prototype.genAddress = function (index) {
        var pubkey = this.mainXpubKey.derive("m/0/" + index).publicKey;
        var base64 = pubkey.toBuffer().toString('base64');
        var address = hash_1.default.getChash160(['sig', {
                "pubkey": base64
            }]);
        return address;
    };
    Keyman.prototype.sign = function (b64_hash, index) {
        if (index === void 0) { index = 0; }
        try {
            var buf_to_sign = new Buffer(b64_hash, "base64");
            var xPrivKey = this.mainXprivKey;
            var privateKey = xPrivKey.derive("m/" + index)['privateKey'];
            var privKeyBuf = privateKey.bn.toBuffer({ size: 32 });
            var res = secp256k1_1.default.sign(buf_to_sign, privKeyBuf);
            return res.signature.toString("base64");
        }
        catch (error) {
            return "0";
        }
    };
    Keyman.prototype.verify = function (b64_hash, sig, pub_key) {
        try {
            var buf_to_verify = new Buffer(b64_hash, "base64");
            var signature = new Buffer(sig, "base64"); // 64 bytes (32+32)
            if (secp256k1_1.default.verify(buf_to_verify, signature, new Buffer(pub_key, "base64")))
                return true;
            else
                return false;
        }
        catch (errer) {
            return false;
        }
    };
    /**
     * 生成ecdsa签名公钥
     * @param {number} index
     */
    Keyman.prototype.ecdsaPubkey = function (index) {
        try {
            var xPrivKey = this.mainXprivKey;
            var priv_key = xPrivKey.derive("m/0/" + index)['privateKey'].bn.toBuffer({
                size: 32
            });
            var pubkey = secp256k1_1.default.publicKeyCreate(priv_key, true);
            var pub_b64 = pubkey.toString('base64');
            return pub_b64;
        }
        catch (error) {
            return "0";
        }
    };
    return Keyman;
}());
exports.default = Keyman;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5bWFuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2tleW1hbi9rZXltYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxnREFBMEI7QUFDMUIsc0VBQXdDO0FBQ3hDLDJDQUFtRTtBQUNuRSxrREFBNEI7QUFDNUIsZ0RBQTBCO0FBQzFCLHdEQUE4QjtBQUU5QjtJQVNJLGdCQUFZLFlBQW9CLEVBQUUsVUFBOEI7UUFBOUIsMkJBQUEsRUFBQSxzQkFBOEI7UUFDNUQsSUFBSSxDQUFDLGVBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUN2QyxNQUFNLElBQUksS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7U0FDNUM7UUFFRCxJQUFJLEtBQUssR0FBRywwQkFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUU5RCxJQUFJLElBQUksR0FBRyxhQUFhLENBQUM7UUFDekIsSUFBSSxJQUFJLEdBQUcsSUFBSSwwQkFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBRXBDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDeEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTNDLHNGQUFzRjtRQUV0RixJQUFJLENBQUMsUUFBUSxHQUFHLGdCQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxFQUFF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