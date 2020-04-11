import { ProblemType } from './data_structures/ProblemType';
import { Restriction } from './data_structures/Restriction';
import { Operator } from './data_structures/Operator';
import { SimplexTableau } from './data_structures/SimplexTableau';
import { TableHeaderVariable } from './data_structures/TableHeaderVariable';
import { Coordinate } from './data_structures/Coordinate';
import { Result } from './data_structures/Result';

export class Solver {
    private problemType: ProblemType;
    private goalFunction: number[];
    private restrictions: Restriction[];
    simplexTableau: SimplexTableau;
    result: Result = {
        start_table: undefined,
        z_asterisk_tables: [],
        z_asterisk_no_result: false,
        z_tables: [],
        z_no_result: false,
        alternative_table: [],
        optimum: null,
        u_vector: [],
        x_vector: [],
        has_result: false,
        has_alternate_result: false
    };

    constructor(problemType: ProblemType, goalFunction: number[], restrictions: Restriction[]) {
        this.problemType = problemType;
        this.goalFunction = goalFunction;
        this.restrictions = restrictions;
    }


    solve(): Result {
        //TODO: Result add original task
        this.clearNegations();
        //TODO: Result add non-negated form
        this.simplexTableau = new SimplexTableau(this.problemType, this.goalFunction, this.restrictions);
        this.result.start_table = JSON.parse(JSON.stringify(this.simplexTableau));
        var generatingItem: Coordinate;
        if (this.simplexTableau.z_asterisk_needed) {
            while ((generatingItem = this.simplexTableau.getGeneratingItem({ vector: this.simplexTableau.z_asterisk_vector })) != undefined) {
                this.simplexTableau.changeHeader(generatingItem);
                this.simplexTableau.generate(generatingItem);
                this.result.z_asterisk_tables.push(JSON.parse(JSON.stringify(this.simplexTableau)));
            }
            if (!this.simplexTableau.check()) {
                this.result.z_asterisk_no_result = true;
                return;
            }
        }
        while ((generatingItem = this.simplexTableau.getGeneratingItem({ vector: this.simplexTableau.c_vector })) != undefined) {
            this.simplexTableau.changeHeader(generatingItem);
            this.simplexTableau.generate(generatingItem);
            this.result.z_tables.push(JSON.parse(JSON.stringify(this.simplexTableau)));
        }
        if (!this.simplexTableau.check()) {
            this.result.z_no_result = true;
            return;
        }

        this.result.has_result = true;

        var result = this.simplexTableau.getResult();
        this.result.optimum = result.optimum;
        this.result.x_vector = result.x_vector;
        this.result.u_vector = result.u_vector;

        if (this.simplexTableau.has_multiple_optimum) {
            generatingItem = this.simplexTableau.getGeneratingItem({ vector: this.simplexTableau.c_vector, zeroInclude: true });
            if (generatingItem != undefined) {
                this.result.has_alternate_result = true;
                this.simplexTableau.changeHeader(generatingItem);
                this.simplexTableau.generate(generatingItem);
                this.result.alternative_table.push(JSON.parse(JSON.stringify(this.simplexTableau)));
                var result = this.simplexTableau.getResult();
                this.result.alternate_optimum = result.optimum;
                this.result.alternate_x_vector = result.x_vector;
                this.result.alternate_u_vector = result.u_vector;
            }
        }

        return this.result;
    }

    private clearNegations() {
        this.restrictions.forEach((restriction, index) => {
            if (restriction.constraint < 0) {
                var negatedArray = [];
                restriction.coefficientsArray.forEach(variable => {
                    (variable == 0 ? negatedArray.push(variable) : negatedArray.push(variable * -1));
                });

                var newOperator;
                switch (restriction.operator) {
                    case Operator.Eq:
                        newOperator = Operator.Eq;
                        break;
                    case Operator.LEq:
                        newOperator = Operator.MEq;
                        break;
                    case Operator.MEq:
                        newOperator = Operator.LEq;
                        break;
                }

                this.restrictions[index] = {
                    coefficientsArray: negatedArray,
                    operator: newOperator,
                    constraint: restriction.constraint * -1
                }
            }
        });
    }
}