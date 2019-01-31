import crypto from 'crypto';
import chash from './chash';
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
    return chash.getChash160(getSourceString(obj));
}
function getBase64Hash(obj) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9rZXltYW4vaGFzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDNUIsT0FBTyxLQUFLLE1BQU0sU0FBUyxDQUFDO0FBRTVCLFNBQVMsZUFBZSxDQUFDLEdBQUc7SUFDeEIsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBRXZCLFNBQVMsaUJBQWlCLENBQUMsUUFBUTtRQUMvQixJQUFJLFFBQVEsS0FBSyxJQUFJO1lBQ2pCLE1BQU0sS0FBSyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN4RCxRQUFRLE9BQU8sUUFBUSxFQUFFO1lBQ3JCLEtBQUssUUFBUTtnQkFDVCxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDbEMsTUFBTTtZQUNWLEtBQUssUUFBUTtnQkFDVCxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDN0MsTUFBTTtZQUNWLEtBQUssU0FBUztnQkFDVixhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDN0MsTUFBTTtZQUNWLEtBQUssUUFBUTtnQkFDVCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQ3pCLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7d0JBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO3dCQUMvQixNQUFNLEtBQUssQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQ3hEO29CQUVELGFBQWEsQ0FBQyxJ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