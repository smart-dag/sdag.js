export interface NetStatistics {
    ['string']: Statistic;
}
interface Statistic {
    day: Day;
    hour: Day;
    is_connected: boolean;
    min: Day;
    peer_addr: string;
    sec: Day;
}
interface Day {
    rx_bad: number;
    rx_good: number;
    tx_total: number;
}
export {};
