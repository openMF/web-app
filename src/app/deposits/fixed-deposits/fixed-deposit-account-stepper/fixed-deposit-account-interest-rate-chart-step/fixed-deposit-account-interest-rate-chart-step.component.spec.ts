import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositAccountInterestRateChartStepComponent } from './fixed-deposit-account-interest-rate-chart-step.component';

describe('FixedDepositAccountInterestRateChartStepComponent', () => {
  let component: FixedDepositAccountInterestRateChartStepComponent;
  let fixture: ComponentFixture<FixedDepositAccountInterestRateChartStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositAccountInterestRateChartStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositAccountInterestRateChartStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
