/// <reference types="node" />
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
    validateAddress(addr: string): boolean;
    sign(b64_hash: string, index?: number): any;
    verify(b64_hash: string, sig: string, pub_key: string): boolean;
    signMessage(text: string): any;
    verifyMessage(origin: string, signed: string, pubkeyBuf?: Buffer): boolean;
    /**
     * Gen ecdsa pub key
     * @param {number} index
     */
    ecdsaPubkey(index: number): string;
}
