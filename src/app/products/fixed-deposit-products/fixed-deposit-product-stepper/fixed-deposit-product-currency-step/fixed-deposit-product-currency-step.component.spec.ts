import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositProductCurrencyStepComponent } from './fixed-deposit-product-currency-step.component';

describe('FixedDepositProductCurrencyStepComponent', () => {
  let component: FixedDepositProductCurrencyStepComponent;
  let fixture: ComponentFixture<FixedDepositProductCurrencyStepComponent>;

  beforeEach(async(() => {
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
