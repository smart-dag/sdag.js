export declare function getSourceString(obj: any): string;
export declare function getChash160(obj: any): any;
export declare function getBase64Hash(obj: any): string;
export declare function base64HashString(str: string): string;
export declare function getUnitHash(objUnit: any): string | 0;
export declare function getUnitHashToSign(objUnit: any): string | 0;
declare function getDeviceAddress(b64_pubkey: any): string;
declare function getDeviceMessageHashToSign(objDeviceMessage: any): string | 0;
declare const _default: {
    getSourceString: typeof getSourceString;
    getChash160: typeof getChash160;
    getBase64Hash: typeof getBase64Hash;
    getUnitHashToSign: typeof getUnitHashToSign;
    getUnitHash: typeof getUnitHash;
    getDeviceAddress: typeof getDeviceAddress;
    getDeviceMessageHashToSign: typeof getDeviceMessageHashToSign;
    base64HashString: typeof base64HashString;
};
export default _default;
