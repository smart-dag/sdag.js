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
    return chash_1.default.getChash160(getSourceString(obj));
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