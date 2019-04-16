"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = __importDefault(require("crypto"));
var thirty_two_1 = __importDefault(require("thirty-two"));
var PI = "71828182845904523536028747135266249775724909369995"; //'71828182845904523536028747135266249775724909369995'
var zeroString = "00000000";
var arrRelativeOffsets = PI.split("");
function checkLength(chash_length) {
    if (chash_length !== 160 && chash_length !== 288)
        throw "unsupported c-hash length: " + chash_length;
}
function calcOffsets(chash_length) {
    checkLength(chash_length);
    var arrOffsets = [];
    var offset = 0;
    var index = 0;
    for (var i = 0; offset < chash_length; i++) {
        var relative_offset = parseInt(arrRelativeOffsets[i]);
        if (relative_offset === 0)
            continue;
        offset += relative_offset;
        if (chash_length === 288)
            offset += 4;
        if (offset >= chash_length)
            break;
        arrOffsets.push(offset);
        //console.log("index="+index+", offset="+offset);
        index++;
    }
    // if (index != 32)
    //     throw "wrong number of checksum bits";
    return arrOffsets;
}
var arrOffsets160 = calcOffsets(160);
var arrOffsets288 = calcOffsets(288);
function separateIntoCleanDataAndChecksum(bin) {
    var len = bin.length;
    var arrOffsets;
    if (len === 160)
        arrOffsets = arrOffsets160;
    else if (len === 288)
        arrOffsets = arrOffsets288;
    else
        throw Error("bad length=" + len + ", bin = " + bin);
    var arrFrags = [];
    var arrChecksumBits = [];
    var start = 0;
    for (var i = 0; i < arrOffsets.length; i++) {
        arrFrags.push(bin.substring(start, arrOffsets[i]));
        arrChecksumBits.push(bin.substr(arrOffsets[i], 1));
        start = arrOffsets[i] + 1;
    }
    // add last frag
    // console.log('start-bin.length', start, bin.length, arrOffsets.length);
    // console.log('arrFrags', arrFrags);
    // console.log('bin.substring(start)', bin.substring(start));
    if (start < bin.length)
        arrFrags.push(bin.substring(start));
    // console.log('arrFrags length', arrFrags.length);
    // console.log('arrFrags', arrFrags);
    var binCleanData = arrFrags.join("");
    var binChecksum = arrChecksumBits.join("");
    return { clean_data: binCleanData, checksum: binChecksum };
}
function mixChecksumIntoCleanData(binCleanData, binChecksum) {
    if (binChecksum.length !== 32)
        throw "bad checksum length";
    var len = binCleanData.length + binChecksum.length;
    var arrOffsets;
    if (len === 160)
        arrOffsets = arrOffsets160;
    else if (len === 288)
        arrOffsets = arrOffsets288;
    else
        throw Error("bad length=" + len + ", clean data = " + binCleanData + ", checksum = " + binChecksum);
    var arrFrags = [];
    var arrChecksumBits = binChecksum.split("");
    var start = 0;
    for (var i = 0; i < arrOffsets.length; i++) {
        var end = arrOffsets[i] - i;
        arrFrags.push(binCleanData.substring(start, end));
        arrFrags.push(arrChecksumBits[i]);
        start = end;
    }
    // add last frag
    if (start < binCleanData.length)
        arrFrags.push(binCleanData.substring(start));
    return arrFrags.join("");
}
function buffer2bin(buf) {
    var bytes = [];
    for (var i = 0; i < buf.length; i++) {
        var bin = buf[i].toString(2);
        if (bin.length < 8) // pad with zeros
            bin = zeroString.substring(bin.length, 8) + bin;
        bytes.push(bin);
    }
    return bytes.join("");
}
function bin2buffer(bin) {
    var len = bin.length / 8;
    var buf = Buffer.alloc(len);
    for (var i = 0; i < len; i++)
        buf[i] = parseInt(bin.substr(i * 8, 8), 2);
    return buf;
}
function getChecksum(clean_data) {
    var full_checksum = crypto_1.default.createHash("sha256").update(clean_data).digest();
    // console.log('full_checksum', full_checksum);
    var checksum = Buffer.from([full_checksum[5], full_checksum[13], full_checksum[21], full_checksum[29]]);
    return checksum;
}
function getChash(data, chash_length) {
    //console.log("getChash: "+data);
    checkLength(chash_length);
    var hash = crypto_1.default.createHash((chash_length === 160) ? "ripemd160" : "sha256").update(data, "utf8").digest();
    //console.log("hash", hash);
    var truncated_hash = (chash_length === 160) ? hash.slice(4) : hash; // drop first 4 bytes if 160
    // console.log("clean data", truncated_hash);
    var checksum = getChecksum(truncated_hash);
    // console.log("checksum", checksum);
    //console.log("checksum", buffer2bin(checksum));
    var binCleanData = buffer2bin(truncated_hash);
    // console.log('bin clean data', binCleanData);
    var binChecksum = buffer2bin(checksum);
    // console.log('bin checksum', binChecksum);
    var binChash = mixChecksumIntoCleanData(binCleanData, binChecksum);
    //console.log(binCleanData.length, binChecksum.length, binChash.length);
    var chash = bin2buffer(binChash);
    //console.log("chash     ", chash);
    var encoded = (chash_length === 160) ? thirty_two_1.default.encode(chash).toString() : chash.toString('base64');
    //console.log(encoded);
    return encoded;
}
function getChash160(data) {
    return getChash(data, 160);
}
function getChash288(data) {
    return getChash(data, 288);
}
function isChashValid(encoded) {
    var encoded_len = encoded.length;
    if (encoded_len !== 32 && encoded_len !== 48) // 160/5 = 32, 288/6 = 48
        throw "wrong encoded length: " + encoded_len;
    var chash = (encoded_len === 32) ? thirty_two_1.default.decode(encoded) : Buffer.from(encoded, 'base64');
    var binChash = buffer2bin(chash);
    var separated = separateIntoCleanDataAndChecksum(binChash);
    // console.log('bin clean data', separated.clean_data);
    // console.log('bin checksum ', separated.checksum);
    var clean_data = bin2buffer(separated.clean_data);
    var checksum = bin2buffer(separated.checksum);
    // console.log("clean data", clean_data);
    // console.error('checksum', checksum);
    // console.log('getchecksum', getChecksum(clean_data));
    //console.log(checksum);
    //console.log(getChecksum(clean_data));
    return checksum.equals(getChecksum(clean_data));
}
function isChashValid2(encoded) {
    var chash = thirty_two_1.default.decode(encoded);
    var binChash = buffer2bin(chash);
    var _a = separateIntoCleanDataAndChecksum(binChash), clean_data = _a.clean_data, checksum = _a.checksum;
    var cleanData = bin2buffer(clean_data);
    var checkSum = bin2buffer(checksum);
    for (var i = 0; i < 255; i++) {
        var full = Buffer.concat([cleanData, new Uint8Array([i])]);
        if (checkSum.equals(getChecksum(full)))
            return true;
    }
    return false;
}
exports.default = {
    getChash160: getChash160,
    getChash288: getChash288,
    isChashValid: isChashValid,
    isChashValid2: isChashValid2,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhc2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaGVscGVyL2NoYXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQTRCO0FBQzVCLDBEQUFnQztBQUVoQyxJQUFNLEVBQUUsR0FBRyxvREFBb0QsQ0FBQyxDQUFDLHNEQUFzRDtBQUN2SCxJQUFNLFVBQVUsR0FBRyxVQUFVLENBQUM7QUFDOUIsSUFBTSxrQkFBa0IsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRXhDLFNBQVMsV0FBVyxDQUFDLFlBQVk7SUFDN0IsSUFBSSxZQUFZLEtBQUssR0FBRyxJQUFJLFlBQVksS0FBSyxHQUFHO1FBQzVDLE1BQU0sNkJBQTZCLEdBQUcsWUFBWSxDQUFDO0FBQzNELENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxZQUFZO0lBQzdCLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMxQixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDcEIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ2YsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBRWQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLFlBQVksRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN4QyxJQUFJLGVBQWUsR0FBRyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RCxJQUFJLGVBQWUsS0FBSyxDQUFDO1lBQ3JCLFNBQVM7UUFDYixNQUFNLElBQUksZUFBZSxDQUFDO1FBQzFCLElBQUksWUFBWSxLQUFLLEdBQUc7WUFDcEIsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUNoQixJQUFJLE1BQU0sSUFBSSxZQUFZO1lBQ3RCLE1BQU07UUFDVixVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hCLGlEQUFpRDtRQUNqRCxLQUFLLEVBQUUsQ0FBQztL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