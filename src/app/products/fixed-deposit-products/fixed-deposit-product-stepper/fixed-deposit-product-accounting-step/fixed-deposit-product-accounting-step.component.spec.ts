import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixedDepositProductAccountingStepComponent } from './fixed-deposit-product-accounting-step.component';

describe('FixedDepositProductAccountingStepComponent', () => {
  let component: FixedDepositProductAccountingStepComponent;
  let fixture: ComponentFixture<FixedDepositProductAccountingStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositProductAccountingStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositProductAccountingStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
