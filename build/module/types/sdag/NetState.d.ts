export interface NetState {
    in_bounds: Inbound[];
    out_bounds: any[];
}
interface Inbound {
    is_subscribed: boolean;
    listen_addr?: any;
    peer_addr: string;
    peer_id: string;
}
export {};
