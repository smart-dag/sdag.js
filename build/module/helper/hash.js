import crypto from 'crypto';
import chash from './chash';
export function getSourceString(obj) {
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
export function getChash160(obj) {
    return chash.getChash160(getSourceString(obj));
}
export function getBase64Hash(obj) {
    try {
        if (typeof (obj) == "string")
            var objUnit = JSON.parse(obj);
        else if (typeof (obj) == "object")
            var objUnit = obj;
        else
            return '0';
        return crypto.createHash("sha256").update(getSourceString(objUnit), "utf8").digest("base64");
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
export function getUnitHash(objUnit) {
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
export function getUnitHashToSign(objUnit) {
    try {
        if (typeof (objUnit) == "string")
            var objNakedUnit = getNakedUnit(JSON.parse(objUnit));
        else if (typeof (objUnit) == "object")
            var objNakedUnit = getNakedUnit(objUnit);
        else
            return 0;
        for (var i = 0; i < objNakedUnit.authors.length; i++)
            delete objNakedUnit.authors[i].authentifiers;
        var buf = crypto.createHash("sha256").update(getSourceString(objNakedUnit), "utf8").digest();
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
        var buf = crypto.createHash("sha256").update(getSourceString(objNakedDeviceMessage), "utf8").digest();
        return buf.toString("base64");
    }
    catch (error) {
        return 0;
    }
}
export default {
    getSourceString,
    getChash160,
    getBase64Hash,
    getUnitHashToSign,
    getUnitHash,
    getDeviceAddress,
    getDeviceMessageHashToSign
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXIvaGFzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDNUIsT0FBTyxLQUFLLE1BQU0sU0FBUyxDQUFDO0FBRTVCLE1BQU0sVUFBVSxlQUFlLENBQUMsR0FBRztJQUMvQixJQUFJLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFFdkIsU0FBUyxpQkFBaUIsQ0FBQyxRQUFRO1FBQy9CLElBQUksUUFBUSxLQUFLLElBQUk7WUFDakIsTUFBTSxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3hELFFBQVEsT0FBTyxRQUFRLEVBQUU7WUFDckIsS0FBSyxRQUFRO2dCQUNULGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNsQyxNQUFNO1lBQ1YsS0FBSyxRQUFRO2dCQUNULGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUM3QyxNQUFNO1lBQ1YsS0FBSyxTQUFTO2dCQUNWLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUM3QyxNQUFNO1lBQ1YsS0FBSyxRQUFRO2dCQUNULElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDekIsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTt3QkFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7d0JBQy9CLE1BQU0sS0FBSyxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDeEQ7b0JBRUQsYUFBYSxD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