import { ProblemType } from './ProblemType';
import { Restriction } from './Restriction';
import { TableHeaderVariable } from './TableHeaderVariable';
import { Operator } from './Operator';
import { Coordinate } from './Coordinate';
import { Fraction } from './Fraction';

export class SimplexTableau {
    coefficietsMatrix: (number | Fraction)[][] = [];
    b_vector: (number | Fraction)[] = [];
    u_vector: TableHeaderVariable[] = [];
    x_vector: TableHeaderVariable[] = [];
    v_vector: TableHeaderVariable[] = [];
    c_vector: (number | Fraction)[] = [];
    z_minus_sign: boolean;
    z_asterisk_needed: boolean = false;
    z_asterisk_vector?: (number | Fraction)[];
    optimum: number | Fraction = 0;
    has_multiple_optimum: boolean = false;
    

    constructor(problemType: ProblemType, goalFunction: number[], restrictions: Restriction[]) {
        this.generateTable(problemType, goalFunction, restrictions);
    }

    private generateTable(problemType: ProblemType, goalFunction: number[], restrictions: Restriction[]) {
        this.processGoalFunction(problemType, goalFunction);

        this.processRestrictions(restrictions);

        this.calculateVcolums();

        for (let index = 0; index < this.u_vector.length; index++) {
            if (this.u_vector[index].hasAsterisk) {
                this.z_asterisk_needed = true;
                this.calculateZAsterisk();
                break;
            }
        }
    }

    private processGoalFunction(problemType: ProblemType, goalFunction: number[]) {
        goalFunction.forEach((coefficient, index) => {
            this.x_vector.push({
                variable: "x",
                variableIndex: index,
                hasAsterisk: false
            });
            this.c_vector.push(problemType == ProblemType.Max || coefficient == 0 ? coefficient : coefficient * -1);
        });

        this.z_minus_sign = problemType == ProblemType.Max ? true : false;
    }

    private processRestrictions(restrictions: Restriction[]) {
        restrictions.forEach((restriction, j) => {
            this.coefficietsMatrix[j] = [];
            restriction.coefficientsArray.forEach((coefficient, i) => {
                this.coefficietsMatrix[j][i] = coefficient
            });
            this.b_vector[j] = restriction.constraint;
            this.u_vector[j] = {
                variable: "u",
                variableIndex: j,
                hasAsterisk: restriction.operator == Operator.LEq ? false : true
            }

            if (restriction.operator == Operator.MEq) {
                this.v_vector.push({ variable: "v", variableIndex: j, hasAsterisk: false })
            }
        });
    }

    private calculateVcolums() {
        this.v_vector.forEach(() => this.c_vector.push(0));

        this.coefficietsMatrix.forEach((array, j) =>
            this.v_vector.forEach(head => {
                if (head.variableIndex == j) {
                    this.coefficietsMatrix[j].push(-1);
                }
                else {
                    this.coefficietsMatrix[j].push(0);
                }
            })
        );

        this.x_vector = this.x_vector.concat(this.v_vector);
    }

    private calculateZAsterisk() {
        this.z_asterisk_vector = [];
        for (let i = 0; i < this.x_vector.length; i++) {
            var sum: Fraction | number = 0;
            this.coefficietsMatrix.forEach((array, j) => {
                if (this.u_vector[j].hasAsterisk) {
                    sum = Fraction.add(array[i], sum);
                }
            });
            this.z_asterisk_vector[i] = sum;
        }
        var sum: Fraction | number = 0;
        this.coefficietsMatrix.forEach((array, j) => {
            if (this.u_vector[j].hasAsterisk) {
                sum = Fraction.add(this.b_vector[j], sum);
            }
        });
        this.z_asterisk_vector.push(sum);
    }

    getGeneratingItem({ vector, zeroInclude = false }: { vector: (Fraction | number)[], zeroInclude?: boolean }): Coordinate {
        var possibleGeneratingItems: Coordinate[] = [];
        var possibleGeneratingColumns = [];
        for (let i = 0; i < this.x_vector.length; i++) {
            if ((Fraction.compare(vector[i], 0) == 1 || (zeroInclude ? Fraction.compare(vector[i], 0) == 0 : false)) && !this.x_vector[i].hasAsterisk) {
                possibleGeneratingColumns.push(i);
            }
        }

        if (possibleGeneratingColumns.length == 0) {
            return undefined;
        }

        possibleGeneratingColumns.forEach(j => {
            var possibleRowIndexesForColumn = [];
            this.u_vector.forEach((header, i) => {
                if (Fraction.compare(this.coefficietsMatrix[i][j], 0) == 1) {
                    possibleRowIndexesForColumn.push(i);
                }
            });

            if (possibleRowIndexesForColumn.length > 1) {
                var minIndex = 0;
                var minValue: Fraction | number = 4294967296;
                possibleRowIndexesForColumn.forEach(index => {
                    var divide = Fraction.divide(this.b_vector[index], this.coefficietsMatrix[index][j]);
                    if (Fraction.compare(minValue, divide) == 1) {
                        minIndex = index;
                        minValue = divide;
                    }
                });
                possibleGeneratingItems.push({ x: minIndex, y: j });
            }
            else if (possibleRowIndexesForColumn.length == 1) {
                possibleGeneratingItems.push({ x: possibleRowIndexesForColumn[0], y: j });
            }
        });

        if (possibleGeneratingItems.length == 0) {
            return undefined;
        }

        possibleGeneratingItems.forEach(element => {
            if (this.u_vector[element.x].hasAsterisk) {
                return element;
            }
        });

        return possibleGeneratingItems[0];
    }

    changeHeader(item: Coordinate) {
        var c = this.u_vector[item.x];
        this.u_vector[item.x] = this.x_vector[item.y];
        this.x_vector[item.y] = c;
    }

    generate(item: Coordinate) {
        var generatingNumber: Fraction | number = this.coefficietsMatrix[item.x][item.y];

        // Calculate row of generating item
        this.coefficietsMatrix[item.x].forEach((coefficient, index) => {
            if (index != item.y) {
                this.coefficietsMatrix[item.x][index] = Fraction.divide(this.coefficietsMatrix[item.x][index], generatingNumber);
            }
        });
        this.b_vector[item.x] = Fraction.divide(this.b_vector[item.x], generatingNumber);

        // Calculate restriction matrix
        this.coefficietsMatrix.forEach((row, i) => {
            if (i != item.x) {
                row.forEach((coefficient, j) => {
                    if (j != item.y) {
                        this.coefficietsMatrix[i][j] = Fraction.substract(this.coefficietsMatrix[i][j], Fraction.multiply(this.coefficietsMatrix[item.x][j], this.coefficietsMatrix[i][item.y]));
                    }
                });
            }
        });

        // Calculate b_vector
        this.b_vector.forEach((coefficient, j) => {
            if (j != item.x) {
                this.b_vector[j] = Fraction.substract(this.b_vector[j], Fraction.multiply(this.b_vector[item.x], this.coefficietsMatrix[j][item.y]));
            }
        });

        // Calculate z vactor
        this.c_vector.forEach((coefficient, j) => {
            if (j != item.y) {
                this.c_vector[j] = Fraction.substract(this.c_vector[j], Fraction.multiply(this.coefficietsMatrix[item.x][j], this.c_vector[item.y]));
            }
        });

        // Calculate optimum
        this.optimum = Fraction.substract(this.optimum, Fraction.multiply(this.b_vector[item.x], this.c_vector[item.y]));

        // Calculate z asterisk vector
        if (this.z_asterisk_needed) {
            for (let i = 0; i < this.z_asterisk_vector.length - 1; i++) {
                if (i != item.y) {
                    this.z_asterisk_vector[i] = Fraction.substract(this.z_asterisk_vector[i], Fraction.multiply(this.coefficietsMatrix[item.x][i], this.z_asterisk_vector[item.y]));
                }
            }
            this.z_asterisk_vector[this.z_asterisk_vector.length - 1] = Fraction.substract(this.z_asterisk_vector[this.z_asterisk_vector.length - 1], Fraction.multiply(this.b_vector[item.x], this.z_asterisk_vector[item.y]));
        }

        // Calculate column of generating item
        for (let i = 0; i < this.u_vector.length; i++) {
            if (i != item.x) {
                this.coefficietsMatrix[i][item.y] = Fraction.divide(this.coefficietsMatrix[i][item.y], Fraction.negate(generatingNumber));
            }
        }
        this.c_vector[item.y] = Fraction.divide(this.c_vector[item.y], Fraction.negate(generatingNumber));
        if (this.z_asterisk_needed) {
            this.z_asterisk_vector[item.y] = Fraction.divide(this.z_asterisk_vector[item.y], Fraction.negate(generatingNumber));
        }
        this.coefficietsMatrix[item.x][item.y] = Fraction.reciprocal(this.coefficietsMatrix[item.x][item.y]);
    }

    check(): boolean {
        if (this.z_asterisk_needed) {
            this.u_vector.forEach(header => {
                if (header.hasAsterisk) {
                    return false;
                }
            });
            this.z_asterisk_needed = false;
            return true;
        }
        else {
            this.c_vector.forEach((coefficient, index) => {
                if (Fraction.compare(coefficient, 0) == 1 && !this.x_vector[index].hasAsterisk) {
                    return false;
                }
                if (Fraction.compare(coefficient, 0) == 0 && !this.x_vector[index].hasAsterisk) {
                    this.has_multiple_optimum = true;
                    return true;
                }
            });
            return true;
        }
    }

    getResult(): { x_vector: (Fraction | number)[], u_vector: (Fraction | number)[], optimum: (Fraction | number) } {
        var x_vector: (Fraction | number)[] = [];
        var u_vector: (Fraction | number)[] = [];
        var v_vector = [];

        this.u_vector.forEach((header, index) => {
            if (header.variable == 'x') {
                x_vector[header.variableIndex] = this.b_vector[index];
            }
            else if (header.variable == 'u') {
                u_vector[header.variableIndex] = this.b_vector[index];
            }
            else {
                v_vector.push({ index: header.variableIndex, value: this.b_vector[index] });
            }
        });

        this.x_vector.forEach((header, index) => {
            if (header.variable == 'x') {
                x_vector[header.variableIndex] = 0;
            }
            else if (header.variable == 'u') {
                u_vector[header.variableIndex] = 0;
            }
            else {
                v_vector.push({ index: header.variableIndex, value: 0 });
            }
        });

        v_vector.forEach(item => u_vector[item.index] = item.value);

        return { x_vector, u_vector, optimum: this.z_minus_sign ? -this.optimum : this.optimum };
    }
}