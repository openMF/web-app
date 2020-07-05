import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositsAccountCurrencyStepComponent } from './recurring-deposits-account-currency-step.component';

describe('RecurringDepositsAccountCurrencyStepComponent', () => {
  let component: RecurringDepositsAccountCurrencyStepComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountCurrencyStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringDepositsAccountCurrencyStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositsAccountCurrencyStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
