import { Fraction } from './Fraction';
import { TableHeaderVariable } from './TableHeaderVariable';
import { SimplexTableau } from './SimplexTableau';

export interface Result {
    
    start_table: SimplexTableau;
    z_asterisk_tables: SimplexTableau[];
    z_asterisk_no_result: boolean;
    z_tables: SimplexTableau[];
    z_no_result: boolean;
    alternative_table: SimplexTableau[];
    has_result: boolean;
    optimum: number | Fraction;
    x_vector: (number | Fraction)[];
    u_vector: (number | Fraction)[];
}