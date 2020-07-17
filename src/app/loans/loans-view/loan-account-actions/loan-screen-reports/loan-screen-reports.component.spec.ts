import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanScreenReportsComponent } from './loan-screen-reports.component';

describe('LoanScreenReportsComponent', () => {
  let component: LoanScreenReportsComponent;
  let fixture: ComponentFixture<LoanScreenReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanScreenReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanScreenReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
