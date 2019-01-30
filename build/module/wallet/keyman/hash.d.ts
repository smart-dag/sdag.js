declare function getSourceString(obj: any): string;
declare function getChash160(obj: any): any;
declare function getBase64Hash(obj: any): string;
declare function getUnitHash(objUnit: any): string | 0;
declare function getUnitHashToSign(objUnit: any): string | 0;
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
};
export default _default;
