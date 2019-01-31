"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = __importDefault(require("crypto"));
var thirty_two_1 = __importDefault(require("thirty-two"));
var PI = "14159265358979323846264338327950288419716939937510";
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
    if (index != 32)
        throw "wrong number of checksum bits";
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
    if (start < bin.length)
        arrFrags.push(bin.substring(start));
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
    var buf = new Buffer(len);
    for (var i = 0; i < len; i++)
        buf[i] = parseInt(bin.substr(i * 8, 8), 2);
    return buf;
}
function getChecksum(clean_data) {
    var full_checksum = crypto_1.default.createHash("sha256").update(clean_data).digest();
    //console.log(full_checksum);
    var checksum = new Buffer([full_checksum[5], full_checksum[13], full_checksum[21], full_checksum[29]]);
    return checksum;
}
function getChash(data, chash_length) {
    //console.log("getChash: "+data);
    checkLength(chash_length);
    var hash = crypto_1.default.createHash((chash_length === 160) ? "ripemd160" : "sha256").update(data, "utf8").digest();
    //console.log("hash", hash);
    var truncated_hash = (chash_length === 160) ? hash.slice(4) : hash; // drop first 4 bytes if 160
    //console.log("clean data", truncated_hash);
    var checksum = getChecksum(truncated_hash);
    //console.log("checksum", checksum);
    //console.log("checksum", buffer2bin(checksum));
    var binCleanData = buffer2bin(truncated_hash);
    var binChecksum = buffer2bin(checksum);
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
    var chash = (encoded_len === 32) ? thirty_two_1.default.decode(encoded) : new Buffer(encoded, 'base64');
    var binChash = buffer2bin(chash);
    var separated = separateIntoCleanDataAndChecksum(binChash);
    var clean_data = bin2buffer(separated.clean_data);
    //console.log("clean data", clean_data);
    var checksum = bin2buffer(separated.checksum);
    //console.log(checksum);
    //console.log(getChecksum(clean_data));
    return checksum.equals(getChecksum(clean_data));
}
exports.default = {
    getChash160: getChash160,
    getChash288: getChash288,
    isChashValid: isChashValid,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhc2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMva2V5bWFuL2NoYXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQTRCO0FBQzVCLDBEQUFnQztBQUVoQyxJQUFNLEVBQUUsR0FBRyxvREFBb0QsQ0FBQztBQUNoRSxJQUFNLFVBQVUsR0FBRyxVQUFVLENBQUM7QUFDOUIsSUFBTSxrQkFBa0IsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRXhDLFNBQVMsV0FBVyxDQUFDLFlBQVk7SUFDN0IsSUFBSSxZQUFZLEtBQUssR0FBRyxJQUFJLFlBQVksS0FBSyxHQUFHO1FBQzVDLE1BQU0sNkJBQTZCLEdBQUcsWUFBWSxDQUFDO0FBQzNELENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxZQUFZO0lBQzdCLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMxQixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDcEIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ2YsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBRWQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLFlBQVksRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN4QyxJQUFJLGVBQWUsR0FBRyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RCxJQUFJLGVBQWUsS0FBSyxDQUFDO1lBQ3JCLFNBQVM7UUFDYixNQUFNLElBQUksZUFBZSxDQUFDO1FBQzFCLElBQUksWUFBWSxLQUFLLEdBQUc7WUFDcEIsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUNoQixJQUFJLE1BQU0sSUFBSSxZQUFZO1lBQ3RCLE1BQU07UUFDVixVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hCLGlEQUFpRDtRQUNqRCxLQUFLLEVBQUUsQ0FBQztLQUNYO0lBRUQsSUFB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