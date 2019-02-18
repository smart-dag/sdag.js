export interface LightInputs {
    amount: number;
    inputs: Input[];
}
export interface Input {
    message_index: number;
    output_index: number;
    unit: string;
}
