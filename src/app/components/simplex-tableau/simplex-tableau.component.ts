import { Component, OnInit, Input } from '@angular/core';
import { SimplexTableau } from 'src/app/data_structures/simplexTableau';
import { Fraction } from 'src/app/data_structures/Fraction';

@Component({
  selector: 'app-simplex-tableau',
  templateUrl: './simplex-tableau.component.html',
  styleUrls: ['./simplex-tableau.component.css']
})
export class SimplexTableauComponent implements OnInit {
  @Input() simplexTableau: SimplexTableau;
  constructor() { }

  ngOnInit() {
  }

  isFraction(value): boolean {
    return typeof value != 'number';
  }

}
