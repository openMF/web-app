import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixedDepositProductCurrencyStepComponent } from './fixed-deposit-product-currency-step.component';

describe('FixedDepositProductCurrencyStepComponent', () => {
  let component: FixedDepositProductCurrencyStepComponent;
  let fixture: ComponentFixture<FixedDepositProductCurrencyStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositProductCurrencyStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositProductCurrencyStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
