import crypto from 'crypto';
import base32 from 'thirty-two';
const PI = "71828182845904523536028747135266249775724909369995"; //'71828182845904523536028747135266249775724909369995'
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
    // if (index != 32)
    //     throw "wrong number of checksum bits";
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
    var full_checksum = crypto.createHash("sha256").update(clean_data).digest();
    // console.log('full_checksum', full_checksum);
    var checksum = Buffer.from([full_checksum[5], full_checksum[13], full_checksum[21], full_checksum[29]]);
    return checksum;
}
function getChash(data, chash_length) {
    //console.log("getChash: "+data);
    checkLength(chash_length);
    var hash = crypto.createHash((chash_length === 160) ? "ripemd160" : "sha256").update(data, "utf8").digest();
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
    var chash = (encoded_len === 32) ? base32.decode(encoded) : Buffer.from(encoded, 'base64');
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
    let chash = base32.decode(encoded);
    var binChash = buffer2bin(chash);
    var { clean_data, checksum } = separateIntoCleanDataAndChecksum(binChash);
    let cleanData = bin2buffer(clean_data);
    let checkSum = bin2buffer(checksum);
    for (let i = 0; i < 255; i++) {
        let full = Buffer.concat([cleanData, new Uint8Array([i])]);
        if (checkSum.equals(getChecksum(full)))
            return true;
    }
    return false;
}
export default {
    getChash160,
    getChash288,
    isChashValid,
    isChashValid2,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhc2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaGVscGVyL2NoYXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUM1QixPQUFPLE1BQU0sTUFBTSxZQUFZLENBQUM7QUFFaEMsTUFBTSxFQUFFLEdBQUcsb0RBQW9ELENBQUMsQ0FBQyxzREFBc0Q7QUFDdkgsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDO0FBQzlCLE1BQU0sa0JBQWtCLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUV4QyxTQUFTLFdBQVcsQ0FBQyxZQUFZO0lBQzdCLElBQUksWUFBWSxLQUFLLEdBQUcsSUFBSSxZQUFZLEtBQUssR0FBRztRQUM1QyxNQUFNLDZCQUE2QixHQUFHLFlBQVksQ0FBQztBQUMzRCxDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsWUFBWTtJQUM3QixXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDMUIsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNmLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztJQUVkLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxZQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDeEMsSUFBSSxlQUFlLEdBQUcsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEQsSUFBSSxlQUFlLEtBQUssQ0FBQztZQUNyQixTQUFTO1FBQ2IsTUFBTSxJQUFJLGVBQWUsQ0FBQztRQUMxQixJQUFJLFlBQVksS0FBSyxHQUFHO1lBQ3BCLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDaEIsSUFBSSxNQUFNLElBQUksWUFBWTtZQUN0QixNQUFNO1FBQ1YsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4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