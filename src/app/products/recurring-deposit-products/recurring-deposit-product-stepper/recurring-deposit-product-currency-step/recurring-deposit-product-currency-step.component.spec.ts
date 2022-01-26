import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecurringDepositProductCurrencyStepComponent } from './recurring-deposit-product-currency-step.component';

describe('RecurringDepositProductCurrencyStepComponent', () => {
  let component: RecurringDepositProductCurrencyStepComponent;
  let fixture: ComponentFixture<RecurringDepositProductCurrencyStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringDepositProductCurrencyStepComponent ]
    })
    .compileComponents();
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
