declare type CommandList = 'get_net_info' | 'get_joint' | 'getunitbymci' | 'getunitsbyrange' | 'getunitsbyaddress' | 'get_balance' | 'subscribe' | 'heartbeat' | string;
export interface IRequestContent {
    command: CommandList;
    tag?: any;
    params?: string | any;
}
export interface IJustsayingResponse {
    subject: string;
    body: any;
}
export interface IRequestResponse {
    response: any;
    tag: string;
}
export {};
