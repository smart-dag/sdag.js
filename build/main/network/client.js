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
        client.onopen = function () {
            _this.sendVersion({ protocol_version: '1.0', alt: '1', library: 'rust-dag', library_version: '0.1.0', program: 'sdag-explorer', program_version: '0.1.0' });
            _this.connected = true;
            heartbeatTimer = setInterval(function () { return _this.sendHeartbeat(); }, 3000);
            setTimeout(function () {
                _super.prototype.emit.call(_this, 'connected');
                if (onOpen)
                    onOpen();
            }, 500);
        };
        client.onmessage = this.onMessage;
        client.onerror = function (err) {
            _super.prototype.emit.call(_this, 'error', err.message);
            clearInterval(heartbeatTimer);
            _this.connected = false;
            _this.emit('server_lost');
            setTimeout(function () {
                _this.ws = _this.createSocket(_this.address);
                _this.setup(_this.ws);
            }, 3000);
        };
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
            this.sendResponse({ tag: content.tag, response: { peer_id: this.peerId, is_source: false } });
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
    HubClient.prototype.onServerLost = function (cb) {
        _super.prototype.addListener.call(this, 'server_lost', cb);
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
    HubClient.prototype.getCurrentTps = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.sendRequest({ command: 'get_current_tps' }, function (resp) {
                            if (!resp)
                                reject('null response');
                            resolve(resp.response);
                        });
                    })];
            });
        });
    };
    HubClient.prototype.getDailyTps = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.sendRequest({ command: 'get_daily_tps' }, function (resp) {
                            if (!resp)
                                reject('null response');
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
            this.removeAllListeners();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL25ldHdvcmsvY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQXNDO0FBRXRDLGtEQUE0QjtBQUM1QiwwQ0FBb0I7QUFDcEIsd0JBQXdDO0FBR3hDO0lBQXVDLDZCQUFZO0lBQW5EO1FBQUEscUVBd2JDO1FBcGJXLHFCQUFlLEdBQUcsSUFBSSxHQUFHLEVBQTZDLENBQUM7UUFDdkUsU0FBRyxHQUFHLENBQUMsQ0FBQztRQUNoQixlQUFTLEdBQUcsS0FBSyxDQUFDO1FBNkRWLGVBQVMsR0FBRyxVQUFDLEVBQWdCO1lBQ2pDLElBQUk7Z0JBQ0ksSUFBQSx3QkFBcUMsRUFBcEMsWUFBSSxFQUFFLGVBQThCLENBQUM7Z0JBRTFDLFFBQVEsSUFBSSxFQUFFO29CQUNWLEtBQUssU0FBUzt3QkFDVixLQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUM1QixNQUFNO29CQUNWLEtBQUssWUFBWTt3QkFDYixLQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQy9CLE1BQU07b0JBQ1YsS0FBSyxVQUFVO3dCQUNYLEtBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzdCLE1BQU07aUJBQ2I7YUFDSjtZQUFDLE9BQU8sS0FBSyxFQUFFO2FBRWY7UUFDTCxDQUFDLENBQUE7O0lBbVdMLENBQUM7SUEvYVcsZ0NBQVksR0FBcEIsVUFBcUIsT0FBZTtRQUNoQyxJQUFJO1lBQ0EsT0FBTyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNqQztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osT0FBTyxJQUFJLFlBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMxQjtJQUNMLENBQUM7SUFFTyx5QkFBSyxHQUFi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