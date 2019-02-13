/// <reference types="node" />
import { EventEmitter } from 'events';
import { Joint, IRequestResponse, IRequestContent, PropertyJoint, Transaction, Balance, NetworkInfo, LightProps, LightInputs } from '../types/sdag';
export default class HubClient extends EventEmitter {
    private ws;
    private address;
    private pendingRequests;
    connected: boolean;
    private createSocket;
    private setup;
    connect(address?: string): Promise<boolean>;
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
    getBalance(address: string): Promise<Balance>;
    getTxsByAddress(address: string, num?: number): Promise<Transaction[]>;
    getJointsByMci(mci: number): Promise<Joint[]>;
    getJointsByLevel(minLevel: number, maxLevel: number): Promise<Joint[]>;
    getProps(address: string): Promise<LightProps>;
    getInputs(address: string, amount: number, spend_all?: boolean): Promise<LightInputs>;
    postJoint(joint: object): Promise<string>;
    close(): void;
}
