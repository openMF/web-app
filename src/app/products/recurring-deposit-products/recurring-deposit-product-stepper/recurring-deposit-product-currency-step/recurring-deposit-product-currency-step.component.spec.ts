import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositProductCurrencyStepComponent } from './recurring-deposit-product-currency-step.component';

describe('RecurringDepositProductCurrencyStepComponent', () => {
  let component: RecurringDepositProductCurrencyStepComponent;
  let fixture: ComponentFixture<RecurringDepositProductCurrencyStepComponent>;

  beforeEach(async(() => {
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
