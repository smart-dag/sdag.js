import { EventEmitter } from 'events';
import crypto from 'crypto';
import ws from 'ws';
import { SDAGSize, SDAGHash } from '..';
export default class HubClient extends EventEmitter {
    constructor() {
        super(...arguments);
        this.pendingRequests = new Map();
        this.tag = 0;
        this.connected = false;
        this.onMessage = (ev) => {
            try {
                let [type, content] = JSON.parse(ev.data);
                switch (type) {
                    case 'request':
                        this.handleRequest(content);
                        break;
                    case 'justsaying':
                        this.handleJustsaying(content);
                        break;
                    case 'response':
                        this.handleResponse(content);
                        break;
                }
            }
            catch (error) {
            }
        };
    }
    createSocket(address) {
        try {
            return new WebSocket(address);
        }
        catch (error) {
            return new ws(address);
        }
    }
    setup(client, onOpen = undefined) {
        let heartbeatTimer;
        client.onclose = () => {
            clearInterval(heartbeatTimer);
            this.ws = this.createSocket(this.address);
            this.setup(this.ws);
            this.connected = false;
        };
        client.onopen = () => {
            this.sendVersion({ protocol_version: '1.0', alt: '1', library: 'rust-dag', library_version: '0.1.0', program: 'sdag-explorer', program_version: '0.1.0' });
            this.sendSubscribe();
            this.connected = true;
            heartbeatTimer = setInterval(() => this.sendHeartbeat(), 3000);
            setTimeout(() => {
                super.emit('connected');
                if (onOpen)
                    onOpen();
            }, 500);
        };
        client.onmessage = this.onMessage;
        client.onerror = (err) => super.emit('error', err.message);
    }
    async connect(address) {
        this.close();
        if (!address) {
            throw Error('empty address');
        }
        address = address.startsWith('ws') ? address : 'ws://' + address;
        this.address = address;
        return new Promise((resolve) => {
            this.ws = this.createSocket(this.address);
            let timeout = setTimeout(() => resolve(false), 5000);
            this.setup(this.ws, () => {
                clearTimeout(timeout);
                resolve(true);
            });
        });
    }
    send(type, content) {
        if (this.ws.readyState !== this.ws.OPEN)
            return false;
        this.ws.send(JSON.stringify([type, content]));
        return true;
    }
    sendRequest(content, resolver) {
        let rid = content.tag = content.tag || `${Date.now()}_${this.tag++}`;
        this.send('request', content);
        if (resolver) {
            this.pendingRequests.set(rid, resolver);
        }
        return rid;
    }
    sendJustsaying(content) {
        this.send('justsaying', content);
    }
    sendResponse(content) {
        this.send('response', content);
    }
    sendErrorResponse(tag, error) {
        this.sendResponse({ tag, response: { error } });
    }
    sendError(content) {
        this.sendJustsaying({ subject: 'error', body: content });
    }
    sendVersion(body) {
        this.sendJustsaying({ subject: 'version', body });
    }
    sendHeartbeat() {
        this.sendRequest({ command: 'heartbeat', });
    }
    sendSubscribe() {
        let id = crypto.randomBytes(32).toString('hex');
        this.sendRequest({ command: 'subscribe', params: { peer_id: this.peerId || id, last_mci: 10, } });
    }
    handleJustsaying(content) {
        switch (content.subject) {
            case 'joint':
                this.emit('joint', content.body);
                break;
            case 'notify':
                this.emit('NotifyMessage', content.body);
                break;
        }
    }
    handleRequest(content) {
        if (content.command === 'subscribe') {
            let buffer = crypto.randomBytes(15);
            let id = Buffer.from(buffer).toString('hex');
            this.sendResponse({ tag: content.tag, response: { peer_id: id, is_source: false } });
        }
    }
    handleResponse(content) {
        if (!this.pendingRequests.has(content.tag))
            return;
        let resolver = this.pendingRequests.get(content.tag);
        if (!resolver)
            return;
        resolver(content);
    }
    onJoint(cb) {
        super.addListener('joint', cb);
    }
    getJoint(hash) {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'get_joint_by_unit_hash', params: hash }, (resp) => {
                if (!resp)
                    return reject('no response');
                let joint = resp.response;
                resolve(joint);
            });
        });
    }
    getNetworkInfo() {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'get_network_info' }, (resp) => {
                if (!resp)
                    return reject();
                let info = resp.response;
                resolve(info);
            });
        });
    }
    getNetState() {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'net_state' }, resp => {
                if (!resp)
                    return reject();
                let state = resp.response;
                resolve(state);
            });
        });
    }
    getNetStatistics() {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'net_statistics' }, resp => {
                if (!resp)
                    return reject();
                let statistics = resp.response;
                resolve(statistics);
            });
        });
    }
    getBalance(address) {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'get_balance', params: address }, (resp) => {
                if (!resp)
                    return reject();
                let balance = resp.response;
                resolve(balance);
            });
        });
    }
    getTxsByAddress(address, num = 100) {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'light/get_history', params: { address, num } }, (resp) => {
                if (!resp)
                    return reject();
                let txs = resp.response['transactions'];
                resolve(txs);
            });
        });
    }
    getJointsByMci(mci) {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'get_joints_by_mci', params: mci }, resp => {
                if (!resp)
                    return reject();
                let joints = resp.response['joints'];
                resolve(joints);
            });
        });
    }
    getJointsByLevel(minLevel, maxLevel) {
        if (Math.abs(maxLevel - minLevel) > 300) {
            minLevel = maxLevel - 300;
        }
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'get_joints_by_level', params: { max_level: maxLevel, min_level: minLevel } }, resp => {
                if (!resp)
                    return reject();
                let joints = resp.response;
                resolve(joints);
            });
        });
    }
    getProps(address) {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'light/light_props', params: address }, resp => {
                if (!resp)
                    return reject();
                resolve(resp.response);
            });
        });
    }
    async getInputs(address, amount, last_stable_unit, spend_all = false) {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'light/inputs', params: { paid_address: address, total_amount: amount * 1000000 + 1000, is_spend_all: spend_all, last_stable_unit } }, resp => {
                if (!resp)
                    return reject();
                resolve(resp.response);
            });
        });
    }
    postJoint(joint) {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'post_joint', params: joint }, resp => {
                if (!resp)
                    return reject();
                resolve(resp.response);
            });
        });
    }
    async getFreeJoints() {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'get_free_joints' }, resp => {
                if (!resp)
                    reject();
                resolve(resp.response);
            });
        });
    }
    async composeJoint(opts, signCallback) {
        let props = await this.getProps(opts.from);
        let inputs = await this.getInputs(opts.from, opts.amount, props.last_ball_unit);
        let outputs = [
            {
                address: opts.from,
                amount: 0
            },
            {
                address: opts.to,
                amount: opts.amount * 1000000,
            }
        ];
        let authors = [{
                address: opts.from,
                authentifiers: {
                    r: '-'.repeat(88),
                },
            }];
        if (!props.has_definition)
            authors[0].definition = ['sig', { pubkey: opts.signEcdsaPubkey }];
        let payment_message = {
            app: "payment",
            payload_location: "inline",
            payload_hash: "-".repeat(44),
            payload: {
                inputs: inputs.inputs,
                outputs: outputs,
            },
        };
        let unit = {
            alt: '1',
            version: '1.0',
            last_ball: props.last_ball,
            last_ball_unit: props.last_ball_unit,
            witness_list_unit: props.witness_list_unit,
            parent_units: props.parent_units,
            authors,
            messages: [payment_message],
            headers_commission: 0,
            payload_commission: 0,
            timestamp: Number.parseInt((Date.now() / 1000)),
            unit: undefined,
        };
        if (opts.msg) {
            let txt_message = {
                app: 'text',
                payload_location: 'inline',
                payload_hash: "-".repeat(44),
                payload: opts.msg,
            };
            txt_message.payload_hash = SDAGHash.base64HashString(txt_message.payload);
            unit.messages.unshift(txt_message);
        }
        unit.headers_commission = SDAGSize.getHeadersSize(Object.assign({}, unit));
        unit.payload_commission = SDAGSize.getTotalPayloadSize(Object.assign({}, unit));
        let change = inputs.amount - unit.headers_commission - unit.payload_commission - (opts.amount * 1000000);
        if (change < 0)
            return null;
        outputs[0].amount = change;
        payment_message.payload.outputs = outputs.sort((a, b) => a.address > b.address ? 1 : -1);
        payment_message.payload_hash = SDAGHash.getBase64Hash(payment_message.payload);
        let unitHash = SDAGHash.getUnitHashToSign(JSON.parse(JSON.stringify(unit)));
        unit.authors.forEach(author => {
            if (unitHash == 0)
                throw Error('invalid unit hash');
            author.authentifiers.r = signCallback(unitHash);
        });
        unit.unit = SDAGHash.getUnitHash(JSON.parse(JSON.stringify(unit)));
        let joint = {
            skiplist_units: [],
            unit,
        };
        return joint;
    }
    async transfer(opts, signCallback) {
        let joint = await this.composeJoint(opts, signCallback);
        let result = await this.postJoint(joint);
        return {
            hash: joint.unit.unit,
            joint,
            result,
        };
    }
    async getTps() {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'get_tps', }, resp => {
                if (!resp)
                    reject();
                resolve(resp.response);
            });
        });
    }
    watch(addresses, callback) {
        this.sendRequest({ command: 'watch', params: addresses });
        super.addListener('NotifyMessage', callback);
    }
    close() {
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
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL25ldHdvcmsvY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFFdEMsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBQzVCLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQztBQUNwQixPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLElBQUksQ0FBQztBQUd4QyxNQUFNLENBQUMsT0FBTyxPQUFPLFNBQVUsU0FBUSxZQUFZO0lBQW5EOztRQUlZLG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQTZDLENBQUM7UUFDdkUsUUFBRyxHQUFHLENBQUMsQ0FBQztRQUNoQixjQUFTLEdBQUcsS0FBSyxDQUFDO1FBMERWLGNBQVMsR0FBRyxDQUFDLEVBQWdCLEVBQUUsRUFBRTtZQUNyQyxJQUFJO2dCQUNBLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRTFDLFFBQVEsSUFBSSxFQUFFO29CQUNWLEtBQUssU0FBUzt3QkFDVixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUM1QixNQUFNO29CQUNWLEtBQUssWUFBWTt3QkFDYixJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQy9CLE1BQU07b0JBQ1YsS0FBSyxVQUFVO3dCQUNYLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzdCLE1BQU07aUJBQ2I7YUFDSjtZQUFDLE9BQU8sS0FBSyxFQUFFO2FBRWY7UUFDTCxDQUFDLENBQUE7SUE4VUwsQ0FBQztJQXZaVyxZQUFZLENBQUMsT0FBZTtRQUNoQyxJQUFJO1lBQ0EsT0FBTyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMs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