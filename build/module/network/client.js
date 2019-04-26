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
        client.onopen = () => {
            this.sendVersion({ protocol_version: '1.0', alt: '1', library: 'rust-dag', library_version: '0.1.0', program: 'sdag-explorer', program_version: '0.1.0' });
            this.connected = true;
            heartbeatTimer = setInterval(() => this.sendHeartbeat(), 3000);
            setTimeout(() => {
                super.emit('connected');
                if (onOpen)
                    onOpen();
            }, 500);
        };
        client.onmessage = this.onMessage;
        client.onerror = (err) => {
            super.emit('error', err.message);
            clearInterval(heartbeatTimer);
            this.connected = false;
            this.emit('server_lost');
            setTimeout(() => {
                this.ws = this.createSocket(this.address);
                this.setup(this.ws);
            }, 3000);
        };
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
            this.sendResponse({ tag: content.tag, response: { peer_id: this.peerId, is_source: false } });
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
    onServerLost(cb) {
        super.addListener('server_lost', cb);
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
    async getCurrentTps() {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'get_current_tps' }, resp => {
                if (!resp)
                    reject('null response');
                resolve(resp.response);
            });
        });
    }
    async getDailyTps() {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'get_daily_tps' }, resp => {
                if (!resp)
                    reject('null response');
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
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL25ldHdvcmsvY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFFdEMsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBQzVCLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQztBQUNwQixPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLElBQUksQ0FBQztBQUd4QyxNQUFNLENBQUMsT0FBTyxPQUFPLFNBQVUsU0FBUSxZQUFZO0lBQW5EOztRQUlZLG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQTZDLENBQUM7UUFDdkUsUUFBRyxHQUFHLENBQUMsQ0FBQztRQUNoQixjQUFTLEdBQUcsS0FBSyxDQUFDO1FBNkRWLGNBQVMsR0FBRyxDQUFDLEVBQWdCLEVBQUUsRUFBRTtZQUNyQyxJQUFJO2dCQUNBLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRTFDLFFBQVEsSUFBSSxFQUFFO29CQUNWLEtBQUssU0FBUzt3QkFDVixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUM1QixNQUFNO29CQUNWLEtBQUssWUFBWTt3QkFDYixJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQy9CLE1BQU07b0JBQ1YsS0FBSyxVQUFVO3dCQUNYLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzdCLE1BQU07aUJBQ2I7YUFDSjtZQUFDLE9BQU8sS0FBSyxFQUFFO2FBRWY7UUFDTCxDQUFDLENBQUE7SUFtV0wsQ0FBQztJQS9hVyxZQUFZLENBQUMsT0FBZTtRQUNoQyxJQUFJO1lBQ0EsT0FBTyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNqQztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osT0FBTyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMxQjtJQUNMLENBQUM7SUFFTyxLQUFLLENBQUMsTUFBc0IsRUFBRSxTQUFxQixTQUFTO1FBQ2hFLElBQUksY0FBNEIsQ0FBQztRQUVqQyxNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTtZQUNqQixJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDM0osSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDdEIsY0FBYyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFL0QsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDWixLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUN4QixJQUFJLE1BQU07b0JBQUUsTUFBTSxFQUFFLENBQUM7WUFDekIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ1osQ0FBQyxDQUFDO1FBRUYsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRWxDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNyQixLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFakMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFekIsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDWixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4QixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDYixDQUFDLENBQUM7SUFDTixDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1FBQ3pCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUViLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDVixNQUFNLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUNoQztRQUVELE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDakUsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsT0FBTyxJQUFJLE9BQU8sQ0FBVSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3BDLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUMsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFO2dCQUNyQixZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3RCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQXNCRCxJQUFJLENBQUMsSUFBMkMsRUFBRSxPQUFZO1FBQzFELElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDdEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUMsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELFdBQVcsQ0FBQyxPQUF3QixFQUFFLFFBQTRDO1FBQzlFLElBQUksR0FBRyxHQUFXLE9BQU8sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztRQUM3RSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUU5QixJQUFJLFFBQVEsRUFBRTtZQUNWLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUMzQztRQUVELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVELGNBQWMsQ0FBQyxPQUEwQjtRQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsWUFBWSxDQUFDLE9BQVk7UUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVELGlCQUFpQixDQUFDLEdBQVEsRUFBRSxLQUFVO1FBQ2xDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRCxTQUFTLENBQUMsT0FBWTtRQUNsQixJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRUQsV0FBVyxDQUFDLElBQW1JO1FBQzNJLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELGFBQWE7UUFDVCxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELGFBQWE7UUFDVCxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUN0RyxDQUFDO0lBRU8sZ0JBQWdCLENBQUMsT0FBNEI7UUFDakQsUUFBUSxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQ3JCLEtBQUssT0FBTztnQkFDUixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsSUFBYSxDQUFDLENBQUM7Z0JBQzFDLE1BQU07WUFFVixLQUFLLFFBQVE7Z0JBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLElBQXFCLENBQUMsQ0FBQztnQkFDMUQsTUFBTTtTQUNiO0lBQ0wsQ0FBQztJQUVPLGFBQWEsQ0FBQyxPQUF3QjtRQUMxQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssV0FBVyxFQUFFO1lBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ2pHO0lBQ0wsQ0FBQztJQUVPLGNBQWMsQ0FBQyxPQUF5QjtRQUU1QyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU87UUFFbkQsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTztRQUV0QixRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELE9BQU8sQ0FBQyxFQUF5QjtRQUM3QixLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsWUFBWSxDQUFDLEVBQWM7UUFDdkIsS0FBSyxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELFFBQVEsQ0FBQyxJQUFZO1FBQ2pCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDM0UsSUFBSSxDQUFDLElBQUk7b0JBQUUsT0FBTyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3hDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxRQUF5QixDQUFBO2dCQUMxQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxjQUFjO1FBQ1YsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNuQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDdkQsSUFBSSxDQUFDLElBQUk7b0JBQUUsT0FBTyxNQUFNLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQXVCLENBQUM7Z0JBQ3hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELFdBQVc7UUFDUCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQzlDLElBQUksQ0FBQyxJQUFJO29CQUFFLE9BQU8sTUFBTSxFQUFFLENBQUM7Z0JBQzNCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQzFCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELGdCQUFnQjtRQUNaLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUNuRCxJQUFJLENBQUMsSUFBSTtvQkFBRSxPQUFPLE1BQU0sRUFBRSxDQUFDO2dCQUMzQixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUMvQixPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDeEIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxVQUFVLENBQUMsT0FBZTtRQUN0QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNuRSxJQUFJLENBQUMsSUFBSTtvQkFBRSxPQUFPLE1BQU0sRUFBRSxDQUFDO2dCQUMzQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBbUIsQ0FBQztnQkFDdkMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsZUFBZSxDQUFDLE9BQWUsRUFBRSxHQUFHLEdBQUcsR0FBRztRQUN0QyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDbEYsSUFBSSxDQUFDLElBQUk7b0JBQUUsT0FBTyxNQUFNLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQWtCLENBQUM7Z0JBQ3pELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELGNBQWMsQ0FBQyxHQUFXO1FBQ3RCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ25FLElBQUksQ0FBQyxJQUFJO29CQUFFLE9BQU8sTUFBTSxFQUFFLENBQUM7Z0JBQzNCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFZLENBQUM7Z0JBQ2hELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELGdCQUFnQixDQUFDLFFBQWdCLEVBQUUsUUFBZ0I7UUFDL0MsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxHQUFHLEVBQUU7WUFDckMsUUFBUSxHQUFHLFFBQVEsR0FBRyxHQUFHLENBQUM7U0FDN0I7UUFFRCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxFQUFFLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDOUcsSUFBSSxDQUFDLElBQUk7b0JBQUUsT0FBTyxNQUFNLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxNQUFNLEdBQUksSUFBNEIsQ0FBQyxRQUFRLENBQUM7Z0JBQ3BELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELFFBQVEsQ0FBQyxPQUFlO1FBQ3BCLE9BQU8sSUFBSSxPQUFPLENBQWEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDL0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ3ZFLElBQUksQ0FBQyxJQUFJO29CQUFFLE9BQU8sTUFBTSxFQUFFLENBQUM7Z0JBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBc0IsQ0FBQyxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFlLEVBQUUsTUFBYyxFQUFFLGdCQUF3QixFQUFFLFNBQVMsR0FBRyxLQUFLO1FBQ3hGLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxHQUFHLE9BQU8sR0FBRyxJQUFJLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RLLElBQUksQ0FBQyxJQUFJO29CQUFFLE9BQU8sTUFBTSxFQUFFLENBQUM7Z0JBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBdUIsQ0FBQyxDQUFDO1lBQzFDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsU0FBUyxDQUFDLEtBQWE7UUFDbkIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNuQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQzlELElBQUksQ0FBQyxJQUFJO29CQUFFLE9BQU8sTUFBTSxFQUFFLENBQUM7Z0JBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0IsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxLQUFLLENBQUMsYUFBYTtRQUNmLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUNwRCxJQUFJLENBQUMsSUFBSTtvQkFBRSxNQUFNLEVBQUUsQ0FBQztnQkFDcEIsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBeUYsRUFBRSxZQUFzQztRQUVoSixJQUFJLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLElBQUksTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRWhGLElBQUksT0FBTyxHQUFHO1lBQ1Y7Z0JBQ0ksT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUNsQixNQUFNLEVBQUUsQ0FBQzthQUNaO1lBQ0Q7Z0JBQ0ksT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUNoQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPO2FBQ2hDO1NBQ0osQ0FBQztRQUdGLElBQUksT0FBTyxHQUFVLENBQUM7Z0JBQ2xCLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDbEIsYUFBYSxFQUFFO29CQUNYLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztpQkFDcEI7YUFDSixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWM7WUFDckIsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztRQUV0RSxJQUFJLGVBQWUsR0FBRztZQUNsQixHQUFHLEVBQUUsU0FBUztZQUNkLGdCQUFnQixFQUFFLFFBQVE7WUFDMUIsWUFBWSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQzVCLE9BQU8sRUFBRTtnQkFDTCxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07Z0JBQ3JCLE9BQU8sRUFBRSxPQUFPO2FBQ25CO1NBQ0osQ0FBQztRQUVGLElBQUksSUFBSSxHQUFHO1lBQ1AsR0FBRyxFQUFFLEdBQUc7WUFDUixPQUFPLEVBQUUsS0FBSztZQUNkLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUztZQUMxQixjQUFjLEVBQUUsS0FBSyxDQUFDLGNBQWM7WUFDcEMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLGlCQUFpQjtZQUMxQyxZQUFZLEVBQUUsS0FBSyxDQUFDLFlBQVk7WUFDaEMsT0FBTztZQUNQLFFBQVEsRUFBRSxDQUFDLGVBQWUsQ0FBQztZQUMzQixrQkFBa0IsRUFBRSxDQUFDO1lBQ3JCLGtCQUFrQixFQUFFLENBQUM7WUFDckIsU0FBUyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDcEQsSUFBSSxFQUFFLFNBQVM7U0FDbEIsQ0FBQztRQUVGLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksV0FBVyxHQUFRO2dCQUNuQixHQUFHLEVBQUUsTUFBTTtnQkFDWCxnQkFBZ0IsRUFBRSxRQUFRO2dCQUMxQixZQUFZLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQzVCLE9BQU8sRUFBRSxJQUFJLENBQUMsR0FBRzthQUNwQixDQUFBO1lBRUQsV0FBVyxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFFLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3RDO1FBRUQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsUUFBUSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFaEYsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQztRQUV6RyxJQUFJLE1BQU0sR0FBRyxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFNUIsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDM0IsZUFBZSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLGVBQWUsQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7UUFHL0UsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDMUIsSUFBSSxRQUFRLElBQUksQ0FBQztnQkFBRSxNQUFNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxRQUFrQixDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVuRSxJQUFJLEtBQUssR0FBRztZQUNSLGNBQWMsRUFBRSxFQUFFO1lBQ2xCLElBQUk7U0FDUCxDQUFBO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBeUYsRUFBRSxZQUFzQztRQUM1SSxJQUFJLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3hELElBQUksTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV6QyxPQUFPO1lBQ0gsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSTtZQUNyQixLQUFLO1lBQ0wsTUFBTTtTQUNULENBQUM7SUFDTixDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU07UUFDUixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQzdDLElBQUksQ0FBQyxJQUFJO29CQUFFLE1BQU0sRUFBRSxDQUFDO2dCQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsS0FBSyxDQUFDLGFBQWE7UUFDZixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDcEQsSUFBSSxDQUFDLElBQUk7b0JBQUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsS0FBSyxDQUFDLFdBQVc7UUFDYixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ2xELElBQUksQ0FBQyxJQUFJO29CQUFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFtQixFQUFFLFFBQXNDO1FBQzdELElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQzFELEtBQUssQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCxLQUFLO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQUUsT0FBTztRQUVyQixJQUFJO1lBQ0EsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtZQUNmLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDekIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN6QixJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDdkIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7U0FDbEI7UUFBQyxPQUFPLEtBQUssRUFBRTtTQUVmO0lBQ0wsQ0FBQztDQUNKIn0=