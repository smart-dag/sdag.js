/// <reference types="node" />
import { EventEmitter } from 'events';
import { Joint, NetState, Tps, NetStatistics, NotifyMessage, IRequestResponse, IRequestContent, PropertyJoint, Transaction, Balance, NetworkInfo, LightProps, LightInputs, JointLevel } from '../types/sdag';
export default class HubClient extends EventEmitter {
    private ws;
    private address;
    private pendingRequests;
    private tag;
    connected: boolean;
    peerId?: string;
    private createSocket;
    private setup;
    connect(address: string): Promise<boolean>;
    private onMessage;
    send(type: 'request' | 'justsaying' | 'response', content: any): boolean;
    sendRequest(content: IRequestContent, resolver?: (resp?: IRequestResponse) => void): string;
    sendJustsaying(content: {
        subject: any;
        body: any;
    }): void;
    sendResponse(content: any): void;
    sendErrorResponse(tag: any, error: any): void;
    sendError(content: any): void;
    sendVersion(body: {
        protocol_version: string;
        alt: string;
        library: string;
        library_version: string;
        program: string;
        program_version: string;
    }): void;
    sendHeartbeat(): void;
    sendSubscribe(): void;
    private handleJustsaying;
    private handleRequest;
    private handleResponse;
    onJoint(cb: (unit: Joint) => void): void;
    getJoint(hash: string): Promise<PropertyJoint>;
    getNetworkInfo(): Promise<NetworkInfo>;
    getNetState(): Promise<NetState>;
    getNetStatistics(): Promise<NetStatistics>;
    getBalance(address: string): Promise<Balance>;
    getTxsByAddress(address: string, num?: number): Promise<Transaction[]>;
    getJointsByMci(mci: number): Promise<Joint[]>;
    getJointsByLevel(minLevel: number, maxLevel: number): Promise<JointLevel[][]>;
    getProps(address: string): Promise<LightProps>;
    getInputs(address: string, amount: number, last_stable_unit: string, spend_all?: boolean): Promise<LightInputs>;
    postJoint(joint: object): Promise<string>;
    getFreeJoints(): Promise<Joint[]>;
    composeJoint(opts: {
        from: string;
        to: string;
        amount: number;
        signEcdsaPubkey: string;
        msg?: string;
    }, signCallback: (hash: string) => string): Promise<{
        skiplist_units: any[];
        unit: {
            alt: string;
            version: string;
            last_ball: string;
            last_ball_unit: string;
            witness_list_unit: string;
            parent_units: string[];
            authors: any[];
            messages: {
                app: string;
                payload_location: string;
                payload_hash: string;
                payload: {
                    inputs: import("../types/sdag").Input[];
                    outputs: {
                        address: string;
                        amount: number;
                    }[];
                };
            }[];
            headers_commission: number;
            payload_commission: number;
            timestamp: number;
            unit: any;
        };
    }>;
    transfer(opts: {
        from: string;
        to: string;
        amount: number;
        signEcdsaPubkey: string;
        msg?: string;
    }, signCallback: (hash: string) => string): Promise<{
        hash: any;
        joint: {
            skiplist_units: any[];
            unit: {
                alt: string;
                version: string;
                last_ball: string;
                last_ball_unit: string;
                witness_list_unit: string;
                parent_units: string[];
                authors: any[];
                messages: {
                    app: string;
                    payload_location: string;
                    payload_hash: string;
                    payload: {
                        inputs: import("../types/sdag").Input[];
                        outputs: {
                            address: string;
                            amount: number;
                        }[];
                    };
                }[];
                headers_commission: number;
                payload_commission: number;
                timestamp: number;
                unit: any;
            };
        };
        result: string;
    }>;
    getTps(): Promise<Tps>;
    watch(addresses: string[], callback: (msg: NotifyMessage) => void): void;
    close(): void;
}
