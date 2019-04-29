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
var client = new client_1.default({ peerId: 'KOQXPPXPNJL5RYI4JO37HEBDTMYB7BGT' });
ava_1.default.before(function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.connect('ws://10.168.1.123:6615')];
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
ava_1.default('get current tps', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var tps;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.getCurrentTps()];
            case 1:
                tps = _a.sent();
                t.true(typeof tps === 'number');
                return [2 /*return*/];
        }
    });
}); });
ava_1.default('get daily tps', function (t) { return __awaiter(_this, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.getDailyTps()];
            case 1:
                data = _a.sent();
                t.deepEqual(data, {});
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbmV0d29yay9jbGllbnQuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQkFtREc7O0FBbkRILDRDQUF1QjtBQUN2QixvREFBOEI7QUFFOUIsSUFBSSxNQUFNLEdBQUcsSUFBSSxnQkFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLGtDQUFrQyxFQUFFLENBQUMsQ0FBQztBQUV4RSxhQUFJLENBQUMsTUFBTSxDQUFDOzs7b0JBQ1IscUJBQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxFQUFBOztnQkFBOUMsU0FBOEMsQ0FBQzs7OztLQUNsRCxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsa0JBQWtCLEVBQUUsVUFBTSxDQUFDOzs7O29CQUNmLHFCQUFNLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBQTs7Z0JBQXJDLE1BQU0sR0FBRyxTQUE0QjtnQkFDekMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDOzs7O0tBQzdCLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyxVQUFVLEVBQUUsVUFBTSxDQUFDOzs7OztnQkFDcEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRVoscUJBQU0sTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBQTs7Z0JBQXZDLE1BQU0sR0FBRyxTQUE4QjtnQkFDM0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUVSLHFCQUFNLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUE7O2dCQUFuRCxXQUFXLEdBQUcsU0FBcUM7Z0JBQ3ZELENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFFZCxxQkFBTSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsRUFBQTs7Z0JBQTVDLFVBQVUsR0FBRyxTQUErQjtnQkFDaEQsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLENBQUM7Ozs7S0FFOUIsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLGNBQWMsRUFBRSxVQUFNLENBQUM7Ozs7O2dCQUN4QixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFWCxxQkFBTSxNQUFNLENBQUMsVUFBVSxDQUFDLGtDQUFrQyxDQUFDLEVBQUE7O2dCQUFyRSxPQUFPLEdBQUcsU0FBMkQ7Z0JBQ3pFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQ3RCLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQzs7OztLQVFoQyxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsaUJBQWlCLEVBQUUsVUFBTSxDQUFDOzs7O29CQUNqQixxQkFBTSxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUE7O2dCQUFsQyxHQUFHLEdBQUcsU0FBNEI7Z0JBQ3RDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFDLENBQUM7Ozs7S0FDbkMsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLGVBQWUsRUFBRSxVQUFNLENBQUM7Ozs7b0JBQ2QscUJBQU0sTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFBOztnQkFBakMsSUFBSSxHQUFHLFNBQTBCO2dCQUNyQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQzs7OztLQUN6QixDQUFDLENBQUMifQ==