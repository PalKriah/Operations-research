import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimplexTableauComponent } from './simplex-tableau.component';

describe('SimplexTableauComponent', () => {
  let component: SimplexTableauComponent;
  let fixture: ComponentFixture<SimplexTableauComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimplexTableauComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimplexTableauComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
