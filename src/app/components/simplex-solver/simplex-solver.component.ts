import { Component, OnInit } from '@angular/core';
import { faLongArrowAltRight, faPlus, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import { ProblemType } from '../../data_structures/ProblemType';
import { Operator } from '../../data_structures/Operator';
import { Restriction } from 'src/app/data_structures/Restriction';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Solver } from 'src/app/solver';
import { SimplexTableau } from 'src/app/data_structures/SimplexTableau';
import { Result } from 'src/app/data_structures/Result';

@Component({
  selector: 'app-simplex-solver',
  templateUrl: './simplex-solver.component.html',
  styleUrls: ['./simplex-solver.component.css']
})
export class SimplexSolverComponent implements OnInit {

  faLongArrowAltRight = faLongArrowAltRight;
  faPlus = faPlus;
  faTimesCircle = faTimesCircle;

  keys = Object.keys;
  operators = Operator;

  solved: boolean = false;
  result: Result;

  problemType: ProblemType = ProblemType.Max;
  variableCount: number = 1;
  goalFunction: number[] = [];
  restrictionsCount: number = 1;
  restrictions: Restriction[] = [
    {
      coefficientsArray: [],
      operator: Operator.LEq,
      constraint: null
    }
  ];

  solver: Solver;
  constructor(private flashMessage: FlashMessagesService) { }

  ngOnInit() {
  }

  onSolve() {
    if (this.variableCount <= 0) {
      this.flashMessage.show('Az ismeretlenek számának nagyobbnak kell lennie 0-nál!', { cssClass: 'alert-danger', timeout: 10000 });
      return;
    }

    if (this.goalFunction.length != this.variableCount || this.goalFunction.includes(undefined)) {
      this.flashMessage.show('A célfüggvénybe hiányzik az egyik kitevő!', { cssClass: 'alert-danger', timeout: 10000 });
      return;
    }

    this.goalFunction.forEach((variable, index) => {
      if (!(/^(-?[0-9]+)$/.test(variable.toString()))) {
        this.flashMessage.show('Hibás kitevő a célfüggvényben!', { cssClass: 'alert-danger', timeout: 10000 });
        return;
      }
      else {
        this.goalFunction[index] = Number(variable);
      }
    });

    if (this.restrictionsCount <= 0) {
      this.flashMessage.show('Legalább egy megkötésnek szerepeline kell!', { cssClass: 'alert-danger', timeout: 10000 });
      return;
    }

    this.restrictions.forEach((restriction, index) => {
      if (restriction.constraint == undefined) {
        this.flashMessage.show('Hiányzó számossági megkötés!', { cssClass: 'alert-danger', timeout: 10000 });
        return;
      }

      if (!(/^(-?[0-9]+)$/.test(restriction.constraint.toString()))) {
        this.flashMessage.show('Hibás számossági megkötés!', { cssClass: 'alert-danger', timeout: 10000 });
        return;
      }
      else {
        this.restrictions[index].constraint = Number(restriction.constraint);
      }

      if (restriction.coefficientsArray.length != this.variableCount || restriction.coefficientsArray.includes(undefined)) {
        this.flashMessage.show('Hiányzó kitevő az egyik megkötésben!', { cssClass: 'alert-danger', timeout: 10000 });
        return;
      }

      this.restrictions[index].operator = Operator[restriction.operator];

      restriction.coefficientsArray.forEach((variable, j) => {
        if (!(/^(-?[0-9]+)$/.test(variable.toString()))) {
          this.flashMessage.show('Hibás kitevő az egyik megkötésben!', { cssClass: 'alert-danger', timeout: 10000 });
          return;
        }
        else {
          this.restrictions[index].coefficientsArray[j] = Number(variable);
        }
      });
    });

    this.flashMessage.show('Siker!', { cssClass: 'alert-success', timeout: 10000 });

    this.solver = new Solver(this.problemType, this.goalFunction, this.restrictions);

    this.result = this.solver.solve();
    this.solved = true;
  }

  toggleType() {
    switch (this.problemType) {
      case ProblemType.Max:
        this.problemType = ProblemType.Min
        break;
      case ProblemType.Min:
        this.problemType = ProblemType.Max
        break;
    }
  }

  addRestriction() {
    this.restrictionsCount++;
    this.restrictions.push({
      coefficientsArray: [],
      operator: Operator.LEq,
      constraint: null
    });
  }

  adjustArrays() {
    this.goalFunction = this.goalFunction.slice(0, this.variableCount);
    this.restrictions.forEach((restrction, index) => {
      this.restrictions[index].coefficientsArray = restrction.coefficientsArray.slice(0, this.variableCount);
    });
  }

  deleteRestriction(index: number) {
    this.restrictions.splice(index, 1);
    this.restrictionsCount--;
  }

  isFraction(value): boolean {
    return typeof value != 'number';
  }
}
