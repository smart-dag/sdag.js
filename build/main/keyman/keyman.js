"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bip39_1 = __importDefault(require("bip39"));
var bitcore_mnemonic_1 = __importDefault(require("bitcore-mnemonic"));
var bitcore_lib_1 = require("bitcore-lib");
var crypto_1 = __importDefault(require("crypto"));
var hash_1 = __importDefault(require("../helper/hash"));
var secp256k1_1 = __importDefault(require("secp256k1"));
var chash_1 = __importDefault(require("../helper/chash"));
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
    Keyman.prototype.validateAddress = function (addr) {
        return chash_1.default.isChashValid2(addr);
    };
    Keyman.prototype.sign = function (b64_hash, index) {
        if (index === void 0) { index = 0; }
        try {
            var buf_to_sign = Buffer.from(b64_hash, 'base64');
            var xPrivKey = this.mainXprivKey;
            var privateKey = xPrivKey.derive("m/0/" + index)['privateKey'];
            var privKeyBuf = privateKey.bn.toBuffer({ size: 32 });
            var res = secp256k1_1.default.sign(buf_to_sign, privKeyBuf);
            return res.signature.toString("base64");
        }
        catch (error) {
            return error.message;
        }
    };
    Keyman.prototype.verify = function (b64_hash, sig, pub_key) {
        try {
            var buf_to_verify = Buffer.from(b64_hash, "base64");
            var signature = Buffer.from(sig, "base64"); // 64 bytes (32+32)
            if (secp256k1_1.default.verify(buf_to_verify, signature, Buffer.from(pub_key, "base64")))
                return true;
            else
                return false;
        }
        catch (errer) {
            return false;
        }
    };
    Keyman.prototype.signMessage = function (text) {
        var sha256 = crypto_1.default.createHash('sha256');
        var hash = sha256.update(text).digest('base64');
        return this.sign(hash);
    };
    Keyman.prototype.verifyMessage = function (origin, signed, pubkeyBuf) {
        var sha256 = crypto_1.default.createHash('sha256');
        var hash = sha256.update(origin).digest('base64');
        var xPrivKey = this.mainXprivKey;
        var privateKey = xPrivKey.derive("m/0/0")['privateKey'];
        var privKeyBuf = privateKey.bn.toBuffer({ size: 32 });
        var pubKey = pubkeyBuf || secp256k1_1.default.publicKeyCreate(privKeyBuf);
        return secp256k1_1.default.verify(Buffer.from(hash, 'base64'), Buffer.from(signed, 'base64'), pubKey);
    };
    /**
     * Gen ecdsa pub key
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5bWFuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2tleW1hbi9rZXltYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxnREFBMEI7QUFDMUIsc0VBQXdDO0FBQ3hDLDJDQUFtRTtBQUNuRSxrREFBNEI7QUFDNUIsd0RBQWtDO0FBQ2xDLHdEQUE4QjtBQUM5QiwwREFBb0M7QUFFcEM7SUFTSSxnQkFBWSxZQUFvQixFQUFFLFVBQThCO1FBQTlCLDJCQUFBLEVBQUEsc0JBQThCO1FBQzVELElBQUksQ0FBQyxlQUFLLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1NBQzVDO1FBRUQsSUFBSSxLQUFLLEdBQUcsMEJBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFOUQsSUFBSSxJQUFJLEdBQUcsYUFBYSxDQUFDO1FBQ3pCLElBQUksSUFBSSxHQUFHLElBQUksMEJBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUVwQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUzQyxzRkFBc0Y7UUFFdEYsSUFBSSxDQUFDLFFBQVEsR0FBRyxnQkFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxR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