import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductPaymentStrategyStepComponent } from './loan-product-payment-strategy-step.component';
import { MatDialogModule } from '@angular/material/dialog';

describe('LoanProductPaymentStrategyStepComponent', () => {
  let component: LoanProductPaymentStrategyStepComponent;
  let fixture: ComponentFixture<LoanProductPaymentStrategyStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanProductPaymentStrategyStepComponent],
      imports: [MatDialogModule]
    }).compileComponents();
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
