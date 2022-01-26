import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixedDepositProductTermsStepComponent } from './fixed-deposit-product-terms-step.component';

describe('FixedDepositProductTermsStepComponent', () => {
  let component: FixedDepositProductTermsStepComponent;
  let fixture: ComponentFixture<FixedDepositProductTermsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositProductTermsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositProductTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
