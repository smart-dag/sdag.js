export interface LightInputs {
    amount: number;
    inputs: Input[];
}
interface Input {
    message_index: number;
    output_index: number;
    unit: string;
}
export {};
