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
function getChash160(obj) {
    return chash_1.default.getChash160(getSourceString(obj));
}
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
    getBase64Hash: getBase64Hash,
    getUnitHashToSign: getUnitHashToSign,
    getUnitHash: getUnitHash,
    getDeviceAddress: getDeviceAddress,
    getDeviceMessageHashToSign: getDeviceMessageHashToSign
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9rZXltYW4vaGFzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGtEQUE0QjtBQUM1QixrREFBNEI7QUFFNUIsU0FBUyxlQUFlLENBQUMsR0FBRztJQUN4QixJQUFJLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFFdkIsU0FBUyxpQkFBaUIsQ0FBQyxRQUFRO1FBQy9CLElBQUksUUFBUSxLQUFLLElBQUk7WUFDakIsTUFBTSxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3hELFFBQVEsT0FBTyxRQUFRLEVBQUU7WUFDckIsS0FBSyxRQUFRO2dCQUNULGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNsQyxNQUFNO1lBQ1YsS0FBSyxRQUFRO2dCQUNULGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUM3QyxNQUFNO1lBQ1YsS0FBSyxTQUFTO2dCQUNWLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUM3QyxNQUFNO1lBQ1YsS0FBSyxRQUFRO2dCQUNULElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDekIsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTt3QkFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7d0JBQy9CLE1BQU0sS0FBSyxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDeEQ7b0JBRUQsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDeEIs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