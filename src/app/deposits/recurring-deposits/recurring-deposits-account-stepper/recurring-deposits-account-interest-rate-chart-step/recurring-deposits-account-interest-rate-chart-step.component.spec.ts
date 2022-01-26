import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecurringDepositsAccountInterestRateChartStepComponent } from './recurring-deposits-account-interest-rate-chart-step.component';

describe('RecurringDepositsAccountInterestRateChartStepComponent', () => {
  let component: RecurringDepositsAccountInterestRateChartStepComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountInterestRateChartStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringDepositsAccountInterestRateChartStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositsAccountInterestRateChartStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
