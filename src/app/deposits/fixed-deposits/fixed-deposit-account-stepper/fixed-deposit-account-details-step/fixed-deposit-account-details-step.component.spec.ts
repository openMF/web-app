import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositAccountDetailsStepComponent } from './fixed-deposit-account-details-step.component';

describe('FixedDepositAccountDetailsStepComponent', () => {
  let component: FixedDepositAccountDetailsStepComponent;
  let fixture: ComponentFixture<FixedDepositAccountDetailsStepComponent>;

  beforeEach(async(() => {
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
