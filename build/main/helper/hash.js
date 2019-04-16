"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = __importDefault(require("crypto"));
var chash_1 = __importDefault(require("./chash"));
function getSourceString(obj) {
    var arrComponents = [];
    function extractComponents(variable) {
        if (variable === null)
            throw Error("null value in " + JSON.stringify(obj));
        switch (typeof variable) {
            case "string":
                arrComponents.push("s", variable);
                break;
            case "number":
                arrComponents.push("n", variable.toString());
                break;
            case "boolean":
                arrComponents.push("b", variable.toString());
                break;
            case "object":
                if (Array.isArray(variable)) {
                    if (variable.length === 0) {
                        console.log('error', variable);
                        throw Error("empty array in " + JSON.stringify(obj));
                    }
                    arrComponents.push('[');
                    for (var i = 0; i < variable.length; i++)
                        extractComponents(variable[i]);
                    arrComponents.push(']');
                }
                else {
                    var keys = Object.keys(variable).sort();
                    if (keys.length === 0)
                        throw Error("empty object in " + JSON.stringify(obj));
                    keys.forEach(function (key) {
                        if (typeof variable[key] === "undefined")
                            throw Error("undefined at " + key + " of " + JSON.stringify(obj));
                        arrComponents.push(key);
                        extractComponents(variable[key]);
                    });
                }
                break;
            default:
                throw Error("hash: unknown type=" + (typeof variable) + " of " + variable + ", object: " + JSON.stringify(obj));
        }
    }
    extractComponents(obj);
    return arrComponents.join("\x00");
}
exports.getSourceString = getSourceString;
function getChash160(obj) {
    var str = getSourceString(obj);
    return chash_1.default.getChash160(str);
}
exports.getChash160 = getChash160;
function isChashValid(encoded) {
    return chash_1.default.isChashValid(encoded);
}
exports.isChashValid = isChashValid;
function getBase64Hash(obj) {
    try {
        if (typeof (obj) == "string")
            var objUnit = JSON.parse(obj);
        else if (typeof (obj) == "object")
            var objUnit = obj;
        else
            return '0';
        return crypto_1.default.createHash("sha256").update(getSourceString(objUnit), "utf8").digest("base64");
    }
    catch (error) {
        throw error;
        return '0';
    }
}
exports.getBase64Hash = getBase64Hash;
function base64HashString(str) {
    return crypto_1.default.createHash('sha256').update(getSourceString(str), 'utf8').digest('base64');
}
exports.base64HashString = base64HashString;
function getNakedUnit(objUnit) {
    var objNakedUnit = objUnit;
    delete objNakedUnit.unit;
    delete objNakedUnit.headers_commission;
    delete objNakedUnit.payload_commission;
    delete objNakedUnit.main_chain_index;
    delete objNakedUnit.timestamp;
    //delete objNakedUnit.last_ball_unit;
    if (objNakedUnit.messages) {
        for (var i = 0; i < objNakedUnit.messages.length; i++) {
            delete objNakedUnit.messages[i].payload;
            delete objNakedUnit.messages[i].payload_uri;
        }
    }
    //console.log("naked Unit: ", objNakedUnit);
    //console.log("original Unit: ", objUnit);
    return objNakedUnit;
}
function getUnitContentHash(objUnit) {
    return getBase64Hash(getNakedUnit(objUnit));
}
function getUnitHash(objUnit) {
    try {
        if (typeof (objUnit) == "string")
            var objUnit = JSON.parse(objUnit);
        else if (typeof (objUnit) == "object")
            var objUnit = objUnit;
        else
            return 0;
        if (objUnit.content_hash) // already stripped
            return getBase64Hash(getNakedUnit(objUnit));
        var objStrippedUnit = {
            content_hash: getUnitContentHash(objUnit),
            version: objUnit.version,
            alt: objUnit.alt,
            authors: objUnit.authors.map(function (author) { return { address: author.address }; }) // already sorted
        };
        if (objUnit.witness_list_unit)
            objStrippedUnit.witness_list_unit = objUnit.witness_list_unit;
        else
            objStrippedUnit.witnesses = objUnit.witnesses;
        if (objUnit.parent_units) {
            objStrippedUnit.parent_units = objUnit.parent_units;
            objStrippedUnit.last_ball = objUnit.last_ball;
            objStrippedUnit.last_ball_unit = objUnit.last_ball_unit;
        }
        return getBase64Hash(objStrippedUnit);
    }
    catch (error) {
        return 0;
    }
}
exports.getUnitHash = getUnitHash;
function getUnitHashToSign(objUnit) {
    try {
        if (typeof (objUnit) == "string")
            var objNakedUnit = getNakedUnit(JSON.parse(objUnit));
        else if (typeof (objUnit) == "object")
            var objNakedUnit = getNakedUnit(objUnit);
        else
            return 0;
        for (var i = 0; i < objNakedUnit.authors.length; i++)
            delete objNakedUnit.authors[i].authentifiers;
        var buf = crypto_1.default.createHash("sha256").update(getSourceString(objNakedUnit), "utf8").digest();
        return buf.toString("base64");
    }
    catch (error) {
        throw error;
        return 0;
    }
}
exports.getUnitHashToSign = getUnitHashToSign;
function getDeviceAddress(b64_pubkey) {
    return ('0' + getChash160(b64_pubkey));
}
function getDeviceMessageHashToSign(objDeviceMessage) {
    try {
        if (typeof (objDeviceMessage) == "string")
            var objNakedDeviceMessage = getNakedUnit(JSON.parse(objDeviceMessage));
        else if (typeof (objDeviceMessage) == "object")
            var objNakedDeviceMessage = getNakedUnit(objDeviceMessage);
        else
            return 0;
        delete objNakedDeviceMessage.signature;
        var buf = crypto_1.default.createHash("sha256").update(getSourceString(objNakedDeviceMessage), "utf8").digest();
        return buf.toString("base64");
    }
    catch (error) {
        return 0;
    }
}
exports.default = {
    getSourceString: getSourceString,
    getChash160: getChash160,
    isChashValid: isChashValid,
    getBase64Hash: getBase64Hash,
    getUnitHashToSign: getUnitHashToSign,
    getUnitHash: getUnitHash,
    getDeviceAddress: getDeviceAddress,
    getDeviceMessageHashToSign: getDeviceMessageHashToSign,
    base64HashString: base64HashString
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXIvaGFzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGtEQUE0QjtBQUM1QixrREFBNEI7QUFFNUIsU0FBZ0IsZUFBZSxDQUFDLEdBQUc7SUFDL0IsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBRXZCLFNBQVMsaUJBQWlCLENBQUMsUUFBUTtRQUMvQixJQUFJLFFBQVEsS0FBSyxJQUFJO1lBQ2pCLE1BQU0sS0FBSyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN4RCxRQUFRLE9BQU8sUUFBUSxFQUFFO1lBQ3JCLEtBQUssUUFBUTtnQkFDVCxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDbEMsTUFBTTtZQUNWLEtBQUssUUFBUTtnQkFDVCxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDN0MsTUFBTTtZQUNWLEtBQUssU0FBUztnQkFDVixhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDN0MsTUFBTTtZQUNWLEtBQUssUUFBUTtnQkFDVCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQ3pCLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7d0JBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO3dCQUMvQixNQUFNLEtBQUssQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQ3hEO29CQUVELGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3hC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