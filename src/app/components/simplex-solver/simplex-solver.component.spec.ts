import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimplexSolverComponent } from './simplex-solver.component';

describe('SimplexSolverComponent', () => {
  let component: SimplexSolverComponent;
  let fixture: ComponentFixture<SimplexSolverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimplexSolverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimplexSolverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
