import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixedDepositProductInterestRateChartStepComponent } from './fixed-deposit-product-interest-rate-chart-step.component';

describe('FixedDepositProductInterestRateChartStepComponent', () => {
  let component: FixedDepositProductInterestRateChartStepComponent;
  let fixture: ComponentFixture<FixedDepositProductInterestRateChartStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositProductInterestRateChartStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositProductInterestRateChartStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
