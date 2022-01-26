import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecurringDepositProductInterestRateChartStepComponent } from './recurring-deposit-product-interest-rate-chart-step.component';

describe('RecurringDepositProductInterestRateChartStepComponent', () => {
  let component: RecurringDepositProductInterestRateChartStepComponent;
  let fixture: ComponentFixture<RecurringDepositProductInterestRateChartStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringDepositProductInterestRateChartStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositProductInterestRateChartStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
