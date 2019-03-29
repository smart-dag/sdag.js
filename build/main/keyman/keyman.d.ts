import { HDPublicKey, HDPrivateKey } from 'bitcore-lib';
export default class Keyman {
    mainXprivKey: HDPrivateKey;
    mainXpubKey: HDPublicKey;
    mainPubKey: string;
    mainEcdsaPubKey: string;
    walletId: string;
    mainAddress: string;
    constructor(mnemonicCode: string, passphrase?: string);
    deviceAddress(xPrivKey: any): string;
    genAddress(index: number): string;
    sign(b64_hash: string, encoding?: string, index?: number): string;
    verify(b64_hash: string, sig: string, pub_key: string): boolean;
    /**
     * Gen ecdsa pub key
     * @param {number} index
     */
    ecdsaPubkey(index: number): string;
}
