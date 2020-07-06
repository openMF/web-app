import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositAccountCurrencyStepComponent } from './fixed-deposit-account-currency-step.component';

describe('FixedDepositAccountCurrencyStepComponent', () => {
  let component: FixedDepositAccountCurrencyStepComponent;
  let fixture: ComponentFixture<FixedDepositAccountCurrencyStepComponent>;

  beforeEach(async(() => {
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
