import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositProductInterestRateChartStepComponent } from './recurring-deposit-product-interest-rate-chart-step.component';

describe('RecurringDepositProductInterestRateChartStepComponent', () => {
  let component: RecurringDepositProductInterestRateChartStepComponent;
  let fixture: ComponentFixture<RecurringDepositProductInterestRateChartStepComponent>;

  beforeEach(async(() => {
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
