import crypto from 'crypto';
import base32 from 'thirty-two';
const PI = "14159265358979323846264338327950288419716939937510";
const zeroString = "00000000";
const arrRelativeOffsets = PI.split("");
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
const arrOffsets160 = calcOffsets(160);
const arrOffsets288 = calcOffsets(288);
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
    var full_checksum = crypto.createHash("sha256").update(clean_data).digest();
    //console.log(full_checksum);
    var checksum = new Buffer([full_checksum[5], full_checksum[13], full_checksum[21], full_checksum[29]]);
    return checksum;
}
function getChash(data, chash_length) {
    //console.log("getChash: "+data);
    checkLength(chash_length);
    var hash = crypto.createHash((chash_length === 160) ? "ripemd160" : "sha256").update(data, "utf8").digest();
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
    var encoded = (chash_length === 160) ? base32.encode(chash).toString() : chash.toString('base64');
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
    var chash = (encoded_len === 32) ? base32.decode(encoded) : new Buffer(encoded, 'base64');
    var binChash = buffer2bin(chash);
    var separated = separateIntoCleanDataAndChecksum(binChash);
    var clean_data = bin2buffer(separated.clean_data);
    //console.log("clean data", clean_data);
    var checksum = bin2buffer(separated.checksum);
    //console.log(checksum);
    //console.log(getChecksum(clean_data));
    return checksum.equals(getChecksum(clean_data));
}
export default {
    getChash160,
    getChash288,
    isChashValid,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhc2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMva2V5bWFuL2NoYXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUM1QixPQUFPLE1BQU0sTUFBTSxZQUFZLENBQUM7QUFFaEMsTUFBTSxFQUFFLEdBQUcsb0RBQW9ELENBQUM7QUFDaEUsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDO0FBQzlCLE1BQU0sa0JBQWtCLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUV4QyxTQUFTLFdBQVcsQ0FBQyxZQUFZO0lBQzdCLElBQUksWUFBWSxLQUFLLEdBQUcsSUFBSSxZQUFZLEtBQUssR0FBRztRQUM1QyxNQUFNLDZCQUE2QixHQUFHLFlBQVksQ0FBQztBQUMzRCxDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsWUFBWTtJQUM3QixXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDMUIsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNmLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztJQUVkLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxZQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDeEMsSUFBSSxlQUFlLEdBQUcsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEQsSUFBSSxlQUFlLEtBQUssQ0FBQztZQUNyQixTQUFTO1FBQ2IsTUFBTSxJQUFJLGVBQWUsQ0FBQztRQUMxQixJQUFJLFlBQVksS0FBSyxHQUFHO1lBQ3BCLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDaEIsSUFBSSxNQUFNLElBQUksWUFBWTtZQUN0QixNQUFNO1FBQ1YsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QixpREFBaUQ7UUFD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