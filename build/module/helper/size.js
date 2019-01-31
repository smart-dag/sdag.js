const PARENT_UNITS_SIZE = 2 * 44;
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
export function getHeadersSize(objUnit) {
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
export function getTotalPayloadSize(objUnit) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2l6ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9oZWxwZXIvc2l6ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLGlCQUFpQixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFakMsU0FBUyxTQUFTLENBQUMsS0FBSztJQUNwQixJQUFJLEtBQUssS0FBSyxJQUFJO1FBQ2QsT0FBTyxDQUFDLENBQUM7SUFDYixRQUFRLE9BQU8sS0FBSyxFQUFFO1FBQ2xCLEtBQUssUUFBUTtZQUNULE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUN4QixLQUFLLFFBQVE7WUFDVCxPQUFPLENBQUMsQ0FBQztRQUNiLEtBQUssUUFBUTtZQUNULElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNaLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBQ3BCLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxPQUFPO29CQUMzQixHQUFHLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM5QixDQUFDLENBQUMsQ0FBQzs7Z0JBRUgsS0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQUU7b0JBQ25CLElBQUksT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssV0FBVzt3QkFDakMsTUFBTSxLQUFLLENBQUMsZUFBZSxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUN4RSxHQUFHLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUNoQztZQUNMLE9BQU8sR0FBRyxDQUFDO1FBQ2YsS0FBSyxTQUFTO1lBQ1YsT0FBTyxDQUFDLENBQUM7UUFDYjtZQUNJLE1BQU0sS0FBSyxDQUFDLGVBQWUsR0FBRyxDQUFDLE9BQU8sS0FBSyxDQUFDLEdBQUcsTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDO0tBQ3RFO0FBQ0wsQ0FBQztBQUVELE1BQU0sVUFBVSxjQUFjLENBQUMsT0FBTztJQUNsQyxJQUFJO1FBQ0EsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksUUFBUTtZQUM1QixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ25DLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLFFBQVE7WUFDakMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDOztZQUV4QixPQUFPLENBQUMsQ0FBQztRQUNiLElBQUksT0FBTyxDQUFDLFlBQVk7WUFDcEIsTUFBTSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztRQUMvRCxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUM7UUFDdEIsT0FBTyxTQUFTLENBQUMsa0JBQWtCLENBQUM7UUFDcEMsT0FBTyxTQUFTLENBQUMsa0JBQWtCLENBQUM7UUFDcEMsT0FBTyxTQUFTLENBQUMsZ0JBQWdCLENBQUM7UUFDbEMsT0FBTyxTQUFTLENBQUMsU0FBUyxDQUFDO1FBQzNCLE9BQU8sU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUMxQixPQUFPLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxrQ0FBa0M7UUFDakUsT0FBTyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsaUJBQWlCLENBQUM7S0FDbkQ7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE9BQU8sQ0FBQyxDQUFDO0tBQ1o7QUFDTCxDQUFDO0FBRUQsTUFBTSxVQUFVLG1CQUFtQixDQUFDLE9BQU87SUFDdkMsSUFBSTtRQUNBLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLFFBQVE7WUFDNUIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNqQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxRQUFRO1lBQ2pDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQzs7WUFFdEIsT0FBTyxDQUFDLENBQUM7UUFDYixJQUFJLE9BQU8sQ0FBQyxZQUFZO1lBQ3BCLE1BQU0sS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7UUFDL0QsT0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3RDO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLENBQUMsQ0FBQztLQUNaO0FBQ0wsQ0FBQyJ9