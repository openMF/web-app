import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixedDepositAccountTermsStepComponent } from './fixed-deposit-account-terms-step.component';

describe('FixedDepositAccountTermsStepComponent', () => {
  let component: FixedDepositAccountTermsStepComponent;
  let fixture: ComponentFixture<FixedDepositAccountTermsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositAccountTermsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositAccountTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
