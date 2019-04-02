export interface NotifyMessage {
    from: string;
    text: string;
    time: number;
    to_msg: (number | string)[][];
    unit: string;
}
