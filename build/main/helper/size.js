"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PARENT_UNITS_SIZE = 2 * 44;
function getLength(value) {
    if (value === null)
        return 0;
    switch (typeof value) {
        case "string":
            return value.length;
        case "number":
            return 8;
        case "object":
            var len = 0;
            if (Array.isArray(value))
                value.forEach(function (element) {
                    len += getLength(element);
                });
            else
                for (var key in value) {
                    if (typeof value[key] === "undefined")
                        throw Error("undefined at " + key + " of " + JSON.stringify(value));
                    len += getLength(value[key]);
                }
            return len;
        case "boolean":
            return 1;
        default:
            throw Error("unknown type=" + (typeof value) + " of " + value);
    }
}
function getHeadersSize(objUnit) {
    try {
        if (typeof (objUnit) == "string")
            var objHeader = JSON.parse(objUnit);
        else if (typeof (objUnit) == "object")
            var objHeader = objUnit;
        else
            return 0;
        if (objUnit.content_hash)
            throw Error("trying to get headers size of stripped unit");
        delete objHeader.unit;
        delete objHeader.headers_commission;
        delete objHeader.payload_commission;
        delete objHeader.main_chain_index;
        delete objHeader.timestamp;
        delete objHeader.messages;
        delete objHeader.parent_units; // replaced with PARENT_UNITS_SIZE
        return getLength(objHeader) + PARENT_UNITS_SIZE;
    }
    catch (error) {
        return 0;
    }
}
exports.getHeadersSize = getHeadersSize;
function getTotalPayloadSize(objUnit) {
    try {
        if (typeof (objUnit) == "string")
            var objUnit = JSON.parse(objUnit);
        else if (typeof (objUnit) == "object")
            var objUnit = objUnit;
        else
            return 0;
        if (objUnit.content_hash)
            throw Error("trying to get payload size of stripped unit");
        return getLength(objUnit.messages);
    }
    catch (error) {
        return 0;
    }
}
exports.getTotalPayloadSize = getTotalPayloadSize;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2l6ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXIvc2l6ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQU0saUJBQWlCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUVqQyxTQUFTLFNBQVMsQ0FBQyxLQUFLO0lBQ3BCLElBQUksS0FBSyxLQUFLLElBQUk7UUFDZCxPQUFPLENBQUMsQ0FBQztJQUNiLFFBQVEsT0FBTyxLQUFLLEVBQUU7UUFDbEIsS0FBSyxRQUFRO1lBQ1QsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3hCLEtBQUssUUFBUTtZQUNULE9BQU8sQ0FBQyxDQUFDO1FBQ2IsS0FBSyxRQUFRO1lBQ1QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ1osSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDcEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLE9BQU87b0JBQzNCLEdBQUcsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzlCLENBQUMsQ0FBQyxDQUFDOztnQkFFSCxLQUFLLElBQUksR0FBRyxJQUFJLEtBQUssRUFBRTtvQkFDbkIsSUFBSSxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxXQUFXO3dCQUNqQyxNQUFNLEtBQUssQ0FBQyxlQUFlLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ3hFLEdBQUcsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQ2hDO1lBQ0wsT0FBTyxHQUFHLENBQUM7UUFDZixLQUFLLFNBQVM7WUFDVixPQUFPLENBQUMsQ0FBQztRQUNiO1lBQ0ksTUFBTSxLQUFLLENBQUMsZUFBZSxHQUFHLENBQUMsT0FBTyxLQUFLLENBQUMsR0FBRyxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUM7S0FDdEU7QUFDTCxDQUFDO0FBRUQsU0FBZ0IsY0FBYyxDQUFDLE9BQU87SUFDbEMsSUFBSTtRQUNBLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLFFBQVE7WUFDNUIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNuQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxRQUFRO1lBQ2pDLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQzs7WUFFeEIsT0FBTyxDQUFDLENBQUM7UUFDYixJQUFJLE9BQU8sQ0FBQyxZQUFZO1lBQ3BCLE1BQU0sS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7UUFDL0QsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDO1FBQ3RCLE9BQU8sU0FBUyxDQUFDLGtCQUFrQixDQUFDO1FBQ3BDLE9BQU8sU0FBUyxDQUFDLGtCQUFrQixDQUFDO1FBQ3BDLE9BQU8sU0FBUyxDQUFDLGdCQUFnQixDQUFDO1FBQ2xDLE9BQU8sU0FBUyxDQUFDLFNBQVMsQ0FBQztRQUMzQixPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUM7UUFDMUIsT0FBTyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsa0NBQWtDO1FBQ2pFLE9BQU8sU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLGlCQUFpQixDQUFDO0tBQ25EO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLENBQUMsQ0FBQztLQUNaO0FBQ0wsQ0FBQztBQXJCRCx3Q0FxQkM7QUFFRCxTQUFnQixtQkFBbUIsQ0FBQyxPQUFPO0lBQ3ZDLElBQUk7UUFDQSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxRQUFRO1lBQzVCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDakMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksUUFBUTtZQUNqQyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUM7O1lBRXRCLE9BQU8sQ0FBQyxDQUFDO1FBQ2IsSUFBSSxPQUFPLENBQUMsWUFBWTtZQUNwQixNQUFNLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO1FBQy9ELE9BQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN0QztJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxDQUFDLENBQUM7S0FDWjtBQUNMLENBQUM7QUFkRCxrREFjQyJ9