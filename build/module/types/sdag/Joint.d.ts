export interface PropertyJoint {
    joint: Joint;
    property: Property;
    error: any;
}
interface Property {
    key: string;
    props: Props;
}
interface Props {
    balance: number;
    best_parent_unit: string;
    create_time: number;
    is_min_wl_increased: boolean;
    is_stable: boolean;
    is_wl_increased: boolean;
    level: number;
    limci: number;
    mci: number;
    min_wl: number;
    prev_stable_self_unit: string;
    related_units: any[];
    sequence: string;
    sub_mci: number;
    wl: number;
}
export interface Joint {
    ball: string;
    unit: Unit;
}
interface Unit {
    alt: string;
    authors: Author[];
    headers_commission: number;
    last_ball: string;
    last_ball_unit: string;
    main_chain_index: number;
    messages: Message[];
    parent_units: string[];
    payload_commission: number;
    timestamp: number;
    unit: string;
    version: string;
    witness_list_unit: string;
}
interface Message {
    app: string;
    payload: Payload;
    payload_hash: string;
    payload_location: string;
}
interface Payload {
    inputs: Input[];
    outputs: Output[];
}
interface Output {
    address: string;
    amount: number;
}
interface Input {
    message_index: number;
    output_index: number;
    unit: string;
}
interface Author {
    address: string;
    authentifiers: Authentifiers;
}
interface Authentifiers {
    r: string;
}
export interface Transaction {
    amount: number;
    from_addr: string;
    time: number;
    to_addr: string;
    unit_hash: string;
}
export {};
