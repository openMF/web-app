import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixedDepositAccountChargesStepComponent } from './fixed-deposit-account-charges-step.component';

describe('FixedDepositAccountChargesStepComponent', () => {
  let component: FixedDepositAccountChargesStepComponent;
  let fixture: ComponentFixture<FixedDepositAccountChargesStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositAccountChargesStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositAccountChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
