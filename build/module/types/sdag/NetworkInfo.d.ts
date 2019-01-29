export interface NetworkInfo {
    version: string;
    peers: number;
    tps: number;
    last_mci: number;
    total_units: number;
}
export interface Balance {
    address: string;
    balance: number;
    error: string;
}
