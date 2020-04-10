import { Operator } from './Operator';

export interface Restriction {
    variableArray: number[];
    operator: Operator;
    constraint: number;
}