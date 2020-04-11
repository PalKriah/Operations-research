import { Component, OnInit, Input } from '@angular/core';
import { Result } from 'src/app/data_structures/Result';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {
  @Input() result: Result;
  constructor() { }

  ngOnInit() {
  }

  isFraction(value): boolean {
    return typeof value != 'number';
  }
}
