import { EventEmitter } from 'events';
import { Joint, IRequestResponse, IRequestContent, IJustsayingResponse, PropertyJoint, Transaction, Balance, NetworkInfo, LightProps, LightInputs, JointsLevelResponse, JointLevel } from '../types/sdag';
import crypto from 'crypto';
import ws from 'ws';
import { SDAGSize, SDAGHash } from '..';
import { resolve } from 'url';
import { rejects } from 'assert';

export default class HubClient extends EventEmitter {

    private ws: WebSocket | ws;
    private address: string;
    private pendingRequests = new Map<string, (resp?: IRequestResponse) => void>();
    connected = false;

    private createSocket(address: string) {
        try {
            return new WebSocket(address);
        } catch (error) {
            return new ws(address);
        }
    }

    private setup(client: WebSocket | ws, onOpen: () => void = undefined) {
        let heartbeatTimer: NodeJS.Timer;

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

            if (onOpen) onOpen();
        };

        client.onmessage = this.onMessage;

        client.onerror = (err) => super.emit('error', err);
    }

    async connect(address: string) {
        this.close();

        address = address.startsWith('ws') ? address : 'ws://' + address;
        this.address = address;

        return new Promise<boolean>((resolve) => {
            this.ws = this.createSocket(this.address);
            let timeout = setTimeout(() => resolve(false), 5000);
            this.setup(this.ws, () => {
                clearTimeout(timeout);
                resolve(true);
            });
        });
    }

    private onMessage = (ev: MessageEvent) => {
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
        } catch (error) {

        }
    }

    send(type: 'request' | 'justsaying' | 'response', content: any) {
        if (this.ws.readyState !== this.ws.OPEN) return false;
        this.ws.send(JSON.stringify([type, content]));
        return true;
    }

    sendRequest(content: IRequestContent, resolver?: (resp?: IRequestResponse) => void): string {
        let rid: string = content.tag = content.tag || Date.now().toString();
        this.send('request', content);

        if (resolver) {
            this.pendingRequests.set(rid, resolver);
        }

        return rid;
    }

    sendJustsaying(content: { subject, body }) {
        this.send('justsaying', content);
    }

    sendResponse(content: any) {
        this.send('response', content);
    }

    sendErrorResponse(tag: any, error: any) {
        this.sendResponse({ tag, response: { error } });
    }

    sendError(content: any) {
        this.sendJustsaying({ subject: 'error', body: content });
    }

    sendVersion(body: { protocol_version: string, alt: string, library: string, library_version: string, program: string, program_version: string }) {
        this.sendJustsaying({ subject: 'version', body });
    }

    sendHeartbeat() {
        this.sendRequest({ command: 'heartbeat', });
    }

    sendSubscribe() {
        let id = crypto.randomBytes(32).toString('hex');
        this.sendRequest({ command: 'subscribe', params: { peer_id: id, last_mci: 10, } });
    }

    private handleJustsaying(content: IJustsayingResponse) {
        if (content.subject === 'joint') {
            this.emit('joint', content.body as Joint);
        }
    }

    private handleRequest(content: IRequestContent) {
        if (content.command === 'subscribe') {
            let buffer = crypto.randomBytes(15);
            let id = Buffer.from(buffer).toString('hex');
            this.sendResponse({ tag: content.tag, response: { peer_id: id, is_source: false } });
        }
    }

    private handleResponse(content: IRequestResponse) {

        if (!this.pendingRequests.has(content.tag)) return;

        let resolver = this.pendingRequests.get(content.tag);
        if (!resolver) return;

        resolver(content);
    }

    onJoint(cb: (unit: Joint) => void) {
        super.addListener('joint', cb);
    }

    getJoint(hash: string): Promise<PropertyJoint> {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'get_joint_by_unit_hash', params: hash }, (resp) => {
                if (!resp) return reject('no response');
                let joint = resp.response as PropertyJoint
                resolve(joint);
            });
        });
    }

    getNetworkInfo(): Promise<NetworkInfo> {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'get_network_info' }, (resp) => {
                if (!resp) return reject();
                let info = resp.response as NetworkInfo;
                resolve(info);
            });
        });
    }

    getBalance(address: string): Promise<Balance> {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'get_balance', params: address }, (resp) => {
                if (!resp) return reject();
                let balance = resp.response as Balance;
                resolve(balance);
            });
        });
    }

    getTxsByAddress(address: string, num = 100): Promise<Transaction[]> {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'light/get_history', params: { address, num } }, (resp) => {
                if (!resp) return reject();
                let txs = resp.response['transactions'] as Transaction[];
                resolve(txs);
            });
        });
    }

    getJointsByMci(mci: number): Promise<Joint[]> {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'get_joints_by_mci', params: mci }, resp => {
                if (!resp) return reject();
                let joints = resp.response['joints'] as Joint[];
                resolve(joints);
            });
        });
    }

    getJointsByLevel(minLevel: number, maxLevel: number): Promise<JointLevel[][]> {
        if (Math.abs(maxLevel - minLevel) > 300) {
            minLevel = maxLevel - 300;
        }

        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'get_joints_by_level', params: { max_level: maxLevel, min_level: minLevel } }, resp => {
                if (!resp) return reject();
                let joints = (resp as JointsLevelResponse).response;
                resolve(joints);
            });
        });
    }

    getProps(address: string): Promise<LightProps> {
        return new Promise<LightProps>((resolve, reject) => {
            this.sendRequest({ command: 'light/light_props', params: address }, resp => {
                if (!resp) return reject();
                resolve(resp.response as LightProps);
            });
        });
    }

    async getInputs(address: string, amount: number, last_stable_unit: string, spend_all = false): Promise<LightInputs> {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'light/inputs', params: { paid_address: address, total_amount: amount * 1000000 + 1000, is_spend_all: spend_all, last_stable_unit } }, resp => {
                if (!resp) return reject();
                resolve(resp.response as LightInputs);
            });
        });
    }

    postJoint(joint: object): Promise<string> {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'post_joint', params: joint }, resp => {
                if (!resp) return reject();
                resolve(resp.response);
            });
        });
    }

    async getFreeJoints(): Promise<Joint[]> {
        return new Promise((resolve, reject) => {
            this.sendRequest({ command: 'get_free_joints' }, resp => {
                if (!resp) reject();
                resolve(resp.response);
            });
        });
    }

    async composeJoint(opts: { from: string, to: string, amount: number, signEcdsaPubkey: string }, signCallback: (hash: string) => string) {

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


        let authors: any[] = [{
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
            timestamp: Number.parseInt(<any>(Date.now() / 1000)),
            unit: undefined,
        };

        unit.headers_commission = SDAGSize.getHeadersSize(Object.assign({}, unit));
        unit.payload_commission = SDAGSize.getTotalPayloadSize(Object.assign({}, unit));

        let change = inputs.amount - unit.headers_commission - unit.payload_commission - (opts.amount * 1000000);

        if (change < 0) return null;

        outputs[0].amount = change;
        payment_message.payload.outputs = outputs.sort((a, b) => a.address > b.address ? 1 : -1);
        payment_message.payload_hash = SDAGHash.getBase64Hash(payment_message.payload);

        let unitHash = SDAGHash.getUnitHashToSign(JSON.parse(JSON.stringify(unit)));
        unit.authors.forEach(author => {
            if (unitHash == 0) throw Error('invalid unit hash');
            author.authentifiers.r = signCallback(unitHash as string); //this.keyman.sign(unitHash, 0)
        });

        unit.unit = SDAGHash.getUnitHash(JSON.parse(JSON.stringify(unit)));

        let joint = {
            ball: undefined,
            skiplist_units: [],
            unsigned: undefined,
            unit,
        }

        return joint;
    }

    close() {
        if (!this.ws) return;

        try {
            this.ws.close()
            this.ws.onclose = null;
            this.ws.onmessage = null;
            this.ws.onopen = null;
            this.ws.onmessage = null;
            this.ws.onerror = null;
            this.ws = null;
        } catch (error) {

        }
    }
}