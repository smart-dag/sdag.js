"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var crypto_1 = __importDefault(require("crypto"));
var ws_1 = __importDefault(require("ws"));
var __1 = require("..");
var HubClient = /** @class */ (function (_super) {
    __extends(HubClient, _super);
    function HubClient() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.pendingRequests = new Map();
        _this.tag = 0;
        _this.connected = false;
        _this.onMessage = function (ev) {
            try {
                var _a = JSON.parse(ev.data), type = _a[0], content = _a[1];
                switch (type) {
                    case 'request':
                        _this.handleRequest(content);
                        break;
                    case 'justsaying':
                        _this.handleJustsaying(content);
                        break;
                    case 'response':
                        _this.handleResponse(content);
                        break;
                }
            }
            catch (error) {
            }
        };
        return _this;
    }
    HubClient.prototype.createSocket = function (address) {
        try {
            return new WebSocket(address);
        }
        catch (error) {
            return new ws_1.default(address);
        }
    };
    HubClient.prototype.setup = function (client, onOpen) {
        var _this = this;
        if (onOpen === void 0) { onOpen = undefined; }
        var heartbeatTimer;
        client.onclose = function () {
            clearInterval(heartbeatTimer);
            _this.ws = _this.createSocket(_this.address);
            _this.setup(_this.ws);
            _this.connected = false;
        };
        client.onopen = function () {
            _this.sendVersion({ protocol_version: '1.0', alt: '1', library: 'rust-dag', library_version: '0.1.0', program: 'sdag-explorer', program_version: '0.1.0' });
            _this.sendSubscribe();
            _this.connected = true;
            heartbeatTimer = setInterval(function () { return _this.sendHeartbeat(); }, 3000);
            setTimeout(function () {
                _super.prototype.emit.call(_this, 'connected');
                if (onOpen)
                    onOpen();
            }, 500);
        };
        client.onmessage = this.onMessage;
        client.onerror = function (err) { return _super.prototype.emit.call(_this, 'error', err.message); };
    };
    HubClient.prototype.connect = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.close();
                if (!address) {
                    throw Error('empty address');
                }
                address = address.startsWith('ws') ? address : 'ws://' + address;
                this.address = address;
                return [2 /*return*/, new Promise(function (resolve) {
                        _this.ws = _this.createSocket(_this.address);
                        var timeout = setTimeout(function () { return resolve(false); }, 5000);
                        _this.setup(_this.ws, function () {
                            clearTimeout(timeout);
                            resolve(true);
                        });
                    })];
            });
        });
    };
    HubClient.prototype.send = function (type, content) {
        if (this.ws.readyState !== this.ws.OPEN)
            return false;
        this.ws.send(JSON.stringify([type, content]));
        return true;
    };
    HubClient.prototype.sendRequest = function (content, resolver) {
        var rid = content.tag = content.tag || Date.now() + "_" + this.tag++;
        this.send('request', content);
        if (resolver) {
            this.pendingRequests.set(rid, resolver);
        }
        return rid;
    };
    HubClient.prototype.sendJustsaying = function (content) {
        this.send('justsaying', content);
    };
    HubClient.prototype.sendResponse = function (content) {
        this.send('response', content);
    };
    HubClient.prototype.sendErrorResponse = function (tag, error) {
        this.sendResponse({ tag: tag, response: { error: error } });
    };
    HubClient.prototype.sendError = function (content) {
        this.sendJustsaying({ subject: 'error', body: content });
    };
    HubClient.prototype.sendVersion = function (body) {
        this.sendJustsaying({ subject: 'version', body: body });
    };
    HubClient.prototype.sendHeartbeat = function () {
        this.sendRequest({ command: 'heartbeat', });
    };
    HubClient.prototype.sendSubscribe = function () {
        var id = crypto_1.default.randomBytes(32).toString('hex');
        this.sendRequest({ command: 'subscribe', params: { peer_id: this.peerId || id, last_mci: 10, } });
    };
    HubClient.prototype.handleJustsaying = function (content) {
        switch (content.subject) {
            case 'joint':
                this.emit('joint', content.body);
                break;
            case 'notify':
                this.emit('NotifyMessage', content.body);
                break;
        }
    };
    HubClient.prototype.handleRequest = function (content) {
        if (content.command === 'subscribe') {
            var buffer = crypto_1.default.randomBytes(15);
            var id = Buffer.from(buffer).toString('hex');
            this.sendResponse({ tag: content.tag, response: { peer_id: id, is_source: false } });
        }
    };
    HubClient.prototype.handleResponse = function (content) {
        if (!this.pendingRequests.has(content.tag))
            return;
        var resolver = this.pendingRequests.get(content.tag);
        if (!resolver)
            return;
        resolver(content);
    };
    HubClient.prototype.onJoint = function (cb) {
        _super.prototype.addListener.call(this, 'joint', cb);
    };
    HubClient.prototype.getJoint = function (hash) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.sendRequest({ command: 'get_joint_by_unit_hash', params: hash }, function (resp) {
                if (!resp)
                    return reject('no response');
                var joint = resp.response;
                resolve(joint);
            });
        });
    };
    HubClient.prototype.getNetworkInfo = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.sendRequest({ command: 'get_network_info' }, function (resp) {
                if (!resp)
                    return reject();
                var info = resp.response;
                resolve(info);
            });
        });
    };
    HubClient.prototype.getNetState = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.sendRequest({ command: 'net_state' }, function (resp) {
                if (!resp)
                    return reject();
                var state = resp.response;
                resolve(state);
            });
        });
    };
    HubClient.prototype.getNetStatistics = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.sendRequest({ command: 'net_statistics' }, function (resp) {
                if (!resp)
                    return reject();
                var statistics = resp.response;
                resolve(statistics);
            });
        });
    };
    HubClient.prototype.getBalance = function (address) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.sendRequest({ command: 'get_balance', params: address }, function (resp) {
                if (!resp)
                    return reject();
                var balance = resp.response;
                resolve(balance);
            });
        });
    };
    HubClient.prototype.getTxsByAddress = function (address, num) {
        var _this = this;
        if (num === void 0) { num = 100; }
        return new Promise(function (resolve, reject) {
            _this.sendRequest({ command: 'light/get_history', params: { address: address, num: num } }, function (resp) {
                if (!resp)
                    return reject();
                var txs = resp.response['transactions'];
                resolve(txs);
            });
        });
    };
    HubClient.prototype.getJointsByMci = function (mci) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.sendRequest({ command: 'get_joints_by_mci', params: mci }, function (resp) {
                if (!resp)
                    return reject();
                var joints = resp.response['joints'];
                resolve(joints);
            });
        });
    };
    HubClient.prototype.getJointsByLevel = function (minLevel, maxLevel) {
        var _this = this;
        if (Math.abs(maxLevel - minLevel) > 300) {
            minLevel = maxLevel - 300;
        }
        return new Promise(function (resolve, reject) {
            _this.sendRequest({ command: 'get_joints_by_level', params: { max_level: maxLevel, min_level: minLevel } }, function (resp) {
                if (!resp)
                    return reject();
                var joints = resp.response;
                resolve(joints);
            });
        });
    };
    HubClient.prototype.getProps = function (address) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.sendRequest({ command: 'light/light_props', params: address }, function (resp) {
                if (!resp)
                    return reject();
                resolve(resp.response);
            });
        });
    };
    HubClient.prototype.getInputs = function (address, amount, last_stable_unit, spend_all) {
        if (spend_all === void 0) { spend_all = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.sendRequest({ command: 'light/inputs', params: { paid_address: address, total_amount: amount * 1000000 + 1000, is_spend_all: spend_all, last_stable_unit: last_stable_unit } }, function (resp) {
                            if (!resp)
                                return reject();
                            resolve(resp.response);
                        });
                    })];
            });
        });
    };
    HubClient.prototype.postJoint = function (joint) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.sendRequest({ command: 'post_joint', params: joint }, function (resp) {
                if (!resp)
                    return reject();
                resolve(resp.response);
            });
        });
    };
    HubClient.prototype.getFreeJoints = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.sendRequest({ command: 'get_free_joints' }, function (resp) {
                            if (!resp)
                                reject();
                            resolve(resp.response);
                        });
                    })];
            });
        });
    };
    HubClient.prototype.composeJoint = function (opts, signCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var props, inputs, outputs, authors, payment_message, unit, txt_message, change, unitHash, joint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getProps(opts.from)];
                    case 1:
                        props = _a.sent();
                        return [4 /*yield*/, this.getInputs(opts.from, opts.amount, props.last_ball_unit)];
                    case 2:
                        inputs = _a.sent();
                        outputs = [
                            {
                                address: opts.from,
                                amount: 0
                            },
                            {
                                address: opts.to,
                                amount: opts.amount * 1000000,
                            }
                        ];
                        authors = [{
                                address: opts.from,
                                authentifiers: {
                                    r: '-'.repeat(88),
                                },
                            }];
                        if (!props.has_definition)
                            authors[0].definition = ['sig', { pubkey: opts.signEcdsaPubkey }];
                        payment_message = {
                            app: "payment",
                            payload_location: "inline",
                            payload_hash: "-".repeat(44),
                            payload: {
                                inputs: inputs.inputs,
                                outputs: outputs,
                            },
                        };
                        unit = {
                            alt: '1',
                            version: '1.0',
                            last_ball: props.last_ball,
                            last_ball_unit: props.last_ball_unit,
                            witness_list_unit: props.witness_list_unit,
                            parent_units: props.parent_units,
                            authors: authors,
                            messages: [payment_message],
                            headers_commission: 0,
                            payload_commission: 0,
                            timestamp: Number.parseInt((Date.now() / 1000)),
                            unit: undefined,
                        };
                        if (opts.msg) {
                            txt_message = {
                                app: 'text',
                                payload_location: 'inline',
                                payload_hash: "-".repeat(44),
                                payload: opts.msg,
                            };
                            txt_message.payload_hash = __1.SDAGHash.base64HashString(txt_message.payload);
                            unit.messages.unshift(txt_message);
                        }
                        unit.headers_commission = __1.SDAGSize.getHeadersSize(Object.assign({}, unit));
                        unit.payload_commission = __1.SDAGSize.getTotalPayloadSize(Object.assign({}, unit));
                        change = inputs.amount - unit.headers_commission - unit.payload_commission - (opts.amount * 1000000);
                        if (change < 0)
                            return [2 /*return*/, null];
                        outputs[0].amount = change;
                        payment_message.payload.outputs = outputs.sort(function (a, b) { return a.address > b.address ? 1 : -1; });
                        payment_message.payload_hash = __1.SDAGHash.getBase64Hash(payment_message.payload);
                        unitHash = __1.SDAGHash.getUnitHashToSign(JSON.parse(JSON.stringify(unit)));
                        unit.authors.forEach(function (author) {
                            if (unitHash == 0)
                                throw Error('invalid unit hash');
                            author.authentifiers.r = signCallback(unitHash);
                        });
                        unit.unit = __1.SDAGHash.getUnitHash(JSON.parse(JSON.stringify(unit)));
                        joint = {
                            skiplist_units: [],
                            unit: unit,
                        };
                        return [2 /*return*/, joint];
                }
            });
        });
    };
    HubClient.prototype.transfer = function (opts, signCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var joint, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.composeJoint(opts, signCallback)];
                    case 1:
                        joint = _a.sent();
                        return [4 /*yield*/, this.postJoint(joint)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, {
                                hash: joint.unit.unit,
                                joint: joint,
                                result: result,
                            }];
                }
            });
        });
    };
    HubClient.prototype.getTps = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.sendRequest({ command: 'get_tps', }, function (resp) {
                            if (!resp)
                                reject();
                            resolve(resp.response);
                        });
                    })];
            });
        });
    };
    HubClient.prototype.watch = function (addresses, callback) {
        this.sendRequest({ command: 'watch', params: addresses });
        _super.prototype.addListener.call(this, 'NotifyMessage', callback);
    };
    HubClient.prototype.close = function () {
        if (!this.ws)
            return;
        try {
            this.ws.close();
            this.ws.onclose = null;
            this.ws.onmessage = null;
            this.ws.onopen = null;
            this.ws.onmessage = null;
            this.ws.onerror = null;
            this.ws = null;
        }
        catch (error) {
        }
    };
    return HubClient;
}(events_1.EventEmitter));
exports.default = HubClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL25ldHdvcmsvY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQXNDO0FBRXRDLGtEQUE0QjtBQUM1QiwwQ0FBb0I7QUFDcEIsd0JBQXdDO0FBR3hDO0lBQXVDLDZCQUFZO0lBQW5EO1FBQUEscUVBZ2FDO1FBNVpXLHFCQUFlLEdBQUcsSUFBSSxHQUFHLEVBQTZDLENBQUM7UUFDdkUsU0FBRyxHQUFHLENBQUMsQ0FBQztRQUNoQixlQUFTLEdBQUcsS0FBSyxDQUFDO1FBMERWLGVBQVMsR0FBRyxVQUFDLEVBQWdCO1lBQ2pDLElBQUk7Z0JBQ0ksSUFBQSx3QkFBcUMsRUFBcEMsWUFBSSxFQUFFLGVBQThCLENBQUM7Z0JBRTFDLFFBQVEsSUFBSSxFQUFFO29CQUNWLEtBQUssU0FBUzt3QkFDVixLQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUM1QixNQUFNO29CQUNWLEtBQUssWUFBWTt3QkFDYixLQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQy9CLE1BQU07b0JBQ1YsS0FBSyxVQUFVO3dCQUNYLEtBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzdCLE1BQU07aUJBQ2I7YUFDSjtZQUFDLE9BQU8sS0FBSyxFQUFFO2FBRWY7UUFDTCxDQUFDLENBQUE7O0lBOFVMLENBQUM7SUF2WlcsZ0NBQVksR0FBcEIsVUFBcUIsT0FBZTtRQUNoQyxJQUFJO1lBQ0EsT0FBTyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNqQztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osT0FBTyxJQUFJLFlBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMxQjtJQUNMLENBQUM7SUFFTyx5QkFBSyxHQUFiLFVBQWMsTUFBc0IsRUFBRSxNQUE4QjtRQUFwRSxpQkF5QkM7UUF6QnFDLHVCQUFBLEVBQUEsa0JBQThCO1FBQ2hFLElBQUksY0FBNEIsQ0FBQztRQUVqQyxNQUFNLENBQUMsT0FBTyxHQUFHO1lBQ2IsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzlCLEtBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSSxDQUFDLFlBQVksQ0FBQyxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUMsS0FBSSxDQUFDLEtBQUssQ0FBQyxLQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDcEIsS0FBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDM0IsQ0FBQyxDQUFDO1FBRUYsTUFBTSxDQUFDLE1BQU0sR0FBRztZQUNaLEtBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUMzSixLQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDckIsS0FBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDdEIsY0FBYyxHQUFHLFdBQVcsQ0FBQyxjQUFNLE9BQUEsS0FBSSxDQUFDLGFBQWEsRUFBRSxFQUFwQixDQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBRS9ELFVBQVUsQ0FBQztnQkFDUCxpQkFBTSxJQUFJLGFBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3hCLElBQUksTUFBTTtvQkFBRSxNQUFNLEVBQUUsQ0FBQztZQUN6QixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDWixDQUFDLENBQUM7UUFFRixNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFbEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFDLEdBQUcsSUFBSyxPQUFBLGlCQUFNLElBQUksYUFBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFoQyxDQUFnQyxDQUFDO0lBQy9ELENBQUM7SUFFSywyQkFBTyxHQUFiLFVBQWMsT0FBZTs7OztnQkFDekIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUViLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ1YsTUFBTSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7aUJBQ2hDO2dCQUVELE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7Z0JBQ2pFLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO2dCQUV2QixzQkFBTyxJQUFJLE9BQU8sQ0FBVSxVQUFDLE9BQU87d0JBQ2hDLEtBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSSxDQUFDLFlBQVksQ0FBQyxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzFDLElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxjQUFNLE9BQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFkLENBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFDckQsS0FBSSxDQUFDLEtBQUssQ0FBQyxLQUFJLENBQUMsRUFBRSxFQUFFOzRCQUNoQixZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7NEJBQ3RCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDbEIsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLEVBQUM7OztLQUNOO0lBc0JELHdCQUFJLEdBQUosVUFBSyxJQUEyQyxFQUFFLE9BQVk7UUFDMUQsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsS0FBSyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUk7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUN0RCxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsK0JBQVcsR0FBWCxVQUFZLE9BQXdCLEVBQUUsUUFBNEM7UUFDOUUsSUFBSSxHQUFHLEdBQVcsT0FBTyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxJQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsU0FBSSxJQUFJLENBQUMsR0FBRyxFQUFJLENBQUM7UUFDN0UsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFOUIsSUFBSSxRQUFRLEVBQUU7WUFDVixJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDM0M7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRCxrQ0FBYyxHQUFkLFVBQWUsT0FBMEI7UUFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELGdDQUFZLEdBQVosVUFBYSxPQUFZO1FBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxxQ0FBaUIsR0FBakIsVUFBa0IsR0FBUSxFQUFFLEtBQVU7UUFDbEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLEdBQUcsS0FBQSxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssT0FBQSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRCw2QkFBUyxHQUFULFVBQVUsT0FBWTtRQUNsQixJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRUQsK0JBQVcsR0FBWCxVQUFZLElBQW1JO1FBQzNJLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksTUFBQSxFQUFFLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsaUNBQWEsR0FBYjtRQUNJLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsV0FBVyxHQUFHLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsaUNBQWEsR0FBYjtRQUNJLElBQUksRUFBRSxHQUFHLGdCQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUN0RyxDQUFDO0lBRU8sb0NBQWdCLEdBQXhCLFVBQXlCLE9BQTRCO1FBQ2pELFFBQVEsT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUNyQixLQUFLLE9BQU87Z0JBQ1IsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLElBQWEsQ0FBQyxDQUFDO2dCQUMxQyxNQUFNO1lBRVYsS0FBSyxRQUFRO2dCQUNULElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxJQUFxQixDQUFDLENBQUM7Z0JBQzFELE1BQU07U0FDYjtJQUNMLENBQUM7SUFFTyxpQ0FBYSxHQUFyQixVQUFzQixPQUF3QjtRQUMxQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssV0FBVyxFQUFFO1lBQ2pDLElBQUksTUFBTSxHQUFHLGdCQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BDLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDeEY7SUFDTCxDQUFDO0lBRU8sa0NBQWMsR0FBdEIsVUFBdUIsT0FBeUI7UUFFNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFBRSxPQUFPO1FBRW5ELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsUUFBUTtZQUFFLE9BQU87UUFFdEIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFRCwyQkFBTyxHQUFQLFVBQVEsRUFBeUI7UUFDN0IsaUJBQU0sV0FBVyxZQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsNEJBQVEsR0FBUixVQUFTLElBQVk7UUFBckIsaUJBUUM7UUFQRyxPQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU07WUFDL0IsS0FBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsVUFBQyxJQUFJO2dCQUN2RSxJQUFJLENBQUMsSUFBSTtvQkFBRSxPQUFPLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDeEMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQXlCLENBQUE7Z0JBQzFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELGtDQUFjLEdBQWQ7UUFBQSxpQkFRQztRQVBHLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtZQUMvQixLQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLEVBQUUsVUFBQyxJQUFJO2dCQUNuRCxJQUFJLENBQUMsSUFBSTtvQkFBRSxPQUFPLE1BQU0sRUFBRSxDQUFDO2dCQUMzQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsUUFBdUIsQ0FBQztnQkFDeEMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsK0JBQVcsR0FBWDtRQUFBLGlCQVFDO1FBUEcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQy9CLEtBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLEVBQUUsVUFBQSxJQUFJO2dCQUMzQyxJQUFJLENBQUMsSUFBSTtvQkFBRSxPQUFPLE1BQU0sRUFBRSxDQUFDO2dCQUMzQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUMxQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxvQ0FBZ0IsR0FBaEI7UUFBQSxpQkFRQztRQVBHLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtZQUMvQixLQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLEVBQUUsVUFBQSxJQUFJO2dCQUNoRCxJQUFJLENBQUMsSUFBSTtvQkFBRSxPQUFPLE1BQU0sRUFBRSxDQUFDO2dCQUMzQixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUMvQixPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDeEIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCw4QkFBVSxHQUFWLFVBQVcsT0FBZTtRQUExQixpQkFRQztRQVBHLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtZQUMvQixLQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUUsVUFBQyxJQUFJO2dCQUMvRCxJQUFJLENBQUMsSUFBSTtvQkFBRSxPQUFPLE1BQU0sRUFBRSxDQUFDO2dCQUMzQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBbUIsQ0FBQztnQkFDdkMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsbUNBQWUsR0FBZixVQUFnQixPQUFlLEVBQUUsR0FBUztRQUExQyxpQkFRQztRQVJnQyxvQkFBQSxFQUFBLFNBQVM7UUFDdEMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQy9CLEtBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxFQUFFLEVBQUUsT0FBTyxTQUFBLEVBQUUsR0FBRyxLQUFBLEVBQUUsRUFBRSxFQUFFLFVBQUMsSUFBSTtnQkFDOUUsSUFBSSxDQUFDLElBQUk7b0JBQUUsT0FBTyxNQUFNLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQWtCLENBQUM7Z0JBQ3pELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELGtDQUFjLEdBQWQsVUFBZSxHQUFXO1FBQTFCLGlCQVFDO1FBUEcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQy9CLEtBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLFVBQUEsSUFBSTtnQkFDaEUsSUFBSSxDQUFDLElBQUk7b0JBQUUsT0FBTyxNQUFNLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQVksQ0FBQztnQkFDaEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsb0NBQWdCLEdBQWhCLFVBQWlCLFFBQWdCLEVBQUUsUUFBZ0I7UUFBbkQsaUJBWUM7UUFYRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLEdBQUcsRUFBRTtZQUNyQyxRQUFRLEdBQUcsUUFBUSxHQUFHLEdBQUcsQ0FBQztTQUM3QjtRQUVELE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtZQUMvQixLQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsVUFBQSxJQUFJO2dCQUMzRyxJQUFJLENBQUMsSUFBSTtvQkFBRSxPQUFPLE1BQU0sRUFBRSxDQUFDO2dCQUMzQixJQUFJLE1BQU0sR0FBSSxJQUE0QixDQUFDLFFBQVEsQ0FBQztnQkFDcEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsNEJBQVEsR0FBUixVQUFTLE9BQWU7UUFBeEIsaUJBT0M7UUFORyxPQUFPLElBQUksT0FBTyxDQUFhLFVBQUMsT0FBTyxFQUFFLE1BQU07WUFDM0MsS0FBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUUsVUFBQSxJQUFJO2dCQUNwRSxJQUFJLENBQUMsSUFBSTtvQkFBRSxPQUFPLE1BQU0sRUFBRSxDQUFDO2dCQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLFFBQXNCLENBQUMsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVLLDZCQUFTLEdBQWYsVUFBZ0IsT0FBZSxFQUFFLE1BQWMsRUFBRSxnQkFBd0IsRUFBRSxTQUFpQjtRQUFqQiwwQkFBQSxFQUFBLGlCQUFpQjs7OztnQkFDeEYsc0JBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTt3QkFDL0IsS0FBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxHQUFHLE9BQU8sR0FBRyxJQUFJLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxnQkFBZ0Isa0JBQUEsRUFBRSxFQUFFLEVBQUUsVUFBQSxJQUFJOzRCQUNuSyxJQUFJLENBQUMsSUFBSTtnQ0FBRSxPQUFPLE1BQU0sRUFBRSxDQUFDOzRCQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLFFBQXVCLENBQUMsQ0FBQzt3QkFDMUMsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLEVBQUM7OztLQUNOO0lBRUQsNkJBQVMsR0FBVCxVQUFVLEtBQWE7UUFBdkIsaUJBT0M7UUFORyxPQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU07WUFDL0IsS0FBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLFVBQUEsSUFBSTtnQkFDM0QsSUFBSSxDQUFDLElBQUk7b0JBQUUsT0FBTyxNQUFNLEVBQUUsQ0FBQztnQkFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVLLGlDQUFhLEdBQW5COzs7O2dCQUNJLHNCQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU07d0JBQy9CLEtBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxVQUFBLElBQUk7NEJBQ2pELElBQUksQ0FBQyxJQUFJO2dDQUFFLE1BQU0sRUFBRSxDQUFDOzRCQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUMzQixDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsRUFBQzs7O0tBQ047SUFFSyxnQ0FBWSxHQUFsQixVQUFtQixJQUF5RixFQUFFLFlBQXNDOzs7Ozs0QkFFcEkscUJBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUE7O3dCQUF0QyxLQUFLLEdBQUcsU0FBOEI7d0JBQzdCLHFCQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsRUFBQTs7d0JBQTNFLE1BQU0sR0FBRyxTQUFrRTt3QkFFM0UsT0FBTyxHQUFHOzRCQUNWO2dDQUNJLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSTtnQ0FDbEIsTUFBTSxFQUFFLENBQUM7NkJBQ1o7NEJBQ0Q7Z0NBQ0ksT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFO2dDQUNoQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPOzZCQUNoQzt5QkFDSixDQUFDO3dCQUdFLE9BQU8sR0FBVSxDQUFDO2dDQUNsQixPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUk7Z0NBQ2xCLGFBQWEsRUFBRTtvQ0FDWCxDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7aUNBQ3BCOzZCQUNKLENBQUMsQ0FBQzt3QkFFSCxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWM7NEJBQ3JCLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7d0JBRWxFLGVBQWUsR0FBRzs0QkFDbEIsR0FBRyxFQUFFLFNBQVM7NEJBQ2QsZ0JBQWdCLEVBQUUsUUFBUTs0QkFDMUIsWUFBWSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDOzRCQUM1QixPQUFPLEVBQUU7Z0NBQ0wsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNO2dDQUNyQixPQUFPLEVBQUUsT0FBTzs2QkFDbkI7eUJBQ0osQ0FBQzt3QkFFRSxJQUFJLEdBQUc7NEJBQ1AsR0FBRyxFQUFFLEdBQUc7NEJBQ1IsT0FBTyxFQUFFLEtBQUs7NEJBQ2QsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTOzRCQUMxQixjQUFjLEVBQUUsS0FBSyxDQUFDLGNBQWM7NEJBQ3BDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxpQkFBaUI7NEJBQzFDLFlBQVksRUFBRSxLQUFLLENBQUMsWUFBWTs0QkFDaEMsT0FBTyxTQUFBOzRCQUNQLFFBQVEsRUFBRSxDQUFDLGVBQWUsQ0FBQzs0QkFDM0Isa0JBQWtCLEVBQUUsQ0FBQzs0QkFDckIsa0JBQWtCLEVBQUUsQ0FBQzs0QkFDckIsU0FBUyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7NEJBQ3BELElBQUksRUFBRSxTQUFTO3lCQUNsQixDQUFDO3dCQUVGLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTs0QkFDTixXQUFXLEdBQVE7Z0NBQ25CLEdBQUcsRUFBRSxNQUFNO2dDQUNYLGdCQUFnQixFQUFFLFFBQVE7Z0NBQzFCLFlBQVksRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQ0FDNUIsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHOzZCQUNwQixDQUFBOzRCQUVELFdBQVcsQ0FBQyxZQUFZLEdBQUcsWUFBUSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFDMUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7eUJBQ3RDO3dCQUVELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxZQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQzNFLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxZQUFRLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFFNUUsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUM7d0JBRXpHLElBQUksTUFBTSxHQUFHLENBQUM7NEJBQUUsc0JBQU8sSUFBSSxFQUFDO3dCQUU1QixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzt3QkFDM0IsZUFBZSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQTlCLENBQThCLENBQUMsQ0FBQzt3QkFDekYsZUFBZSxDQUFDLFlBQVksR0FBRyxZQUFRLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFHM0UsUUFBUSxHQUFHLFlBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUM1RSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU07NEJBQ3ZCLElBQUksUUFBUSxJQUFJLENBQUM7Z0NBQUUsTUFBTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs0QkFDcEQsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLFFBQWtCLENBQUMsQ0FBQzt3QkFDOUQsQ0FBQyxDQUFDLENBQUM7d0JBRUgsSUFBSSxDQUFDLElBQUksR0FBRyxZQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBRS9ELEtBQUssR0FBRzs0QkFDUixjQUFjLEVBQUUsRUFBRTs0QkFDbEIsSUFBSSxNQUFBO3lCQUNQLENBQUE7d0JBRUQsc0JBQU8sS0FBSyxFQUFDOzs7O0tBQ2hCO0lBRUssNEJBQVEsR0FBZCxVQUFlLElBQXlGLEVBQUUsWUFBc0M7Ozs7OzRCQUNoSSxxQkFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsRUFBQTs7d0JBQW5ELEtBQUssR0FBRyxTQUEyQzt3QkFDMUMscUJBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBQTs7d0JBQXBDLE1BQU0sR0FBRyxTQUEyQjt3QkFFeEMsc0JBQU87Z0NBQ0gsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSTtnQ0FDckIsS0FBSyxPQUFBO2dDQUNMLE1BQU0sUUFBQTs2QkFDVCxFQUFDOzs7O0tBQ0w7SUFFSywwQkFBTSxHQUFaOzs7O2dCQUNJLHNCQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU07d0JBQy9CLEtBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxHQUFHLEVBQUUsVUFBQSxJQUFJOzRCQUMxQyxJQUFJLENBQUMsSUFBSTtnQ0FBRSxNQUFNLEVBQUUsQ0FBQzs0QkFDcEIsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDM0IsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLEVBQUM7OztLQUNOO0lBRUQseUJBQUssR0FBTCxVQUFNLFNBQW1CLEVBQUUsUUFBc0M7UUFDN0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDMUQsaUJBQU0sV0FBVyxZQUFDLGVBQWUsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQseUJBQUssR0FBTDtRQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUFFLE9BQU87UUFFckIsSUFBSTtZQUNBLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUE7WUFDZixJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDdkIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDekIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO1NBQ2xCO1FBQUMsT0FBTyxLQUFLLEVBQUU7U0FFZjtJQUNMLENBQUM7SUFDTCxnQkFBQztBQUFELENBQUMsQUFoYUQsQ0FBdUMscUJBQVksR0FnYWxEIn0=