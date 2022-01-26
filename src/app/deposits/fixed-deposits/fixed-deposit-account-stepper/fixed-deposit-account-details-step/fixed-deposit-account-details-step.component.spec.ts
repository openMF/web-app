import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixedDepositAccountDetailsStepComponent } from './fixed-deposit-account-details-step.component';

describe('FixedDepositAccountDetailsStepComponent', () => {
  let component: FixedDepositAccountDetailsStepComponent;
  let fixture: ComponentFixture<FixedDepositAccountDetailsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositAccountDetailsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositAccountDetailsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
