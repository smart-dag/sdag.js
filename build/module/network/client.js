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
            super.emit('connected');
            if (onOpen)
                onOpen();
        };
        client.onmessage = this.onMessage;
        client.onerror = (err) => super.emit('error', err);
    }
    async connect(address) {
        this.close();
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
        this.sendRequest({ command: 'subscribe', params: { peer_id: id, last_mci: 10, } });
    }
    handleJustsaying(content) {
        if (content.subject === 'joint') {
            this.emit('joint', content.body);
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
        let inputs = await this.getInputs(opts.from, 0, props.last_ball_unit);
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
            author.authentifiers.r = signCallback(unitHash); //this.keyman.sign(unitHash, 0)
        });
        unit.unit = SDAGHash.getUnitHash(JSON.parse(JSON.stringify(unit)));
        let joint = {
            ball: undefined,
            skiplist_units: [],
            unsigned: undefined,
            unit,
        };
        return joint;
    }
    async transfer(opts, signCallback) {
        let joint = await this.composeJoint(opts, signCallback);
        let result = await this.postJoint(joint);
        return {
            joint,
            result,
        };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL25ldHdvcmsvY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFFdEMsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBQzVCLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQztBQUNwQixPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLElBQUksQ0FBQztBQUl4QyxNQUFNLENBQUMsT0FBTyxPQUFPLFNBQVUsU0FBUSxZQUFZO0lBQW5EOztRQUlZLG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQTZDLENBQUM7UUFDdkUsUUFBRyxHQUFHLENBQUMsQ0FBQztRQUNoQixjQUFTLEdBQUcsS0FBSyxDQUFDO1FBbURWLGNBQVMsR0FBRyxDQUFDLEVBQWdCLEVBQUUsRUFBRTtZQUNyQyxJQUFJO2dCQUNBLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRTFDLFFBQVEsSUFBSSxFQUFFO29CQUNWLEtBQUssU0FBUzt3QkFDVixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUM1QixNQUFNO29CQUNWLEtBQUssWUFBWTt3QkFDYixJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQy9CLE1BQU07b0JBQ1YsS0FBSyxVQUFVO3dCQUNYLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzdCLE1BQU07aUJBQ2I7YUFDSjtZQUFDLE9BQU8sS0FBSyxFQUFFO2FBRWY7UUFDTCxDQUFDLENBQUE7SUEwUkwsQ0FBQztJQTdWVyxZQUFZLENBQUMsT0FBZTtRQUNoQyxJQUFJO1lBQ0EsT0FBTyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMs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