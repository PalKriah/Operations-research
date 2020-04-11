import { Operator } from './Operator';

export interface Restriction {
    coefficientsArray: number[];
    operator: Operator;
    constraint: number;
}