import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositProductCurrencyStepComponent } from './recurring-deposit-product-currency-step.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('RecurringDepositProductCurrencyStepComponent', () => {
  let component: RecurringDepositProductCurrencyStepComponent;
  let fixture: ComponentFixture<RecurringDepositProductCurrencyStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecurringDepositProductCurrencyStepComponent],
      providers: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositProductCurrencyStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
