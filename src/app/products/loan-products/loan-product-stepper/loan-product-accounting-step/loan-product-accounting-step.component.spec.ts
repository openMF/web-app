import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductAccountingStepComponent } from './loan-product-accounting-step.component';

describe('LoanProductAccountingStepComponent', () => {
  let component: LoanProductAccountingStepComponent;
  let fixture: ComponentFixture<LoanProductAccountingStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanProductAccountingStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductAccountingStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
