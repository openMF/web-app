import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductCapitalizedIncomeStepComponent } from './loan-product-capitalsed-income-step.component';

describe('LoanProductCapitalizedIncomeStepComponent', () => {
  let component: LoanProductCapitalizedIncomeStepComponent;
  let fixture: ComponentFixture<LoanProductCapitalizedIncomeStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanProductCapitalizedIncomeStepComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanProductCapitalizedIncomeStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
