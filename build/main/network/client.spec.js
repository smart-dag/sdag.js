"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var ava_1 = __importDefault(require("ava"));
var client_1 = __importDefault(require("./client"));
var client = new client_1.default();
ava_1.default.before(function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.connect('ws://10.168.3.131:6615')];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
ava_1.default('gets free joints', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var joints;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.getFreeJoints()];
            case 1:
                joints = _a.sent();
                t.true(joints.length > 0);
                return [2 /*return*/];
        }
    });
}); });
ava_1.default('gets mci', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var joints, jointsLevel, statistics;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                t.true(client.connected);
                return [4 /*yield*/, client.getJointsByMci(1)];
            case 1:
                joints = _a.sent();
                t.true(joints.length > 0);
                return [4 /*yield*/, client.getJointsByLevel(20, 50)];
            case 2:
                jointsLevel = _a.sent();
                t.true(jointsLevel.length > 0);
                return [4 /*yield*/, client.getNetStatistics()];
            case 3:
                statistics = _a.sent();
                t.true(statistics != null);
                return [2 /*return*/];
        }
    });
}); });
ava_1.default('gets balance', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var balance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                t.true(client.connected);
                return [4 /*yield*/, client.getBalance('KOQXPPXPNJL5RYI4JO37HEBDTMYB7BGT')];
            case 1:
                balance = _a.sent();
                t.true(!balance.error);
                t.true(balance.balance >= 0);
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbmV0d29yay9jbGllbnQuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQkEwQ0E7O0FBMUNBLDRDQUF1QjtBQUN2QixvREFBOEI7QUFFOUIsSUFBSSxNQUFNLEdBQUcsSUFBSSxnQkFBTSxFQUFFLENBQUM7QUFFMUIsYUFBSSxDQUFDLE1BQU0sQ0FBQzs7O29CQUNSLHFCQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQUMsRUFBQTs7Z0JBQTlDLFNBQThDLENBQUM7Ozs7S0FDbEQsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLGtCQUFrQixFQUFFLFVBQU0sQ0FBQzs7OztvQkFDZixxQkFBTSxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUE7O2dCQUFyQyxNQUFNLEdBQUcsU0FBNEI7Z0JBQ3pDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzs7OztLQUM3QixDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsVUFBVSxFQUFFLFVBQU0sQ0FBQzs7Ozs7Z0JBQ3BCLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVaLHFCQUFNLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUE7O2dCQUF2QyxNQUFNLEdBQUcsU0FBOEI7Z0JBQzNDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFFUixxQkFBTSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFBOztnQkFBbkQsV0FBVyxHQUFHLFNBQXFDO2dCQUN2RCxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBRWQscUJBQU0sTUFBTSxDQUFDLGdCQUFnQixFQUFFLEVBQUE7O2dCQUE1QyxVQUFVLEdBQUcsU0FBK0I7Z0JBQ2hELENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxDQUFDOzs7O0tBRTlCLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyxjQUFjLEVBQUUsVUFBTSxDQUFDOzs7OztnQkFDeEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRVgscUJBQU0sTUFBTSxDQUFDLFVBQVUsQ0FBQyxrQ0FBa0MsQ0FBQyxFQUFBOztnQkFBckUsT0FBTyxHQUFHLFNBQTJEO2dCQUN6RSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUN0QixDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7Ozs7S0FRaEMsQ0FBQyxDQUFDIn0=