import { HDPublicKey, HDPrivateKey } from 'bitcore-lib';
export default class Keyman {
    mainXprivKey: HDPrivateKey;
    mainXpubKey: HDPublicKey;
    mainPubKey: string;
    mainEcdsaPubKey: string;
    walletId: string;
    mainAddress: string;
    constructor(mnemonicCode: string, passphrase?: string);
    deviceAddress(xPrivKey: any): any;
    genAddress(index: number): string;
    sign(b64_hash: string, index?: number): string;
    verify(b64_hash: string, sig: string, pub_key: string): boolean;
    /**
     * 生成ecdsa签名公钥
     * @param {number} index
     */
    ecdsaPubkey(index: number): string;
}
