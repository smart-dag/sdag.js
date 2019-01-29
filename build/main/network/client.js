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
var HubClient = /** @class */ (function (_super) {
    __extends(HubClient, _super);
    function HubClient(address) {
        var _this = _super.call(this) || this;
        _this.pendingRequests = new Map();
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
        address = address.startsWith('ws') ? address : 'ws://' + address;
        _this.address = address;
        return _this;
    }
    HubClient.prototype.setup = function (client, onOpen) {
        var _this = this;
        if (onOpen === void 0) { onOpen = undefined; }
        var heartbeatTimer;
        client.onclose = function () {
            clearInterval(heartbeatTimer);
            _this.ws = new WebSocket(_this.address);
            _this.setup(_this.ws);
        };
        client.onopen = function () {
            _this.sendVersion({ protocol_version: '1.0', alt: '1', library: 'rust-dag', library_version: '0.1.0', program: 'sdag-explorer', program_version: '0.1.0' });
            _this.sendSubscribe();
            _this.connected = true;
            heartbeatTimer = setInterval(function () { return _this.sendHeartbeat(); }, 3000);
            _super.prototype.emit.call(_this, 'connected');
            if (onOpen)
                onOpen();
        };
        client.onmessage = this.onMessage;
    };
    HubClient.prototype.connect = function (address) {
        if (address === void 0) { address = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.ws) {
                    try {
                        this.ws.close();
                        this.ws = null;
                    }
                    catch (ex) { }
                }
                return [2 /*return*/, new Promise(function (resolve) {
                        _this.ws = new WebSocket(address || _this.address);
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
        var rid = content.tag = content.tag || Date.now().toString();
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
        this.sendRequest({ command: 'subscribe', params: { subscription_id: id, last_mci: 10, } });
    };
    HubClient.prototype.handleJustsaying = function (content) {
        if (content.subject === 'joint') {
            this.emit('joint', content.body);
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
    HubClient.prototype.getInputs = function (address, amount, spend_all) {
        var _this = this;
        if (spend_all === void 0) { spend_all = false; }
        return new Promise(function (resolve, reject) {
            _this.sendRequest({ command: 'light/inputs', params: { paid_address: address, total_amount: amount * 1000000 + 1000, is_spend_all: spend_all } }, function (resp) {
                if (!resp)
                    return reject();
                resolve(resp.response);
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
    HubClient.prototype.close = function () {
        this.ws.onclose = null;
        this.ws.onmessage = null;
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.close();
        this.ws = null;
    };
    return HubClient;
}(events_1.EventEmitter));
exports.default = HubClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL25ldHdvcmsvY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQXNDO0FBRXRDLGtEQUE0QjtBQUU1QjtJQUF1Qyw2QkFBWTtJQU8vQyxtQkFBWSxPQUFlO1FBQTNCLFlBQ0ksaUJBQU8sU0FHVjtRQVBPLHFCQUFlLEdBQUcsSUFBSSxHQUFHLEVBQTZDLENBQUM7UUFDL0UsZUFBUyxHQUFHLEtBQUssQ0FBQztRQWdEVixlQUFTLEdBQUcsVUFBQyxFQUFnQjtZQUNqQyxJQUFJO2dCQUNJLElBQUEsd0JBQXFDLEVBQXBDLFlBQUksRUFBRSxlQUE4QixDQUFDO2dCQUUxQyxRQUFRLElBQUksRUFBRTtvQkFDVixLQUFLLFNBQVM7d0JBQ1YsS0FBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDNUIsTUFBTTtvQkFDVixLQUFLLFlBQVk7d0JBQ2IsS0FBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUMvQixNQUFNO29CQUNWLEtBQUssVUFBVTt3QkFDWCxLQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUM3QixNQUFNO2lCQUNiO2FBQ0o7WUFBQyxPQUFPLEtBQUssRUFBRTthQUVmO1FBQ0wsQ0FBQyxDQUFBO1FBOURHLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDakUsS0FBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7O0lBQzNCLENBQUM7SUFFTyx5QkFBSyxHQUFiLFVBQWMsTUFBaUIsRUFBRSxNQUE4QjtRQUEvRCxpQkFvQkM7UUFwQmdDLHVCQUFBLEVBQUEsa0JB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