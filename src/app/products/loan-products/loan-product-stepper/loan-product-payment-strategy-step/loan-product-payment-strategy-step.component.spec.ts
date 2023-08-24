import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductPaymentStrategyStepComponent } from './loan-product-payment-strategy-step.component';

describe('LoanProductPaymentStrategyStepComponent', () => {
  let component: LoanProductPaymentStrategyStepComponent;
  let fixture: ComponentFixture<LoanProductPaymentStrategyStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanProductPaymentStrategyStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductPaymentStrategyStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
