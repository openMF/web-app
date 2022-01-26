import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixedDepositAccountCurrencyStepComponent } from './fixed-deposit-account-currency-step.component';

describe('FixedDepositAccountCurrencyStepComponent', () => {
  let component: FixedDepositAccountCurrencyStepComponent;
  let fixture: ComponentFixture<FixedDepositAccountCurrencyStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositAccountCurrencyStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositAccountCurrencyStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
