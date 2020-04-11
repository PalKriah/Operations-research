export class Fraction {
    nominator: number;
    denominator: number;
    negative: boolean;

    constructor(nominator: number, denominator: number, negative: boolean) {
        this.nominator = nominator;
        this.denominator = denominator;
        this.negative = negative;
    }

    static numberToFraction(number: number): Fraction {
        return new Fraction(Math.abs(number), 1, number < 0);;
    }

    static negate(fraction: Fraction | number) {
        if (typeof fraction == 'number') {
            return -fraction;
        }
        fraction.negative = !fraction.negative;
        return fraction;
    }

    static reciprocal(fraction: Fraction | number) {
        if (typeof fraction == 'number') {
            fraction = this.numberToFraction(fraction);
        }
        return this.simplify(new Fraction(fraction.denominator, fraction.nominator, fraction.negative));
    }

    static add(f1: Fraction | number, f2: Fraction | number): Fraction | number {
        if (typeof f1 == 'number' && typeof f2 == 'number') {
            return f1 + f2;
        }
        if (typeof f1 == 'number') {
            f1 = this.numberToFraction(f1);
        }
        if (typeof f2 == 'number') {
            f2 = this.numberToFraction(f2);
        }

        var nominator = ((f1.negative ? -1 : 1) * f1.nominator) * f2.denominator + ((f2.negative ? -1 : 1) * f2.nominator) * f1.denominator;
        var denominator = f1.denominator * f2.denominator;
        var negative = false;

        if (nominator < 0) {
            nominator = -nominator;
            negative = !negative;
        }

        var resultFraction = new Fraction(nominator, denominator, negative);

        return this.simplify(resultFraction);
    }

    static substract(f1: Fraction | number, f2: Fraction | number): Fraction | number {
        if (typeof f2 == 'number') {
            f2 = -f2;
            return this.add(f1, f2);
        }
        else {
            f2.negative = !f2.negative;
            return this.add(f1, f2);
        }
    }

    static multiply(f1: Fraction | number, f2: Fraction | number): Fraction | number {
        if (typeof f1 == 'number' && typeof f2 == 'number') {
            return f1 * f2;
        }
        if (typeof f1 == 'number') {
            f1 = this.numberToFraction(f1);
        }
        if (typeof f2 == 'number') {
            f2 = this.numberToFraction(f2);
        }

        var nominator = f1.nominator * f2.nominator;
        var denominator = f1.denominator * f2.denominator;
        var negative = f1.negative ? !f2.negative : f2.negative;

        var resultFraction = new Fraction(nominator, denominator, negative);

        return this.simplify(resultFraction);
    }

    static divide(f1: Fraction | number, f2: Fraction | number): Fraction | number {
        if (typeof f1 == 'number' && typeof f2 == 'number') {
            return Fraction.simplify(new Fraction(Math.abs(f1), Math.abs(f2), f1 < 0 ? !(f2 < 0) : f2 < 0));
        }
        if (typeof f1 == 'number') {
            f1 = this.numberToFraction(f1);
        }
        if (typeof f2 == 'number') {
            f2 = this.numberToFraction(f2);
        }

        var nominator = f1.nominator * f2.denominator;
        var denominator = f1.denominator * f2.nominator;
        var negative = f1.negative ? !f2.negative : f2.negative;

        var resultFraction = new Fraction(nominator, denominator, negative);

        return this.simplify(resultFraction);
    }

    private static simplify(fraction: Fraction): Fraction | number {
        var gcd = this.gcd(fraction.nominator, fraction.denominator);
        if (gcd > 1) {
            fraction.nominator = fraction.nominator / gcd;
            fraction.denominator = fraction.denominator / gcd
        }

        if (fraction.denominator == 1 || fraction.nominator == 0) {
            return (fraction.nominator * (fraction.negative ? -1 : 1)) as number;
        }
        else {
            return fraction as Fraction;
        }
    }

    private static gcd(a: number, b: number): number {
        if (a == 0)
            return b;
        if (b == 0)
            return a;

        if (a == b)
            return a;

        if (a > b)
            return this.gcd(a - b, b);
        return this.gcd(a, b - a);
    }

    static compare(f1: Fraction | number, f2: Fraction | number): number {
        if (typeof f1 == 'number' && typeof f2 == 'number') {
            if (f1 == f2) {
                return 0;
            }
            if (f1 > f2) {
                return 1;
            }
            if (f1 < f2) {
                return -1;
            }
        }

        if (typeof f1 == 'number') {
            f1 = this.numberToFraction(f1);
        }
        if (typeof f2 == 'number') {
            f2 = this.numberToFraction(f2);
        }

        var f1Nominator = (f1.negative ? -1 : 1) * f1.nominator * f2.denominator;
        var f2Nominator = (f2.negative ? -1 : 1) * f2.nominator * f1.denominator;

        if (f1Nominator == f2Nominator) {
            return 0;
        }
        if (f1Nominator > f2Nominator) {
            return 1;
        }
        if (f1Nominator < f2Nominator) {
            return -1;
        }
    }
}