export interface JointsLevelResponse {
    response: JointLevel[][];
    tag: string;
}
export interface JointLevel {
    author: Author | string;
    best_parent: string;
    is_on_mc: boolean;
    is_stable: boolean;
    level: number;
    parents: string[];
    sequence: string;
    unit: string;
}
interface Author {
    Witness: number;
}
export {};
